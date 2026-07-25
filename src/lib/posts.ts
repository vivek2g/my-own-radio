import { getCollection } from 'astro:content';

// "Every published post, newest first" — the ordering readers see on the home
// page, the journal index, and in search results. It lives here so those three
// places can't drift apart (e.g. one of them forgetting to hide drafts).
export async function getPublishedPosts() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}
