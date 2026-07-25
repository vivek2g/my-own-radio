// The site's sections. This is the single source of truth: the post schema
// (src/content.config.ts), the Keystatic dropdown (keystatic.config.ts), the
// sidebar nav, and the category pages all read from here, so adding a section
// is a one-line change in this file plus a page rebuild.
export const CATEGORIES = [
  {
    slug: 'stories',
    label: 'Stories',
    blurb: 'Travel, places, and the people met along the way.',
  },
  {
    slug: 'treks',
    label: 'Treks',
    blurb: 'Days on the trail, and the mountains they lead to.',
  },
  {
    slug: 'philosophy',
    label: 'Philosophy',
    blurb: 'Slower questions — the ones that keep starting over.',
  },
] as const;

export type CategorySlug = (typeof CATEGORIES)[number]['slug'];

// Zod's enum() and Keystatic's select() both need the bare list of slugs.
// The cast gives it the non-empty-tuple type z.enum() requires.
export const CATEGORY_SLUGS = CATEGORIES.map((c) => c.slug) as unknown as [
  CategorySlug,
  ...CategorySlug[],
];

export const categoryLabel = (slug: CategorySlug): string =>
  CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
