module.exports = ({ github, context, core }) => {
  return async (type, data) => {
    const isEvent = type === 'event';
    const title = isEvent ? data.title : data.name;
    const fileType = isEvent ? 'eventos' : 'comunidades';
    const filePath = isEvent ? `src/content/events/${data.slug}.yaml` : `src/content/communities/${data.slug}.yaml`;
    
    // Create PR
    const { data: pr } = await github.rest.pulls.create({
      owner: context.repo.owner,
      repo: context.repo.repo,
      title: `feat: engade ${isEvent ? 'evento' : 'comunidade'} ${title}`,
      head: process.env.BRANCH,
      base: 'main',
      body: isEvent ? 
        `## Novo Evento: ${data.title}

Esta PR engade un novo evento a CoruñaTech.

### Información do Evento
- **Título**: ${data.title}
- **Comunidade**: ${data.community}
- **Data**: ${new Date(data.date).toLocaleDateString('gl', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  hour: '2-digit', minute: '2-digit'
})}
- **Ficheiro**: \`${filePath}\`

### Cambios
- ✅ Evento validado automaticamente
- ✅ Data válida (futuro)
- ✅ Comunidade organizadora verificada
- ✅ Ficheiro YAML creado
- ✅ Formato correcto

Closes #${context.issue.number}

---
🤖 *Esta PR foi creada automaticamente a partir do issue #${context.issue.number}*` :
        `## Nova Comunidade: ${data.name}

Esta PR engade unha nova comunidade tecnolóxica a CoruñaTech.

### Información da Comunidade
- **Nome**: ${data.name}
- **Ficheiro**: \`${filePath}\`

### Cambios
- ✅ Comunidade validada automaticamente
- ✅ Ficheiro YAML creado
- ✅ Formato correcto

Closes #${context.issue.number}

---
🤖 *Esta PR foi creada automaticamente a partir do issue #${context.issue.number}*`
    });
    
    // Add labels to PR
    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pr.number,
      labels: [isEvent ? 'event' : 'community', 'automated']
    });
    
    // Comment on original issue
    await github.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      body: `✅ **${isEvent ? 'Evento' : 'Comunidade'} validado correctamente!**

Creouse automaticamente a Pull Request #${pr.number} para engadir ${isEvent ? 'este evento' : 'esta comunidade'}.

📁 Ficheiro creado: \`${filePath}\`
🔗 PR: #${pr.number}
${isEvent ? `📅 Data: ${new Date(data.date).toLocaleDateString('gl', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  hour: '2-digit', minute: '2-digit'
})}` : ''}

${isEvent ? 'O evento' : 'A comunidade'} aparecerá na web unha vez que se aprobe e merge a PR.`
    });

    // Add label to issue
    await github.rest.issues.addLabels({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: context.issue.number,
      labels: ['validated', 'pr-created']
    });
  };
};