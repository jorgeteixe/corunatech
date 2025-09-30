import type { CollectionEntry } from 'astro:content'
import type { EventGroup, PreparedGroup } from '../types/calendar'

export const buildKey = (year: number, month: number, day: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(
    2,
    '0'
  )}`

export const buildMonthKey = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, '0')}`

export const parseKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const formatTime = (date: Date) =>
  new Intl.DateTimeFormat('gl', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)

export const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat('gl', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)

export const weekRangeFormatter = new Intl.DateTimeFormat('gl', {
  day: 'numeric',
  month: 'short'
})

export const weekNavFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short'
})

export const weekdayLongFormatter = new Intl.DateTimeFormat('gl', {
  weekday: 'long'
})

export const monthNavFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'short',
  year: '2-digit'
})

export const shortYear = (value: number) => String(value).slice(-2)

export const formatNavText = (value: string) => {
  const cleaned = value.replace(/\./g, '').trim()
  if (!cleaned) {
    return ''
  }
  return cleaned
    .split(/\s+/)
    .map(segment =>
      segment.replace(/^[a-záéíóúñ]/iu, initial => initial.toUpperCase())
    )
    .join(' ')
}

export const buildWeekNavLabel = (startDate: Date, endDate: Date) => {
  const startLabel = formatNavText(weekNavFormatter.format(startDate))
  const endLabel = formatNavText(weekNavFormatter.format(endDate))
  return `${startLabel} – ${endLabel} '${shortYear(endDate.getFullYear())}`
}

export const prepareGroup = (group: EventGroup): PreparedGroup => {
  const visibleItems = group.items.slice(0, 5)
  const overflowItems = group.items.slice(5)
  return {
    columns: 1,
    visibleItems,
    overflowItems,
    overflow: overflowItems.length
  }
}

export const buildCommunityHref = (
  community: string,
  baseUrl: string = '/'
) => {
  const sanitizedBaseUrl = baseUrl.endsWith('/')
    ? baseUrl.slice(0, -1)
    : baseUrl
  return `${sanitizedBaseUrl}/communities/${community}`.replace(/^\/+/, '/')
}

export const getWeekdayLabels = () =>
  Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat('gl', { weekday: 'short' })
      .format(new Date(2021, 0, 4 + index))
      .replace('.', '')
  )

export const groupEventsByMonth = (events: CollectionEntry<'events'>[]) => {
  const eventsByMonth = new Map<string, CollectionEntry<'events'>[]>()

  events.forEach(event => {
    const eventDate = event.data.date
    const key = buildMonthKey(eventDate.getFullYear(), eventDate.getMonth())
    if (!eventsByMonth.has(key)) {
      eventsByMonth.set(key, [])
    }
    eventsByMonth.get(key)?.push(event)
  })

  return eventsByMonth
}

export const calculateDateRange = (
  events: CollectionEntry<'events'>[],
  now: Date
) => {
  const referenceDates =
    events.length > 0 ? events.map(event => event.data.date) : [now]
  referenceDates.push(now)

  const earliestDate = new Date(
    Math.min(...referenceDates.map(date => date.getTime()))
  )
  const latestDate = new Date(
    Math.max(...referenceDates.map(date => date.getTime()))
  )

  const rangeStart = new Date(
    earliestDate.getFullYear(),
    earliestDate.getMonth(),
    1
  )
  const rangeEnd = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1)

  return { rangeStart, rangeEnd }
}

export const generateMonthKeys = (rangeStart: Date, rangeEnd: Date) => {
  const monthKeys: string[] = []
  const cursor = new Date(rangeStart)

  while (cursor <= rangeEnd) {
    monthKeys.push(buildMonthKey(cursor.getFullYear(), cursor.getMonth()))
    cursor.setMonth(cursor.getMonth() + 1)
  }

  return monthKeys
}
