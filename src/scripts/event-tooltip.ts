export interface EventTooltipData {
  id: string
  title: string
  communityName: string
  description: string
  dateLabel: string
  duration: string
  location: string
  tags: string[]
  rsvpLink: string
  isFuture: boolean
}

export const extractEventDataFromElement = (
  element: HTMLElement
): EventTooltipData => {
  return {
    id: element.dataset.eventId || '',
    title: element.dataset.eventTitle || '',
    communityName: element.dataset.eventCommunityName || '',
    description: element.dataset.eventDescription || '',
    dateLabel: element.dataset.eventDateLabel || '',
    duration: element.dataset.eventDuration || '',
    location: element.dataset.eventLocation || '',
    tags: JSON.parse(element.dataset.eventTags || '[]'),
    rsvpLink: element.dataset.eventRsvpLink || '',
    isFuture: element.dataset.eventIsFuture === 'true'
  }
}

const initializeEventTooltips = (): void => {
  const calendarEvents = document.querySelectorAll(
    '.calendar-event[data-event-id]'
  ) as NodeListOf<HTMLElement>

  calendarEvents.forEach(eventButton => {
    eventButton.addEventListener('mouseenter', () => {
      showEventTooltip(eventButton)
    })

    eventButton.addEventListener('mouseleave', () => {
      if ((window as any).eventTooltip) {
        ;(window as any).eventTooltip.hideDelayed()
      }
    })

    eventButton.addEventListener('click', e => {
      e.preventDefault()
      e.stopPropagation()
      showEventTooltip(eventButton)
    })
  })
}

// Extend Window interface
declare global {
  interface Window {
    initializeEventTooltips: () => void
  }
}

// Make function available globally with proper typing
;(window as any).initializeEventTooltips = initializeEventTooltips

// Export to make this a module
export {}

const showEventTooltip = (eventButton: HTMLElement) => {
  const eventTooltip = (window as any).eventTooltip
  if (!eventTooltip) return

  const eventData = extractEventDataFromElement(eventButton)
  eventTooltip.show(eventData, eventButton)
}
