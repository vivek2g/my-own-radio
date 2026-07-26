import { config, fields, collection } from '@keystatic/core';
import { CATEGORIES } from './src/lib/categories';

// Keystatic configuration — the editor's schema. It mirrors the content
// collection schema in src/content.config.ts.
//
// Storage is "github": the editor runs on the deployed site at /keystatic,
// signs you in with GitHub, and saves by committing to this repo through the
// GitHub API. Anyone with write access to the repo can edit; everyone else
// only ever sees the published site. Publishing is the same as it always was —
// a commit lands, the site rebuilds.
//
// Body images uploaded in the editor are saved to public/images/posts and
// written into the post as /images/posts/<file>, so they render with no extra
// work. The hero image is still a path field; it becomes an upload field once
// the editor is confirmed working end to end.
export default config({
  storage: { kind: 'github', repo: 'vivek2g/my-own-radio' },
  ui: {
    brand: { name: 'My Own Radio' },
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      columns: ['title', 'category', 'pubDate'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          description: 'One or two sentences, shown in lists and previews.',
          multiline: true,
        }),
        // Options come from src/lib/categories.ts, the same list the site nav
        // and the content schema use.
        category: fields.select({
          label: 'Section',
          description: 'Which part of the site this post belongs to.',
          options: CATEGORIES.map((c) => ({ label: c.label, value: c.slug })),
          defaultValue: 'stories',
        }),
        pubDate: fields.date({ label: 'Publish date' }),
        updatedDate: fields.date({
          label: 'Updated date',
          validation: { isRequired: false },
        }),
        tags: fields.array(fields.text({ label: 'Tag' }), {
          label: 'Tags',
          itemLabel: (props) => props.value,
        }),
        heroImage: fields.text({
          label: 'Hero image path',
          description: 'e.g. /images/post-chaukhamba.jpg (leave blank for the default).',
        }),
        heroAlt: fields.text({ label: 'Hero image alt text' }),
        draft: fields.checkbox({ label: 'Draft (hidden from the site)', defaultValue: false }),
        content: fields.markdoc({
          label: 'Body',
          options: {
            image: {
              directory: 'public/images/posts',
              publicPath: '/images/posts/',
            },
          },
        }),
      },
    }),
  },
});
