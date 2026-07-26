import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { CATEGORY_SLUGS } from './lib/categories';

// A "content collection" is a typed group of content files.
// Astro validates every post's frontmatter against this schema at build time,
// so a typo like `pubdate:` instead of `pubDate:` becomes a build error
// instead of a silently broken page. (This schema-on-content idea should feel
// familiar from data engineering.)
//
// Docs: https://docs.astro.build/en/guides/content-collections/
// The frontmatter schema, exported so src/schema-parity.ts can compare it
// against the Keystatic editor schema (keystatic.config.ts). The two must
// describe the same fields; the parity check turns any drift into a type error.
export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  // Which section of the site the post belongs to. Required and restricted to
  // the slugs in src/lib/categories.ts, so a typo fails the build rather than
  // quietly dropping the post out of every section listing.
  category: z.enum(CATEGORY_SLUGS),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  // Free-form tags, e.g. ["trek", "himalaya", "philosophy"]
  tags: z.array(z.string()).default([]),
  // Optional lead image, shown on the post page and as the homepage
  // thumbnail. Path relative to /public, e.g. "/images/post-chaukhamba.jpg".
  // Nullable because Keystatic's upload field writes `null` when cleared,
  // where a hand-written post simply omits the key.
  heroImage: z.string().nullable().optional(),
  // Alt text for the image (accessibility). Describe what's in the photo.
  heroAlt: z.string().optional(),
  // Set draft: true to keep a post out of the published site.
  draft: z.boolean().default(false),
});

const blog = defineCollection({
  // Load every Markdoc file under src/content/blog/ as an entry.
  // (Posts are authored in Keystatic, which saves them as .mdoc — a
  // markdown-compatible format rendered by the @astrojs/markdoc integration.)
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/blog' }),
  schema: blogSchema,
});

export const collections = { blog };
