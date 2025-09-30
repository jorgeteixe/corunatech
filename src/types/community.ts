export interface SocialLink {
  name: string
  url: string
}

export interface Community {
  name: string
  description: string
  website?: string
  logo?: string
  socials?: SocialLink[]
  tags: string[]
  technologies?: string[]
  meetingFrequency?: string
  contactEmail?: string
}

export interface CommunityCollection {
  id: string
  slug: string
  data: Community
}
