# My Own Radio

A personal blog documenting treks, travel, and philosophical / spiritual
reflection. This is **Phase 1** of the larger *My Own Radio* project; later
phases add AI narration and a small personal "radio."

Built with [Astro](https://astro.build) (static site), managed in Git, and
deployed to **Cloudflare Workers** (static assets served from the CDN).

---

## Quick start (local development)

You need [Node.js](https://nodejs.org) **20 or newer** (this repo is pinned to
Node 22 via `.nvmrc`). Check with `node --version`.

```bash
# 1. install dependencies (first time, and whenever package.json changes)
npm install

# 2. start the dev server with hot reload
npm run dev
# open the URL it prints, usually http://localhost:4321
# the visual post editor lives at http://localhost:4321/keystatic (dev only)

# 3. build the production site into ./dist (what Cloudflare deploys)
npm run build

# 4. preview the production build locally (serves dist/ via wrangler)
npm run preview
```

If you use `nvm`, run `nvm use` in the project root to switch to the pinned
Node version automatically.

---

## Writing a post

The easiest way: run `npm run dev` and open **http://localhost:4321/keystatic**
— a visual editor (Keystatic) that reads and writes the post files on your
disk. Fill in the fields, write the body, save. The editor only exists in local
dev; publishing is still just `git commit` + `git push`.

You can also write a post by hand:

1. Create a new Markdoc file in `src/content/blog/`, e.g.
   `src/content/blog/manali-to-something.mdoc`. The file name becomes the URL
   slug (`/blog/manali-to-something/`). Markdoc is Markdown-compatible — write
   plain Markdown and it just works.
2. Start the file with **frontmatter** (the block between `---` lines). All
   fields are validated at build time against the schema in
   `src/content.config.ts`:

   ```markdown
   ---
   title: "Your post title"
   description: "One or two sentences. Used for SEO and post previews."
   category: "treks"
   pubDate: 2026-06-21
   tags: ["trek", "himalaya"]
   draft: false
   ---

   Your post body starts here.
   ```

   - `title` (required) — the headline.
   - `description` (required) — short summary shown on list pages.
   - `category` (required) — which section it belongs to: `stories`, `treks`,
     or `philosophy`. The list lives in `src/lib/categories.ts`.
   - `pubDate` (required) — `YYYY-MM-DD`.
   - `updatedDate` (optional) — set if you revise a published post.
   - `tags` (optional) — list of strings; defaults to empty.
   - `heroImage` / `heroAlt` (optional) — lead photo path + alt text.
   - `draft` (optional) — `true` keeps the post out of the built site.
3. Save. With `npm run dev` running, the post appears immediately.

A working example lives at `src/content/blog/welcome.mdoc`.

> **Changing the post schema?** The fields live in two files that must stay in
> sync: `src/content.config.ts` (build validation) and `keystatic.config.ts`
> (the editor). A compile-time guard, `src/schema-parity.ts`, fails
> `npm run check` if they drift — update both, then run the check.

---

## Deploying to Cloudflare Workers (free tier)

The site deploys as a **Cloudflare Worker serving static assets** — the worker
config lives in `wrangler.jsonc`, and the live URL is the `site` value in
`astro.config.mjs`.

Deploy from your machine:

```bash
npx wrangler login   # one-time browser sign-in to Cloudflare
npm run deploy       # builds, then `wrangler deploy`s dist/
```

If the repo is connected to Cloudflare **Workers Builds** (Git integration in
the Cloudflare dashboard), every push to `main` builds and deploys
automatically instead.

If the URL ever changes (e.g. a custom domain), update `site` in
`astro.config.mjs` and commit, so canonical links and Open Graph URLs stay
correct.

Reference: [Cloudflare Workers + Astro guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/).

---

## Documentation

Start with [`AGENTS.md`](AGENTS.md) — the operating manual for any contributor,
human or AI. Then, by purpose:

- [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) — what the site is and must do
  (enough to rebuild it).
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the code is structured,
  data flow, and where to plug in future work.
- [`docs/DECISIONS.md`](docs/DECISIONS.md) — why each major choice was made.
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — the phased plan (journal → AI pipeline →
  radio) and how complexity is staged.
- [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) — Git workflow and conventions.

The rule the docs follow: **the code is the source of truth for *how*; the docs
explain *what* and *why*.** If they ever disagree, fix the docs.

## Project layout

```
.
├── astro.config.mjs       # Astro configuration (site URL, integrations)
├── keystatic.config.ts    # the visual editor's schema (mirrors content.config.ts)
├── wrangler.jsonc         # Cloudflare Workers deploy config
├── src/
│   ├── content.config.ts  # post schema (typed frontmatter)
│   ├── schema-parity.ts   # compile-time guard: the two schemas above must match
│   ├── lib/               # categories (the site's sections) + shared post queries
│   ├── content/blog/      # the posts (Markdoc .mdoc files)
│   ├── layouts/           # page shells (Base, Post)
│   ├── components/        # reusable UI (Header, Footer, dates)
│   ├── pages/             # routes (index, about, blog/, search-index.json)
│   └── styles/global.css  # design tokens + base styles
└── public/                # static files served as-is (favicon, images)
```

---

## Roadmap

- **Phase 1 (now):** the journal — write and publish posts.
- **Phase 1.5:** an AI content pipeline (auto summaries, tags, and a semantic
  "related reflections" search built on embeddings).
- **Phase 2:** AI narration of posts; the "radio" experience.

Music licensing for the radio is deliberately deferred — see project notes.
