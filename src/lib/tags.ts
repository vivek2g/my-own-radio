import type { CollectionEntry } from 'astro:content';

export interface TagGroup {
  slug: string;
  label: string;
  posts: CollectionEntry<'blog'>[];
}

// Turns a free-form tag string into a URL-safe slug. Order matters: collapse
// whitespace to hyphens *before* stripping everything else, or "long trek"
// becomes "longtrek" instead of "long-trek". Also strips stray punctuation
// some tags are typed with (e.g. "#thewalk").
// Strips a leading '#' some tags are typed with (e.g. "#thewalk") — every
// display site prepends its own '#', so an already-hashed tag would
// otherwise render "##thewalk".
export function tagLabel(raw: string): string {
  return raw.trim().replace(/^#+/, '');
}

export function slugifyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Groups posts by tag slug so tags differing only in case/typography (or a
// stray '#') collapse into one page. Display label is the first-seen
// spelling (posts arrive newest-first, so the newest post's spelling wins).
export function getAllTags(posts: CollectionEntry<'blog'>[]): TagGroup[] {
  const bySlug = new Map<string, TagGroup>();

  for (const post of posts) {
    for (const raw of post.data.tags) {
      const label = tagLabel(raw);
      const slug = slugifyTag(label);
      if (!slug) continue; // defensive: an all-symbol tag has no safe URL
      const existing = bySlug.get(slug);
      if (existing) {
        existing.posts.push(post);
      } else {
        bySlug.set(slug, { slug, label, posts: [post] });
      }
    }
  }

  return [...bySlug.values()].sort((a, b) => a.label.localeCompare(b.label));
}
