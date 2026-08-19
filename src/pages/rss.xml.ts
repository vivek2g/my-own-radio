import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/posts';

// The site's RSS feed, generated at build time into a plain static file
// (/rss.xml), same convention as /search-index.json (see that file, and
// docs/DECISIONS.md #20 on keeping data generation at the edges).
export const prerender = true;

export const GET: APIRoute = async (context) => {
  const posts = await getPublishedPosts();

  return rss({
    title: 'My Own Radio',
    description:
      'A personal journal of treks, travel, and philosophical & spiritual reflection.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
  });
};
