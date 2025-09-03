module.exports = ({ github, context, core, process }) => {
  return async () => {
    // Parse the JSON from github-issue-parser
    const parsedIssue = JSON.parse(process.env.PARSED_ISSUE);
    
    // Extract all fields
    const name = parsedIssue.name || '';
    const description = parsedIssue.description || '';
    const website = parsedIssue.website || '';
    const logo = parsedIssue.logo || '';
    const socialsRaw = parsedIssue.socials || '';
    const tags = parsedIssue.tags || '';
    const technologies = parsedIssue.technologies || '';
    const frequency = parsedIssue.frequency || '';
    const contact = parsedIssue.contact || '';
    
    // Validation
    const errors = [];
    
    if (!name) errors.push('Nome da comunidade é obrigatorio');
    if (!description) errors.push('Descrición é obrigatoria');
    if (description && description.length > 200) errors.push('Descrición debe ter menos de 200 caracteres');
    if (!tags) errors.push('Etiquetas son obrigatorias');
    if (tags && tags.split(',').length < 3) errors.push('Mínimo 3 etiquetas son necesarias');
    
    // Validate URLs
    if (website && !website.startsWith('https://')) errors.push('Sitio web debe empezar por https://');
    if (logo && !logo.startsWith('https://')) errors.push('Logo debe empezar por https://');
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (contact && !emailRegex.test(contact)) errors.push('Email de contacto ten formato inválido');
    
    if (errors.length > 0) {
      // Comment with errors
      await github.rest.issues.createComment({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        body: `❌ **Erro na validación**\n\nProblemas atopados:\n${errors.map(e => `- ${e}`).join('\n')}\n\nPor favor, edita o issue e corrixe estos problemas.`
      });
      
      await github.rest.issues.addLabels({
        owner: context.repo.owner,
        repo: context.repo.repo,
        issue_number: issue.number,
        labels: ['validation-failed']
      });
      
      core.setFailed('Validation failed');
      return;
    }
    
    // Generate slug
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    // Parse socials
    const socials = [];
    if (socialsRaw) {
      const socialLines = socialsRaw.split('\n').filter(line => line.trim());
      for (const line of socialLines) {
        const parts = line.split(' - ');
        if (parts.length === 2) {
          socials.push({
            name: parts[0].trim(),
            url: parts[1].trim()
          });
        }
      }
    }
    
    // Create YAML content
    let yamlContent = `name: ${name}\n`;
    yamlContent += `description: ${description}\n`;
    if (website) yamlContent += `website: ${website}\n`;
    if (logo) yamlContent += `logo: ${logo}\n`;
    if (socials.length > 0) {
      yamlContent += `socials:\n`;
      for (const social of socials) {
        yamlContent += `  - name: ${social.name}\n    url: ${social.url}\n`;
      }
    }
    yamlContent += `tags: [${tags.split(',').map(t => t.trim()).join(', ')}]\n`;
    if (technologies) yamlContent += `technologies: [${technologies.split(',').map(t => t.trim()).join(', ')}]\n`;
    if (frequency && frequency !== 'Non especificado') yamlContent += `meetingFrequency: ${frequency}\n`;
    if (contact) yamlContent += `contactEmail: ${contact}\n`;
    
    // Set outputs
    core.setOutput('slug', slug);
    core.setOutput('name', name);
    core.setOutput('yaml_content', yamlContent);
    core.setOutput('valid', 'true');
  };
};