export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const isEmpty = (value: string | null | undefined): boolean => {
  return !value || value.trim().length === 0
}

export const isNotEmpty = (value: string | null | undefined): boolean => {
  return !isEmpty(value)
}
