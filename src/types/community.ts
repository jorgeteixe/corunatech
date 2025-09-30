import type { CollectionEntry } from 'astro:content'

export type CommunityData = {
  name: string
  description: string
  logo?: string
  website?: string
  socials?: Array<{
    name: string
    url: string
  }>
  tags?: string[]
  technologies?: string[]
  meetingFrequency?: string
}

export type CommunityProps = {
  community: CollectionEntry<'communities'>
}

export type CommunityEventSection = {
  title: string
  events: CollectionEntry<'events'>[]
  emptyMessage: string
  isPast?: boolean
}

export type CommunityHeaderProps = {
  name: string
  description: string
  logo?: string
  website?: string
  socials?: Array<{
    name: string
    url: string
  }>
}

export type CommunityMetadataProps = {
  technologies?: string[]
  meetingFrequency?: string
}

export type CommunityEventsProps = {
  upcomingEvents: CollectionEntry<'events'>[]
  pastEvents: CollectionEntry<'events'>[]
  communityName: string
}
