const fs = require('fs');
const path = require('path');

module.exports = async ({ github, context, core }) => {
  // Get current date in Madrid timezone
  const now = new Date();
  const madridNow = new Date(now.toLocaleString("en-US", {timeZone: "Europe/Madrid"}));
  
  // Calculate next week range (next 7 days)
  const nextWeekStart = new Date(madridNow);
  nextWeekStart.setHours(0, 0, 0, 0);
  const nextWeekEnd = new Date(nextWeekStart);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);
  
  console.log(`Looking for events between ${nextWeekStart.toISOString()} and ${nextWeekEnd.toISOString()}`);
  
  // Read all event files
  const eventsDir = path.join(process.cwd(), 'src/content/events');
  const eventFiles = fs.readdirSync(eventsDir).filter(file => file.endsWith('.yaml'));
  
  const upcomingEvents = [];
  
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
        if (eventDate >= nextWeekStart && eventDate < nextWeekEnd) {
          upcomingEvents.push({
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
  
  // Sort events by date
  upcomingEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  console.log(`Found ${upcomingEvents.length} events for next week`);
  
  // Format message
  let message = "🗓️ *Eventos da próxima semana en CoruñaTech*\n\n";
  
  if (upcomingEvents.length === 0) {
    message += "Non hai eventos programados para a próxima semana.\n\n";
  } else {
    for (const event of upcomingEvents) {
      const eventDate = new Date(event.date);
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
      
      message += `📅 *${event.title}*\n`;
      message += `🏢 Comunidade: ${event.community}\n`;
      message += `📍 Data: ${formattedDate} ás ${formattedTime}\n`;
      if (event.location) {
        message += `🏠 Lugar: ${event.location}\n`;
      }
      if (event.rsvpLink) {
        message += `🔗 Inscribirse: ${event.rsvpLink}\n`;
      }
      message += `\n`;
    }
  }
  
  message += `Máis información: https://jorgeteixe.github.io/corunatech\n`;
  message += `#CoruñaTech #EventosGalicia`;
  
  core.setOutput('message', message);
  core.setOutput('has_events', upcomingEvents.length > 0);
};