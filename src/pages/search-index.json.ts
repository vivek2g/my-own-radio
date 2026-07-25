import type { APIRoute } from 'astro';
import { getPublishedPosts } from '../lib/posts';

// The search index, generated at build time into a plain static file
// (/search-index.json). The header's search panel fetches it the first time a
// visitor opens search, so no page carries the index in its HTML and the cost
// stays flat as the number of posts grows.
//
// Only fields worth matching on are included — title, description, tags — plus
// what the result list needs to render. Post bodies are deliberately left out
// to keep the file small; see docs/DECISIONS.md #20.
export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getPublishedPosts();

  const index = posts.map((post) => ({
    title: post.data.title,
    description: post.data.description,
    tags: post.data.tags,
    url: `/blog/${post.id}/`,
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json' },
  });
};
