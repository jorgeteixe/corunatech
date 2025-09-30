import { SITE_CONFIG } from './constants'

export const buildImageUrl = (
  siteUrl: string | undefined,
  imagePath: string
): string => {
  if (!siteUrl) return imagePath
  return `${siteUrl}${imagePath}`
}

export const getDefaultImage = (): string => {
  return SITE_CONFIG.DEFAULT_IMAGE
}

export const buildFullUrl = (baseUrl: string, path: string): string => {
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${cleanBase}${cleanPath}`
}
