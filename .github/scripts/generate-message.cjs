const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');

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
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  
  // Compile and render template with Handlebars
  const template = Handlebars.compile(templateSource);
  const message = template({ events });
  
  console.log(`Generated message using template: ${templateName}`);
  console.log(`Message length: ${message.length} characters`);
  
  // Set output
  core.setOutput('message', message);
};