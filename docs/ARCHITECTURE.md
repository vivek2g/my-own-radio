# Architecture

This document explains *how* the site works and *why* it's built this way, so a
new developer (or future-you) can change it confidently.

## The big picture

This is a **static site**. At build time, Astro reads the Markdown posts and the
`.astro` page files and produces plain HTML/CSS in `dist/`. There is no server
and no database at runtime — Cloudflare just serves files from its CDN. That's
why hosting is free and the site is fast and hard to break.

```
Markdown posts ─┐
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

Each post gets an `id` derived from its filename (e.g. `welcome.md` → `welcome`),
which is also its URL slug.

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
- `components/` — small reusable pieces (`Header`, `Footer`, `FormattedDate`).

## Styling

One stylesheet, `src/styles/global.css`, holds the design tokens and base
styles. As CSS custom properties in `:root` it defines:

- **Colors** — background, surface, text, muted, accent, border (plus a
  dark-theme block; see "Theming mechanism" below).
- **Fonts** — `--font-body` (Newsreader, the reading serif) and `--font-ui`
  (Inter, the UI sans). The fonts themselves are loaded once in
  `BaseLayout.astro`'s `<head>` from Google Fonts.
- **A fluid type scale** — `--step--1` through `--step-3`, each a `clamp()` that
  grows smoothly with screen width, so type never jumps at breakpoints. Pages
  reference these steps instead of hardcoded sizes.

Because everything keys off these tokens, the whole site can be re-themed or
re-typed by editing this one file. A shared `.kicker` utility class provides the
small letter-spaced uppercase labels (section titles, post dates) that define
the editorial look. Component-specific styles live in scoped `<style>` blocks
inside each `.astro` file; a few reading-specific rules (drop cap, blockquote,
prose rhythm) live in `PostLayout.astro`.

## What deliberately does NOT exist yet

- No JavaScript framework, no client-side routing, no state management.
- No CMS — posts are files in Git, which is the source of truth.
- No analytics, comments, or search yet.

These are intentional omissions to keep Phase 1 shippable. Each can be added in
isolation when there's a reason to.

---

## Data flow (build time vs. browser)

It helps to separate what happens **when the site is built** from what happens
**in the reader's browser**.

At build time (on your machine or on Cloudflare):

```
src/content/blog/*.md   ──┐
                          ├─►  Astro reads + validates against the schema
src/pages/*.astro       ──┤        (src/content.config.ts)
src/layouts, components ──┘                │
                                           ▼
                                  dist/  (plain HTML + CSS + a little JS)
```

In the browser (per visit), only small, optional scripts run:

- The **theme** inline script sets light/dark before paint.
- The **hero** script fades the hero on scroll (skipped if reduced-motion).
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
Components              src/components/    — reusable UI (Header, Footer, Hero…)
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
- **New post metadata:** add a field to the schema in `src/content.config.ts`;
  it becomes available (and validated) on every post.
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

- **Publish a post:** create `src/content/blog/<slug>.md` with valid
  frontmatter. See `README.md` → "Writing a post."
- **Change the color scheme:** edit the tokens in `src/styles/global.css` (light
  block and the dark block). Nothing else.
- **Swap the hero photo:** replace `public/images/hero.jpg`; adjust the focal
  point via `background-position` in `src/components/Hero.astro` if needed.
- **Add a nav link:** edit the `links` array in `src/components/Header.astro`.
- **Add a new top-level section:** add a page in `src/pages/`, then link to it
  from the header.

## Why these boundaries matter as the project grows

The whole point of keeping the core static and pushing complexity to islands and
build steps is that the reading experience never gets slower or more fragile as
features pile up. A reader loading a post in 2027 should get the same fast, plain
HTML they get today, no matter how much machinery exists for the radio or
search. Protect that core; grow at the edges.
