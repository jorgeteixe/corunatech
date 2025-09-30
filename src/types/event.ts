export interface Event {
  title: string
  description: string
  date: Date
  endDate?: Date
  duration?: string
  location?: string
  rsvpLink?: string
  tags: string[]
  community: string
}

export interface EventCollection {
  id: string
  slug: string
  data: Event
}
