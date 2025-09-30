import type { CollectionEntry } from 'astro:content'

export type CalendarEventItem = {
  id: string
  title: string
  community: string
  communityName: string
  description: string
  location?: string
  duration?: string
  tags: string[]
  timeLabel: string
  dateLabel: string
  rsvpLink?: string
  isFuture: boolean
}

export type EventGroup = {
  timeLabel: string
  items: CalendarEventItem[]
}

export type DayCell = {
  key: string
  label: number
  isCurrentMonth: boolean
  isToday: boolean
  groups: EventGroup[]
}

export type MonthWeek = {
  key: string
  label: string
  navLabel: string
  days: DayCell[]
}

export type MonthData = {
  key: string
  label: string
  navLabel: string
  days: DayCell[]
  weeks: MonthWeek[]
}

export type WeekEntry = MonthWeek & {
  monthIndex: number
  monthKey: string
}

export type PreparedGroup = {
  columns: number
  visibleItems: CalendarEventItem[]
  overflowItems: CalendarEventItem[]
  overflow: number
}

export type CalendarProps = {
  events: CollectionEntry<'events'>[]
  communityNames: Record<string, string>
}
