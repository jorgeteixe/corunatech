import { SITE_CONFIG } from './constants'

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat(SITE_CONFIG.LOCALE, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const formatTime = (date: Date): string => {
  return new Intl.DateTimeFormat(SITE_CONFIG.LOCALE, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

export const isDateInFuture = (date: Date): boolean => {
  return new Date(date) > new Date()
}

export const formatShortDate = (date: Date): string => {
  return new Intl.DateTimeFormat(SITE_CONFIG.LOCALE, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}
