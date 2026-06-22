# My Own Radio — Specification

This document describes **what the project is and what it must do**, in enough
detail that a competent developer (or AI agent) could rebuild an equivalent
system from scratch. It deliberately describes *intent and contracts*, not exact
code — the code in this repository is the source of truth for implementation
details. When this document and the code disagree, the code wins, and this
document should be corrected.

Audience note: this is written to be readable by someone who does not know
JavaScript. Where a web-specific idea appears, it's explained in plain terms.

---

## 1. Purpose

My Own Radio is a personal project with two layers:

1. A **public journal website** documenting Vivek's treks, travels, and an
   ongoing philosophical/spiritual inquiry ("who am I, what is this for"), drawn
   from Hinduism, other traditions, and philosophy.
2. A longer-term **"radio"**: a personal, mostly AI-narrated audio experience
   built on top of that writing. This is deferred; see `ROADMAP.md`.

This specification covers **Phase 1: the journal website**, and defines the
seams the later phases attach to.

### Guiding qualities (the "non-functional requirements")

These are the qualities every change should protect:

- **Reading-first.** The writing is the product. Design, code, and features
  serve readability and calm, not the reverse.
- **Owned and portable.** Content lives as plain files in Git, not locked in a
  third-party CMS. The whole site can be moved to another host with no data
  migration.
- **Simple by default.** The site is static (see §4). Complexity is added only
  when a concrete need justifies it, and added at the edges (see §9).
- **Low/zero running cost** until there's a reason to spend.
- **Understandable by a non-JS developer**, with documentation that makes the
  system approachable.

---

## 2. Audience and content

- **Primary readers:** people interested in Himalayan treks, reflective travel
  writing, and accessible philosophy/spirituality.
- **Author:** a single author (Vivek) for now; the system should not assume
  multi-author complexity yet, but must not make it hard to add later.
- **Content types today:** journal posts (essays, trip notes, reflections).
  Each post is text with optional images.

---

## 3. Functional requirements

What the site must do, framed as capabilities rather than code:

1. **Publish posts.** An author writes a post as a single text file; it appears
   on the site after a build. No database or admin login.
2. **List posts.** A home page shows recent posts; a journal page lists all
   published posts, newest first.
3. **Read a post.** Each post has its own page at a stable, human-readable URL.
4. **Drafts.** A post can be marked unpublished and excluded from the live site.
5. **Validate content.** Malformed post metadata (missing title, bad date)
   fails the build rather than shipping broken pages.
6. **Set mood with a hero.** The home page opens with a full-screen photo that
   fades/lifts away as the reader scrolls into the writing.
7. **Theme.** Light and dark themes; follow the device by default, with a
   manual toggle that is remembered per visitor.
8. **Be findable and shareable.** Each page has a title, description, canonical
   URL, and social-preview metadata.
9. **Accessibility & motion.** Respect "reduce motion" preferences; maintain
   readable contrast in both themes.

### Explicit non-goals (Phase 1)

Comments, user accounts, search, analytics, a CMS, server-side logic, and any
audio/radio features are **out of scope for Phase 1**. They are not forbidden
forever — see §9 and `ROADMAP.md` — but they are not built yet, and the system
should stay simple until they're genuinely needed.

---

## 4. Technology stack (and why, briefly)

Rationale for each choice lives in `DECISIONS.md`; this is the summary.

- **Static site** — the site is compiled ahead of time into plain HTML/CSS
  files. There is no live server doing work per visit. This makes it fast,
  cheap, secure, and hard to break. ("Static" = pre-built; the opposite,
  "dynamic," means a server assembles each page on request.)
- **Astro** — the site generator. It turns content files plus page templates
  into the static HTML. Chosen for being content-first and for letting us add
  interactive pieces only where needed (see "islands" in `ARCHITECTURE.md`).
- **Markdown** — the format posts are written in: plain text with light syntax
  for headings, links, etc. Readable, portable, diff-friendly in Git.
- **Git + GitHub** — version control and the single source of truth for all
  content and code.
- **Cloudflare Pages** — the host. It watches the GitHub repo, runs the build
  on every push, and serves the result on a global CDN for free.
- **Node.js** — the runtime needed to *build* the site locally and on the host.
  The pinned version lives in `.nvmrc`.

**Versions are pinned in `package.json` and `package-lock.json`**, which are the
authoritative record. This document does not restate version numbers, because
they change; the lockfile does not lie.

---

## 5. Information architecture (pages & URLs)

The site's routes. "Route" = a URL the site responds to. In Astro these come
from files in `src/pages/` (file-based routing — the file's location *is* the
URL).

| Page | URL | Purpose |
| --- | --- | --- |
| Home | `/` | Hero + short intro + most recent posts |
| Journal | `/blog/` | Full list of published posts, newest first |
| Post | `/blog/<slug>/` | A single post; one page generated per post |
| About | `/about/` | Who the author is and what the project is |

`<slug>` is the post's URL-safe identifier, derived from its filename. URLs are
intended to be **stable** — once published, a post's URL should not change, so
links and search rankings don't break.

---

## 6. Content model (the contract for a post)

This is the most important contract in the system. Every post is a Markdown file
in `src/content/blog/`. The filename (minus `.md`) becomes the URL slug.

Each post begins with **frontmatter** — a small block of metadata at the top of
the file. The schema is enforced at build time (defined in
`src/content.config.ts`, which is the authoritative version):

| Field | Required | Meaning |
| --- | --- | --- |
| `title` | yes | The post's headline |
| `description` | yes | One–two sentence summary; used in lists and social previews |
| `pubDate` | yes | Publication date (`YYYY-MM-DD`) |
| `updatedDate` | no | Date of a later revision |
| `tags` | no | List of topic labels; defaults to empty |
| `draft` | no | `true` hides the post from the live site; defaults to `false` |

**Contract guarantees:**

- A post missing a required field, or with a malformed date, **fails the build**
  (it cannot reach production silently broken).
- `draft: true` posts never appear in any listing or generated page on the live
  site.
- Listings are sorted by `pubDate`, newest first.

This schema is the natural extension point for future metadata (e.g. a
`heroImage`, `series`, or `audioUrl` field for the radio phase) — add a field
here and every consumer can rely on it.

---

## 7. Theming system (contract)

- The site exposes a small set of **design tokens** — named colors — as CSS
  variables (e.g. background, surface, text, muted text, accent, border),
  defined in `src/styles/global.css`. Components reference the tokens, never raw
  colors, so the whole site can be re-themed by editing the tokens.
- Two themes exist: **light** (default) and **dark**. Both must keep readable
  contrast.
- **Theme selection rule:**
  1. If the visitor has explicitly chosen a theme (via the header toggle), use
     it. The choice is stored in the browser and persists across visits.
  2. Otherwise, follow the device's light/dark setting automatically.
- The chosen theme is applied **before the page paints**, so there is no flash
  of the wrong colors on load.
- The current palette is "soft neutral stone" (warm-grey, low-chroma) so that
  photographs carry the color. Changing the palette = editing the tokens only.

### Typography (part of the theming contract)

- The design language is "quiet editorial": typography-led and restrained.
- Two typefaces: a **reading serif** (Newsreader) for headings and body, and a
  **UI sans** (Inter) for small interface text (nav, dates, labels). They are
  referenced through `--font-body` / `--font-ui` tokens, so swapping a typeface
  is a token change.
- A **fluid type scale** (`--step--1` … `--step-3`, built with `clamp()`) sizes
  text smoothly between phone and desktop, so there are no abrupt jumps at
  breakpoints. Content sits in a single centered column of roughly 66 characters
  on every screen.
- Decisions and rationale for the typeface choice and font delivery live in
  `DECISIONS.md` (#11, #12).

---

## 8. Hero behavior (contract)

- The home page opens with a **hero**: a full-bleed photo (`public/images/`)
  with the site title and tagline overlaid lower-left, over a **scrim** (a soft
  dark wash that guarantees light text stays legible over any photo).
- As the reader scrolls, the hero content **fades and lifts**, handing off to
  the reading view below.
- The effect is **progressive enhancement**: with JavaScript disabled, or when
  the visitor prefers reduced motion, the hero simply scrolls away normally with
  no fade. The site is fully usable either way.
- The hero is shorter on small screens so some writing is reachable sooner.
- The hero image is a content asset, not code: swapping the photo is a
  file replacement, and the crop focal point is a single CSS value.

---

## 9. Built to grow — where future complexity attaches

The project *will* get more complex. The strategy is to **add at the edges and
keep the core (writing → static pages) intact**. Concrete seams:

- **Interactive features** (e.g. a semantic "related posts" search) are added as
  **islands** — small interactive components embedded in otherwise-static pages.
  They do not require converting the whole site to a heavier framework. The rest
  of the page stays static and fast.
- **New content metadata** (hero images per post, series, reading time, audio
  links) attaches to the **content schema** (§6). Add a field; consumers opt in.
- **The AI content pipeline** (auto summaries, tags, embeddings for search) is
  designed as a **build-time or offline step** that reads the same Markdown
  files and writes derived data (e.g. an embeddings index) the site can consume.
  It does not change how posts are authored.
- **The radio / audio phase** attaches as: (a) an `audioUrl`/narration field on
  posts, and (b) a separate playback surface. Anything needing real server logic
  (accounts, live state, third-party music APIs) should be a **separate service**
  rather than forced into the static site — see `DECISIONS.md` on Astro vs. a
  full app framework.
- **Music licensing** is an unresolved external constraint, deliberately
  deferred. See `ROADMAP.md` and `DECISIONS.md`; do not assume any particular
  music source is legally available without checking.

**Architectural rule of thumb for contributors:** before adding a server,
database, or framework, ask whether the need can be met at build time or with a
small island. Most reading-site needs can. Reach for heavier tools only when a
feature genuinely cannot be static.

---

## 10. Build, deploy, and environments

- **Local development:** an author runs the dev server, which serves the site
  from source and hot-reloads on save. This is the correct environment for
  writing and previewing; it always reflects the latest files.
- **Production build:** the generator compiles everything into a `dist/` folder
  of static files. A *preview* of that build is a frozen snapshot — it only
  updates when rebuilt. (Confusing the two is a common trap: edits don't appear
  in a stale preview build.)
- **Deployment:** Cloudflare Pages rebuilds from the `main` branch on every push
  and serves the result. Exact build settings live in `README.md`.
- **Secrets/keys:** none required for Phase 1. Future phases that need API keys
  (e.g. an embedding model) must use environment variables, never committed to
  Git.

---

## 11. Acceptance criteria (how to know a rebuild is correct)

An implementation satisfies this spec if:

1. Adding a Markdown file with valid frontmatter to the posts folder makes a new
   post page appear, listed newest-first on home and journal pages.
2. A `draft: true` post is absent from the live build.
3. Invalid frontmatter fails the build.
4. The home page shows a full-screen photo hero that hands off to the reading
   view on scroll, and degrades gracefully without JS / with reduced motion.
5. Light and dark themes both render with readable contrast; the site follows
   the device by default and honors a remembered manual toggle with no flash.
6. Every page has a title, description, canonical URL, and social-preview tags.
7. The production build is fully static and hosts for free on Cloudflare Pages.

---

## 12. Related documents

- `ARCHITECTURE.md` — how the code is structured and how data flows.
- `DECISIONS.md` — why each major choice was made.
- `ROADMAP.md` — phased plan and how complexity is staged.
- `CONTRIBUTING.md` — working conventions.
- `../AGENTS.md` — operating manual for human or AI contributors.
- `../README.md` — quick start, file layout, deploy steps.
