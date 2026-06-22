import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// A "content collection" is a typed group of content files.
// Astro validates every post's frontmatter against this schema at build time,
// so a typo like `pubdate:` instead of `pubDate:` becomes a build error
// instead of a silently broken page. (This schema-on-content idea should feel
// familiar from data engineering.)
//
// Docs: https://docs.astro.build/en/guides/content-collections/
const blog = defineCollection({
  // Load every Markdown file under src/content/blog/ as an entry.
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Free-form tags, e.g. ["trek", "himalaya", "philosophy"]
    tags: z.array(z.string()).default([]),
    // Optional lead image, shown on the post page and as the homepage
    // thumbnail. Path relative to /public, e.g. "/images/post-chaukhamba.jpg".
    heroImage: z.string().optional(),
    // Alt text for the image (accessibility). Describe what's in the photo.
    heroAlt: z.string().optional(),
    // Set draft: true to keep a post out of the published site.
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
