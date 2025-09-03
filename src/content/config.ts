import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const communities = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/communities" }),
  schema: z.object({
    slug: z.string(),
    name: z.string(),
    description: z.string(),
    website: z.string().url().optional(),
    logo: z.string().optional(),
    socials: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
        })
      )
      .optional(),
    tags: z.array(z.string()),
    technologies: z.array(z.string()).optional(),
    meetingFrequency: z.string().optional(),
    contactEmail: z.string().email().optional(),
  }),
});

const events = defineCollection({
  loader: glob({ pattern: "*.yaml", base: "./src/content/events" }),
  schema: z.object({
    slug: z.string(),
    title: z.string(),
    description: z.string(),
    date: z.date(),
    endDate: z.date().optional(),
    duration: z.string().optional(), // e.g. "2h", "90min"
    location: z.string().optional(),
    rsvpLink: z.string().url().optional(),
    tags: z.array(z.string()),
    community: z.string(), // References the community slug
  }),
});

export const collections = {
  communities,
  events,
};
