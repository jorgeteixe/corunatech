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

export const collections = {
  communities,
};
