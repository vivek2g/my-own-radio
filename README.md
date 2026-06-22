# My Own Radio

A personal blog documenting treks, travel, and philosophical / spiritual
reflection. This is **Phase 1** of the larger *My Own Radio* project; later
phases add AI narration and a small personal "radio."

Built with [Astro](https://astro.build) (static site), managed in Git, and
deployed to **Cloudflare Pages**.

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

# 3. build the production site into ./dist (what Cloudflare deploys)
npm run build

# 4. preview the production build locally
npm run preview
```

If you use `nvm`, run `nvm use` in the project root to switch to the pinned
Node version automatically.

---

## Writing a post

1. Create a new Markdown file in `src/content/blog/`, e.g.
   `src/content/blog/manali-to-something.md`. The file name becomes the URL
   slug (`/blog/manali-to-something/`).
2. Start the file with **frontmatter** (the block between `---` lines). All
   fields are validated at build time against the schema in
   `src/content.config.ts`:

   ```markdown
   ---
   title: "Your post title"
   description: "One or two sentences. Used for SEO and post previews."
   pubDate: 2026-06-21
   tags: ["trek", "himalaya"]
   draft: false
   ---

   Your post body in Markdown starts here.
   ```

   - `title` (required) — the headline.
   - `description` (required) — short summary shown on list pages.
   - `pubDate` (required) — `YYYY-MM-DD`.
   - `updatedDate` (optional) — set if you revise a published post.
   - `tags` (optional) — list of strings; defaults to empty.
   - `draft` (optional) — `true` keeps the post out of the built site.
3. Save. With `npm run dev` running, the post appears immediately.

A working example lives at `src/content/blog/welcome.md`.

---

## Deploying to Cloudflare Pages (free tier)

This is a one-time setup; after it, every `git push` auto-deploys.

1. Push this repo to GitHub.
2. Sign in to the [Cloudflare dashboard](https://dash.cloudflare.com) →
   **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Select this repository.
4. Set the build configuration:
   - **Framework preset:** Astro
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node version:** set an environment variable `NODE_VERSION` = `22`
     (Workers & Pages → your project → Settings → Variables).
5. Save and deploy. Cloudflare gives you a `*.pages.dev` URL.
6. Update `site` in `astro.config.mjs` to that URL (or your custom domain) and
   commit, so canonical links and Open Graph URLs are correct.

Reference: [Cloudflare Pages + Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/).

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
├── astro.config.mjs       # Astro configuration (site URL, output mode)
├── src/
│   ├── content.config.ts  # post schema (typed frontmatter)
│   ├── content/blog/      # the posts (Markdown)
│   ├── layouts/           # page shells (Base, Post)
│   ├── components/        # reusable UI (Header, Footer, dates)
│   ├── pages/             # routes (index, about, blog/)
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
