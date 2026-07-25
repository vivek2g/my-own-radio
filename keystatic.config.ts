import { config, fields, collection } from '@keystatic/core';

// Keystatic configuration — the editor's schema. It mirrors the content
// collection schema in src/content.config.ts. Storage is "local": the editor
// (at /keystatic during `npm run dev`) reads and writes the post files on your
// disk; you then commit and push to publish.
//
// Body images uploaded in the editor are saved to public/images/posts and
// written into the post as /images/posts/<file>, so they render with no extra
// work. The hero image is a path field for now (type or paste a path like
// /images/post-chaukhamba.jpg); we can upgrade it to an upload field once the
// editor is confirmed working.
export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'My Own Radio' },
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'content' },
      columns: ['title', 'pubDate'],
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        description: fields.text({
          label: 'Description',
          description: 'One or two sentences, shown in lists and previews.',
          multiline: true,
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
