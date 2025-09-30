import type { CollectionEntry } from 'astro:content'
import type {
  CalendarEventItem,
  DayCell,
  MonthData,
  WeekEntry
} from '../types/calendar'
import {
  buildKey,
  buildMonthKey,
  buildWeekNavLabel,
  formatDateTime,
  formatNavText,
  formatTime,
  monthNavFormatter,
  parseKey,
  weekRangeFormatter
} from './calendar-utils'

export const createMonthData = (
  year: number,
  month: number,
  eventsByMonth: Map<string, CollectionEntry<'events'>[]>,
  communityNames: Record<string, string>,
  now: Date,
  todayKey: string
): MonthData => {
  const key = buildMonthKey(year, month)
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const monthEvents =
    eventsByMonth
      .get(key)
      ?.sort((a, b) => a.data.date.getTime() - b.data.date.getTime()) ?? []

  const dayEvents = new Map<string, CalendarEventItem[]>()

  monthEvents.forEach(event => {
    const eventDate = event.data.date
    const dayKey = buildKey(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate()
    )
    if (!dayEvents.has(dayKey)) {
      dayEvents.set(dayKey, [])
    }
    const items = dayEvents.get(dayKey)
    if (items) {
      items.push({
        id: event.id,
        title: event.data.title,
        community: event.data.community,
        communityName:
          communityNames[event.data.community] ?? event.data.community,
        description: event.data.description,
        location: event.data.location,
        duration: event.data.duration,
        tags: event.data.tags,
        timeLabel: formatTime(eventDate),
        dateLabel: formatDateTime(eventDate),
        rsvpLink: event.data.rsvpLink,
        isFuture: eventDate.getTime() > now.getTime()
      })
    }
  })

  const startOffset = (firstDay.getDay() + 6) % 7
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7

  const days: DayCell[] = Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startOffset + 1
    const date = new Date(year, month, dayNumber)
    const dayKey = buildKey(date.getFullYear(), date.getMonth(), date.getDate())
    const isCurrentMonth = dayNumber >= 1 && dayNumber <= lastDay.getDate()
    const eventsForDay = isCurrentMonth ? dayEvents.get(dayKey) ?? [] : []

    const groupMap = new Map<string, CalendarEventItem[]>()
    eventsForDay.forEach(item => {
      if (!groupMap.has(item.timeLabel)) {
        groupMap.set(item.timeLabel, [])
      }
      groupMap.get(item.timeLabel)?.push(item)
    })

    const groups = Array.from(groupMap.entries()).map(([timeLabel, items]) => ({
      timeLabel,
      items
    }))

    return {
      key: dayKey,
      label: date.getDate(),
      isCurrentMonth,
      isToday: dayKey === todayKey,
      groups
    }
  })

  const weeks = []
  for (let index = 0; index < totalCells; index += 7) {
    const weekDays = days.slice(index, index + 7)
    if (weekDays.length === 0) {
      continue
    }
    const startDate = parseKey(weekDays[0].key)
    const endDate = parseKey(weekDays[weekDays.length - 1].key)
    const weekLabel = `${weekRangeFormatter.format(
      startDate
    )} – ${weekRangeFormatter.format(endDate)}`
    const weekNavLabel = buildWeekNavLabel(startDate, endDate)
    weeks.push({
      key: `${weekDays[0].key}_${weekDays[weekDays.length - 1].key}`,
      label: weekLabel,
      navLabel: weekNavLabel,
      days: weekDays
    })
  }

  const monthLabel = new Intl.DateTimeFormat('gl', {
    month: 'long',
    year: 'numeric'
  }).format(firstDay)

  const monthNavLabel = formatNavText(monthNavFormatter.format(firstDay))

  return {
    key,
    label: monthLabel,
    navLabel: monthNavLabel,
    days,
    weeks
  }
}

export const createCalendarData = (
  events: CollectionEntry<'events'>[],
  communityNames: Record<string, string>,
  now: Date,
  monthKeys: string[]
) => {
  const todayKey = buildKey(now.getFullYear(), now.getMonth(), now.getDate())

  const eventsByMonth = new Map<string, CollectionEntry<'events'>[]>()
  events.forEach(event => {
    const eventDate = event.data.date
    const key = buildMonthKey(eventDate.getFullYear(), eventDate.getMonth())
    if (!eventsByMonth.has(key)) {
      eventsByMonth.set(key, [])
    }
    eventsByMonth.get(key)?.push(event)
  })

  const months: MonthData[] = monthKeys.map(key => {
    const [year, month] = key.split('-').map(Number)
    return createMonthData(
      year,
      month - 1,
      eventsByMonth,
      communityNames,
      now,
      todayKey
    )
  })

  const allWeeks: WeekEntry[] = months.flatMap((month, monthIndex) =>
    month.weeks.map(week => ({
      ...week,
      monthIndex,
      monthKey: month.key
    }))
  )

  const currentMonthKey = buildMonthKey(now.getFullYear(), now.getMonth())
  const initialMonthIndex = Math.max(
    months.findIndex(month => month.key === currentMonthKey),
    0
  )
  const initialWeekIndex = Math.max(
    allWeeks.findIndex(week => week.days.some(day => day.key === todayKey)),
    0
  )

  return {
    months,
    allWeeks,
    initialMonthIndex,
    initialWeekIndex,
    todayKey
  }
}
