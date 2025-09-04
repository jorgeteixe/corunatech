const fs = require('fs');
const path = require('path');

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
  
  // Read all event files
  const eventsDir = path.join(process.cwd(), 'src/content/events');
  const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.yaml'));
  
  const events = [];
  
  for (const file of eventFiles) {
    try {
      const content = fs.readFileSync(path.join(eventsDir, file), 'utf8');
      const lines = content.split('\n');
      const event = {};
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split(':');
          if (key && valueParts.length > 0) {
            const value = valueParts.join(':').trim();
            event[key.trim()] = value;
          }
        }
      }
      
      if (event.date) {
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
          
          events.push({
            ...event,
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