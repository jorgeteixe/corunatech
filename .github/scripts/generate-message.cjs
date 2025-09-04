const fs = require('fs');
const path = require('path');

// Simple handlebars-like template renderer
function renderTemplate(template, data) {
  let result = template;
  
  // Handle {{#if condition}} blocks
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    return data[condition] && (Array.isArray(data[condition]) ? data[condition].length > 0 : data[condition]) ? content : '';
  });
  
  // Handle {{#each array}} blocks
  result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayName, content) => {
    const array = data[arrayName];
    if (!Array.isArray(array) || array.length === 0) return '';
    
    return array.map(item => {
      let itemContent = content;
      // Replace {{property}} with item values
      itemContent = itemContent.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
        return item[prop] || '';
      });
      // Handle {{#if property}} within each
      itemContent = itemContent.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, innerContent) => {
        return item[condition] ? innerContent : '';
      });
      return itemContent;
    }).join('');
  });
  
  // Handle simple {{property}} replacements
  result = result.replace(/\{\{(\w+)\}\}/g, (match, prop) => {
    return data[prop] || '';
  });
  
  return result;
}

module.exports = async ({ github, context, core }) => {
  // Get parameters from environment
  const templateName = process.env.TEMPLATE_NAME;
  const eventsJson = process.env.EVENTS_JSON;
  
  if (!templateName || !eventsJson) {
    throw new Error('TEMPLATE_NAME and EVENTS_JSON environment variables are required');
  }
  
  // Parse events
  const events = JSON.parse(eventsJson);
  
  // Read template file
  const templatePath = path.join(process.cwd(), '.github/templates', `${templateName}.md`);
  const template = fs.readFileSync(templatePath, 'utf8');
  
  // Render template
  const message = renderTemplate(template, { events });
  
  console.log(`Generated message using template: ${templateName}`);
  console.log(`Message length: ${message.length} characters`);
  
  // Set output
  core.setOutput('message', message);
};