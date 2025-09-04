const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = async ({ github, context, core }) => {
  // Get parameters from environment
  const startDateStr = process.env.START_DATE;
  const endDateStr = process.env.END_DATE;
  
  if (!startDateStr || !endDateStr) {
    throw new Error('START_DATE and END_DATE environment variables are required');
  }
  
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  
  console.log(`Looking for events between ${startDate.toISOString()} and ${endDate.toISOString()}`);
  
  // Read all community files to build a lookup map
  const communitiesDir = path.join(process.cwd(), 'src/content/communities');
  const communityFiles = fs.readdirSync(communitiesDir).filter(file => file.endsWith('.yaml'));
  
  const communityLookup = {};
  for (const file of communityFiles) {
    try {
      const content = fs.readFileSync(path.join(communitiesDir, file), 'utf8');
      const community = yaml.load(content);
      
      if (community && community.name) {
        // Use filename without extension as slug
        const slug = path.basename(file, '.yaml');
        communityLookup[slug] = community.name;
      }
    } catch (error) {
      console.error(`Error reading community ${file}:`, error);
    }
  }
  
  console.log(`Loaded ${Object.keys(communityLookup).length} communities`);
  
  // Read all event files
  const eventsDir = path.join(process.cwd(), 'src/content/events');
  const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.yaml'));
  
  const events = [];
  
  for (const file of eventFiles) {
    try {
      const content = fs.readFileSync(path.join(eventsDir, file), 'utf8');
      const event = yaml.load(content);
      
      if (event && event.date) {
        const eventDate = new Date(event.date);
        if (eventDate >= startDate && eventDate < endDate) {
          // Format dates for template
          const formattedDate = eventDate.toLocaleDateString('gl', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: 'Europe/Madrid'
          });
          const formattedTime = eventDate.toLocaleTimeString('gl', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Europe/Madrid'
          });
          
          // Lookup community name from slug
          const communityName = communityLookup[event.community] || event.community;
          
          events.push({
            ...event,
            community: communityName,
            communitySlug: event.community,
            date: eventDate,
            formattedDate,
            formattedTime,
            file: file
          });
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }
  
  // Sort events by date
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log(`Found ${events.length} events for the specified range`);
  
  // Set outputs as JSON
  core.setOutput('events', JSON.stringify(events));
  core.setOutput('events_count', events.length);
  core.setOutput('has_events', events.length > 0);
};