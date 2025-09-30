export const SITE_CONFIG = {
  DEFAULT_IMAGE: '/meta.png',
  BASE_PATH: '/corunatech',
  LOCALE: 'gl'
} as const

export const FAVICON_PATHS = {
  APPLE_TOUCH: '/corunatech/apple-touch-icon.png',
  FAVICON_32: '/corunatech/favicon-32x32.png',
  FAVICON_16: '/corunatech/favicon-16x16.png',
  MANIFEST: '/corunatech/site.webmanifest'
} as const

export const THEME_CONFIG = {
  STORAGE_KEY: 'theme',
  DEFAULT_THEME: 'light',
  DARK_THEME: 'dark',
  ATTRIBUTE_NAME: 'data-theme'
} as const

export const NAVIGATION_LINKS = {
  COMMUNITIES: '#comunidades',
  EVENTS: '#eventos'
} as const
