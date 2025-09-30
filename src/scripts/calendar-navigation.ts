interface CalendarNavigationElements {
  root: HTMLElement
  months: HTMLElement[]
  weeks: HTMLElement[]
  label: HTMLElement | null
  prevButton: HTMLButtonElement | null
  nextButton: HTMLButtonElement | null
}

interface CalendarNavigationState {
  monthIndex: number
  weekIndex: number
  isMobile: boolean
  matcher: MediaQueryList
}

const initializeCalendarNavigation = (): void => {
  const root = document.querySelector('[data-calendar-root]') as HTMLElement
  if (!root) return

  const elements: CalendarNavigationElements = {
    root,
    months: Array.from(root.querySelectorAll('[data-calendar-month]')),
    weeks: Array.from(root.querySelectorAll('[data-calendar-week]')),
    label: root.querySelector('[data-calendar-label]'),
    prevButton: root.querySelector('[data-action="prev"]'),
    nextButton: root.querySelector('[data-action="next"]')
  }

  const matcher = window.matchMedia('(max-width: 768px)')
  const state: CalendarNavigationState = {
    monthIndex: Number(root.dataset.initialMonthIndex || 0),
    weekIndex: Number(root.dataset.initialWeekIndex || 0),
    isMobile: matcher.matches,
    matcher
  }

  const updateMonthView = (): void => {
    elements.months.forEach((month, index) => {
      const active = index === state.monthIndex
      month.classList.toggle('calendar-month--active', active)

      if (active) {
        month.removeAttribute('aria-hidden')
      } else {
        month.setAttribute('aria-hidden', 'true')
      }
    })

    elements.weeks.forEach(week => {
      week.classList.remove('calendar-week--active')
      week.setAttribute('aria-hidden', 'true')
    })

    const activeMonth = elements.months[state.monthIndex]
    if (elements.label) {
      elements.label.textContent = activeMonth?.dataset.navLabel || ''
    }

    if (elements.prevButton) {
      elements.prevButton.disabled = state.monthIndex === 0
    }

    if (elements.nextButton) {
      elements.nextButton.disabled =
        state.monthIndex === elements.months.length - 1
    }
  }

  const updateWeekView = (): void => {
    elements.weeks.forEach((week, index) => {
      const active = index === state.weekIndex
      week.classList.toggle('calendar-week--active', active)

      if (active) {
        week.removeAttribute('aria-hidden')
      } else {
        week.setAttribute('aria-hidden', 'true')
      }
    })

    elements.months.forEach(month => {
      month.classList.remove('calendar-month--active')
      month.setAttribute('aria-hidden', 'true')
    })

    const activeWeek = elements.weeks[state.weekIndex]
    if (elements.label) {
      elements.label.textContent = activeWeek?.dataset.weekNavLabel || ''
    }

    if (elements.prevButton) {
      elements.prevButton.disabled = state.weekIndex === 0
    }

    if (elements.nextButton) {
      elements.nextButton.disabled =
        state.weekIndex === elements.weeks.length - 1
    }
  }

  const syncView = (): void => {
    elements.root.dataset.view = state.isMobile ? 'week' : 'month'

    if (state.isMobile) {
      if (elements.weeks.length === 0) {
        disableNavigation()
        return
      }
      updateWeekView()
    } else {
      if (elements.months.length === 0) {
        disableNavigation()
        return
      }
      updateMonthView()
    }
  }

  const disableNavigation = (): void => {
    if (elements.label) {
      elements.label.textContent = ''
    }
    if (elements.prevButton) {
      elements.prevButton.disabled = true
    }
    if (elements.nextButton) {
      elements.nextButton.disabled = true
    }
  }

  const handlePrevious = (): void => {
    if (state.isMobile) {
      if (state.weekIndex > 0) {
        state.weekIndex -= 1
        syncView()
      }
    } else if (state.monthIndex > 0) {
      state.monthIndex -= 1
      syncView()
    }
  }

  const handleNext = (): void => {
    if (state.isMobile) {
      if (state.weekIndex < elements.weeks.length - 1) {
        state.weekIndex += 1
        syncView()
      }
    } else if (state.monthIndex < elements.months.length - 1) {
      state.monthIndex += 1
      syncView()
    }
  }

  const handleMediaChange = (event: MediaQueryListEvent): void => {
    state.isMobile = event.matches
    syncView()
  }

  // Set up event listeners
  if (elements.prevButton) {
    elements.prevButton.addEventListener('click', handlePrevious)
  }

  if (elements.nextButton) {
    elements.nextButton.addEventListener('click', handleNext)
  }

  // Handle media query changes with fallback for older browsers
  if (typeof state.matcher.addEventListener === 'function') {
    state.matcher.addEventListener('change', handleMediaChange)
  } else if (typeof (state.matcher as any).addListener === 'function') {
    ;(state.matcher as any).addListener(handleMediaChange)
  }

  // Initialize view
  syncView()
}

// Extend Window interface
declare global {
  interface Window {
    initializeCalendarNavigation: () => void
  }
}

// Make function available globally with proper typing
;(window as any).initializeCalendarNavigation = initializeCalendarNavigation

// Export to make this a module
export {}
