module.exports = ({ github, context, core, process }) => {
  return async () => {
    // Parse the JSON from github-issue-parser
    const parsedIssue = JSON.parse(process.env.PARSED_ISSUE);
    
    // Extract all fields
    const title = parsedIssue.title || '';
    const description = parsedIssue.description || '';
    const dateStr = parsedIssue.date || '';
    const duration = parsedIssue.duration || '';
    const location = parsedIssue.location || '';
    const rsvp = parsedIssue.rsvp || '';
    const community = parsedIssue.community || '';
    const tags = parsedIssue.tags || '';
    
    // Validation
    const errors = [];
    
    if (!title) errors.push('Título do evento é obrigatorio');
    if (!description) errors.push('Descrición é obrigatoria');
    if (description && description.length > 300) errors.push('Descrición debe ter menos de 300 caracteres');
    if (!dateStr) errors.push('Data e hora son obrigatorias');
    if (!community) errors.push('Comunidade organizadora é obrigatoria');
    if (!tags) errors.push('Etiquetas son obrigatorias');
    if (tags && tags.split(',').length < 2) errors.push('Mínimo 2 etiquetas son necesarias');
    
    // Validate date format
    let eventDate = null;
    if (dateStr) {
      try {
        eventDate = new Date(dateStr);
        if (isNaN(eventDate.getTime())) {
          errors.push('Formato de data inválido. Usa ISO 8601: YYYY-MM-DDTHH:MM:SSZ');
        } else if (eventDate < new Date()) {
          errors.push('A data do evento non pode estar no pasado');
        }
      } catch (e) {
        errors.push('Formato de data inválido. Usa ISO 8601: YYYY-MM-DDTHH:MM:SSZ');
      }
    }
    
    // Validate community exists
    const validCommunities = ['gpul', 'python-coruna', 'coruna-wtf'];
    if (community && !validCommunities.includes(community)) {
      errors.push(`Comunidade organizadora debe ser unha das seguintes: ${validCommunities.join(', ')}`);
    }
    
    // Validate URLs
    if (rsvp && !rsvp.startsWith('https://')) errors.push('Enlace de inscrición debe empezar por https://');
    
    // Validate duration format
    if (duration && !/^(\d+h|\d+min|\d+h\d+min)$/.test(duration)) {
      errors.push('Formato de duración inválido. Usa: Xh, XXmin, ou XhXXmin');
    }
    
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
    
    // Generate slug from title and date
    const dateSlug = eventDate.toISOString().split('T')[0];
    const titleSlug = title.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-')
      .substring(0, 40); // Limit length
    
    const slug = `${titleSlug}-${dateSlug}`;
    
    // Create YAML content
    let yamlContent = `title: ${title}\n`;
    yamlContent += `description: ${description}\n`;
    yamlContent += `date: ${eventDate.toISOString()}\n`;
    if (duration) yamlContent += `duration: ${duration}\n`;
    if (location) yamlContent += `location: ${location}\n`;
    if (rsvp) yamlContent += `rsvpLink: ${rsvp}\n`;
    yamlContent += `tags: [${tags.split(',').map(t => t.trim()).join(', ')}]\n`;
    yamlContent += `community: ${community}\n`;
    
    // Set outputs
    core.setOutput('slug', slug);
    core.setOutput('title', title);
    core.setOutput('community', community);
    core.setOutput('date', eventDate.toISOString());
    core.setOutput('yaml_content', yamlContent);
    core.setOutput('valid', 'true');
  };
};