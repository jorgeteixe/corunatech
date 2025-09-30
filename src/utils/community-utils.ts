import type { CollectionEntry } from 'astro:content'

export function separateEventsByDate(events: CollectionEntry<'events'>[]) {
  const now = new Date()

  const upcomingEvents = events
    .filter(event => new Date(event.data.date) > now)
    .sort(
      (a, b) =>
        new Date(a.data.date).getTime() - new Date(b.data.date).getTime()
    )

  const pastEvents = events
    .filter(event => new Date(event.data.date) <= now)
    .sort(
      (a, b) =>
        new Date(b.data.date).getTime() - new Date(a.data.date).getTime()
    )

  return { upcomingEvents, pastEvents }
}

export function getCommunitySlug(communityId: string): string {
  return communityId.replace(/\.yaml$/, '')
}

export async function getCommunityEvents(
  getCollection: any,
  communitySlug: string
): Promise<CollectionEntry<'events'>[]> {
  return await getCollection(
    'events',
    ({ data }: CollectionEntry<'events'>) => data.community === communitySlug
  )
}
