const fs = require('fs');
const path = require('path');

module.exports = async ({ github, context, core }) => {
  // Get current date in Madrid timezone
  const now = new Date();
  const madridNow = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Madrid"}));
  
  // Calculate today's range
  const todayStart = new Date(madridNow);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);
  
  console.log(`Looking for events between ${todayStart.toISOString()} and ${todayEnd.toISOString()}`);
  
  // Read all event files
  const eventsDir = path.join(process.cwd(), 'src/content/events');
  const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.yaml'));
  
  const todayEvents = [];
  
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
        if (eventDate >= todayStart && eventDate < todayEnd) {
          todayEvents.push({
            ...event,
            date: eventDate,
            file: file
          });
        }
      }
    } catch (error) {
      console.error(`Error reading ${file}:`, error);
    }
  }
  
  // Sort events by time
  todayEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log(`Found ${todayEvents.length} events for today`);
  
  // Only process if there are events today
  if (todayEvents.length === 0) {
    console.log('No events today, skipping notification');
    core.setOutput('has_events', false);
    return;
  }
  
  // Format message
  let message = "🌅 *Eventos de hoxe en CoruñaTech*\n\n";
  
  for (const event of todayEvents) {
    const eventDate = new Date(event.date);
    const formattedTime = eventDate.toLocaleTimeString('gl', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid'
    });
    
    message += `📅 *${event.title}*\n`;
    message += `🏢 Comunidade: ${event.community}\n`;
    message += `⏰ Hora: ${formattedTime}\n`;
    if (event.location) {
      message += `🏠 Lugar: ${event.location}\n`;
    }
    if (event.duration) {
      message += `⏱️ Duración: ${event.duration}\n`;
    }
    if (event.rsvpLink) {
      message += `🔗 Inscribirse: ${event.rsvpLink}\n`;
    }
    message += `\n`;
  }
  
  message += `Máis información: https://jorgeteixe.github.io/corunatech\n`;
  message += `#CoruñaTech #EventosHoxe`;
  
  core.setOutput('message', message);
  core.setOutput('has_events', true);
};