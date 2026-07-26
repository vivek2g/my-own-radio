# Architecture

This document explains *how* the site works and *why* it's built this way, so a
new developer (or future-you) can change it confidently.

## The big picture

This is a **static site**. At build time, Astro reads the Markdoc posts and the
`.astro` page files and produces plain HTML/CSS in `dist/`. There is no server
and no database at runtime — Cloudflare just serves files from its CDN (the
site is deployed as a Cloudflare **Worker** whose only job is serving those
static assets; see `wrangler.jsonc`). That's why hosting is free and the site
is fast and hard to break.

```
Markdoc posts ──┐
                ├─►  astro build  ─►  dist/ (static HTML)  ─►  Cloudflare CDN
.astro pages ───┘
```

## Why Astro (vs. Next.js)

Astro is content-first: posts are files, pages are components, and it ships zero
JavaScript by default. For a blog this means simpler output and faster pages.
We can still drop in interactive React/Vue/Svelte "islands" later (for the
Phase 1.5 search box, for example) without rewriting anything. Next.js is the
better tool when the *app* logic dominates (auth, server APIs, realtime); if the
radio phase needs that, it can be added as a separate service rather than
forcing the blog into a heavier framework now.

## Content collections (the typed-data part)

`src/content.config.ts` defines a **collection** called `blog`:

- A **loader** (`glob`) tells Astro which files are posts.
- A **schema** (Zod) declares the shape of each post's frontmatter.

Astro validates every post against the schema during the build. A missing
`title` or a malformed date fails the build instead of shipping a broken page.
If you've done schema validation on data pipelines, this is the same idea applied
to content.

Each post gets an `id` derived from its filename (e.g. `welcome.mdoc` →
`welcome`), which is also its URL slug.

## Routing

Astro uses **file-based routing** — a file in `src/pages/` becomes a URL.

| File | URL |
| --- | --- |
| `src/pages/index.astro` | `/` |
| `src/pages/about.astro` | `/about/` |
| `src/pages/blog/index.astro` | `/blog/` |
| `src/pages/blog/[...slug].astro` | `/blog/<post-id>/` (one per post) |

`[...slug].astro` is a **dynamic route**. Its `getStaticPaths()` runs at build
time, asks the `blog` collection for every published post, and generates one
static page each. The post body is rendered via `render()` from `astro:content`.

## Layouts and components

- `layouts/BaseLayout.astro` — the HTML shell (`<head>`, header, footer, SEO
  tags). Every page wraps its content in this.
- `layouts/PostLayout.astro` — adds the post title, date, and tags around the
  article body.
- `components/` — small reusable pieces (`Header`, `Sidebar`, `Footer`,
  `FormattedDate`, `Search`, `PostList`).

## Styling

One stylesheet, `src/styles/global.css`, holds the design tokens and base
styles. As CSS custom properties in `:root` it defines:

- **Colors** — background, surface, text, muted, accent, border (plus a
  dark-theme block; see "Theming mechanism" below).
- **Fonts** — `--font-display` (Space Grotesk, headlines/brand), `--font-body`
  (Newsreader, reading serif) and `--font-ui` (Inter, UI sans). Loaded once in
  `BaseLayout.astro`'s `<head>` from Google Fonts. A `.cut-corner` utility class
  applies the angled-corner clip-path used on large hero images.
- **A fluid type scale** — `--step--1` through `--step-3`, each a `clamp()` that
  grows smoothly with screen width, so type never jumps at breakpoints. Pages
  reference these steps instead of hardcoded sizes.

Because everything keys off these tokens, the whole site can be re-themed or
re-typed by editing this one file. A shared `.kicker` utility class provides the
small letter-spaced uppercase labels (section titles, post dates) that define
the editorial look. Component-specific styles live in scoped `<style>` blocks
inside each `.astro` file; a few reading-specific rules (drop cap, blockquote,
prose rhythm) live in `PostLayout.astro`.

## The editor (Keystatic) — browser-based, files stay the source of truth

Posts are written in a visual editor, **Keystatic**, served at `/keystatic` —
on the live site as well as locally (`docs/DECISIONS.md` #25). It uses "github"
storage: signing in with GitHub proves you have write access to the repo, and
saving commits the `.mdoc` file through the GitHub API. Git remains the single
source of truth; an edit is a commit, and the site rebuilds from it.

Two routes are rendered on demand for this — `/keystatic` and
`/api/keystatic/*` — and nothing else. Every reading page is still prerendered
and ships no framework JavaScript; the build output confirms no post or listing
page references the editor bundle. There is no database and no user table:
authorisation is entirely GitHub's repo permissions.

The editor's schema (`keystatic.config.ts`) mirrors the content schema
(`src/content.config.ts`). `src/schema-parity.ts` asserts at type-check time
that the two declare the same fields, so `npm run check` fails if they drift.

## Sections (categories)

`src/lib/categories.ts` is the single source of truth for the site's sections.
Four things read from it, which is why adding a section is a one-line change:

- the post schema (`src/content.config.ts`) turns the slugs into a Zod enum, so
  an unknown category fails the build;
- the Keystatic editor (`keystatic.config.ts`) turns them into a dropdown;
- the left rail (`src/components/Sidebar.astro`) renders one link each;
- `src/pages/[category].astro` generates one page each, filtering posts by
  their `category` field.

Because `getStaticPaths()` only ever emits the known slugs, that dynamic route
sits at the URL root without shadowing real pages like `/about/`.

## Page shell

`BaseLayout` is a two-column CSS grid: the section rail, then the page content.
Below 900px the grid collapses to one column and the rail restyles itself into
a horizontal scrolling strip above the content — same markup, same links.

The hamburger in the header hides the rail at any width. It sets
`data-rail="collapsed"` on `<html>`; `BaseLayout` animates the grid track the
rail occupies down to zero (the column on desktop, the row on phones) and the
rail fades and clips itself, so the article reflows into the freed space rather
than the rail leaving a hole — see `docs/DECISIONS.md` #24. Because the reading
column is centred with `margin-inline: auto`, it re-centres itself in whatever
width it ends up with. The
state is stored in `localStorage` and re-applied by the inline script in
`<head>` **before first paint** — without that, the rail would reopen on every
navigation (each link is a full page load) and flash on the way to collapsing.
See `docs/DECISIONS.md` #23; the theme toggle uses the same mechanism.

## Search (a worked example of "complexity at the edges")

Site search is the clearest illustration of how features get added here without
giving up the static core:

- **Build time:** `src/pages/search-index.json.ts` is an Astro endpoint that
  runs during the build and writes a plain `/search-index.json` file listing
  every published post's title, description, tags, and URL.
- **Browser:** `src/components/Search.astro` renders a button in the header and
  a dialog. The first time a visitor opens it, a small script fetches that JSON
  once and filters it in memory. Results are ordinary `<a href>` links, so
  choosing one is a normal navigation.

There is no search server, no index at request time, and no framework — and
because the index is fetched only on demand, pages carry none of its weight.
Note the Astro gotcha this design works around: scoped `<style>` rules only
apply to elements present in the component's markup, so the result row lives in
a `<template>` that the script clones rather than being built with
`createElement`.

## What deliberately does NOT exist yet

- No JavaScript framework in production, no client-side routing, no state
  management. (React exists only inside the dev-time Keystatic editor.)
- No CMS backend — posts are files in Git, which is the source of truth; the
  Keystatic editor is a local editing convenience, not a content server.
- No analytics or comments. Search exists, but only keyword matching over post
  metadata — no semantic/embeddings search yet.

These are intentional omissions to keep Phase 1 shippable. Each can be added in
isolation when there's a reason to.

---

## Data flow (build time vs. browser)

It helps to separate what happens **when the site is built** from what happens
**in the reader's browser**.

At build time (on your machine or on Cloudflare):

```
src/content/blog/*.mdoc ──┐
                          ├─►  Astro reads + validates against the schema
src/pages/*.astro       ──┤        (src/content.config.ts)
src/layouts, components ──┘                │
                                           ▼
                                  dist/  (plain HTML + CSS + a little JS)
```

In the browser (per visit), only small, optional scripts run:

- The **theme** inline script sets light/dark before paint.
- The **header toggle** script handles theme switching.

Everything else is static HTML and CSS. There is no application running on a
server answering requests — the host just serves files. Keep this split in mind:
most new capability should happen at **build time**, where it's cheap and can't
slow down or break the live page.

## Layer boundaries

Think of the code in layers, each depending only on the one below it:

```
Pages (routes)          src/pages/        — what URLs exist; fetch content
   │
Layouts                 src/layouts/      — page shells (Base, Post)
   │
Components              src/components/    — reusable UI (Header, Sidebar, PostList, Footer, …)
   │
Content + tokens        src/content/, src/styles/  — the data and the design vars
```

A change should stay in its layer where possible. Editing a color = tokens.
Adding a post = content. Changing the page frame = a layout. Adding a reusable
widget = a component. This keeps edits local and predictable.

## Extension points (where to plug future work in)

- **A new page:** add a file to `src/pages/`. Its path becomes the URL.
- **A new reusable element:** add a component to `src/components/` and use it in
  a layout or page.
- **New post metadata:** add the field to the schema in
  `src/content.config.ts` **and** to `keystatic.config.ts` (so the editor can
  set it); the parity guard in `src/schema-parity.ts` fails `npm run check`
  until both agree.
- **An interactive feature (island):** build it as a framework component (React,
  Svelte, etc.) and embed only that component in an otherwise-static page, with
  a directive telling Astro to make it interactive in the browser. The rest of
  the page stays static. (This is how the planned "related posts" search lands
  without rewriting the site.)
- **A build-time data step (e.g. embeddings index):** a script that reads the
  Markdown and writes a derived data file the site imports. Runs during the
  build; produces no runtime cost.
- **Heavy server logic (accounts, live state, music APIs):** do **not** add it
  inside this static site. Stand up a separate service and call it from an
  island. See `DECISIONS.md` #7.

## How to add common things (quick recipes)

- **Publish a post:** use the Keystatic editor (`/keystatic` during `npm run
  dev`) or create `src/content/blog/<slug>.mdoc` by hand with valid
  frontmatter. See `README.md` → "Writing a post."
- **Change the color scheme:** edit the tokens in `src/styles/global.css` (light
  block and the dark block). Nothing else.
- **Give a post a photo:** add an image to `public/images/`, then set
  `heroImage: "/images/your-file.jpg"` (and `heroAlt`) in the post's frontmatter.
  It appears on the post page and as the homepage thumbnail/lead image.
- **Add a reading section (Stories/Treks/…):** add an entry to
  `src/lib/categories.ts`. Its nav link, its page, and the editor's dropdown all
  follow automatically.
- **Add a one-off page (not a section):** add a file in `src/pages/`, then add
  it to `secondaryLinks` in `src/components/Sidebar.astro`.

## Why these boundaries matter as the project grows

The whole point of keeping the core static and pushing complexity to islands and
build steps is that the reading experience never gets slower or more fragile as
features pile up. A reader loading a post in 2027 should get the same fast, plain
HTML they get today, no matter how much machinery exists for the radio or
search. Protect that core; grow at the edges.
