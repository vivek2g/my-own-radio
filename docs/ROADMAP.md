# Roadmap

How the project grows, and how complexity is staged so each phase ships on a
working foundation. This is a direction, not a dated commitment; phases overlap
and can be reprioritized. The ordering principle: **writing first, machinery
around the writing second.**

---

## Phase 1 — The journal (current)

**Goal:** a calm, reading-first website where Vivek publishes treks, travel, and
philosophical reflections.

In scope:

- Static Astro site, Markdoc posts (with a browser-based Keystatic editor),
  validated content schema.
- Home page with typographic masthead + lead-story/list; journal list;
  individual post pages (with lead images); about page.
- Light/dark theming with system default + manual toggle.
- SEO/social metadata.
- Deployed free on Cloudflare Workers (static assets via wrangler).

Done when: the acceptance criteria in `SPECIFICATION.md` §11 hold and the site
is live with real posts.

**The most important Phase 1 work is writing, not features.** A handful of
honest, well-made posts matters more than additional functionality.

---

## Phase 1.5 — Quiet polish and one real AI feature

**Goal:** improve the reading experience and add a single, well-built AI feature
that doubles as the seed of the radio — without sprawling.

Already done: **keyword search** in the header — a build-time index plus a small
script, no server (`DECISIONS.md` #20). It matches titles, descriptions, and
tags; matching post *bodies* is left to the embeddings work below. Also done:
**tag pages** (`/tags/<tag>/`) — each tag on a post links to a page listing
every post that carries it (`DECISIONS.md` #26). Also done: **RSS feed**
(`/rss.xml`) and **sitemap** (`/sitemap-index.xml`), both generated at build
time, no server.

Candidates (pick deliberately, don't build all):

- Per-post hero images and image handling (captions, optimized images).
- **AI content pipeline (headline feature):** an offline step that reads the
  posts and writes derived data — an **embeddings index** powering "related
  reflections", and later auto-summaries and suggested tags. It reuses the same
  files authors already write, and the index it produces is exactly what the
  radio phase needs to choose what to play or narrate. A route through this
  codebase is sketched below.

Why this is the right AI feature: it's a clean, describable embeddings/RAG
capability (good for the résumé goal), it serves readers, and it's the
foundation the radio reuses rather than throwaway work.

Guardrails: any model/API keys go in environment variables, never in Git; keep
the feature optional so the site still builds without it.

### Building the AI content pipeline

A suggested route, not a specification — deviate wherever the code tells you
something better. The point of writing it down is that three constraints in this
repo are easy to discover the hard way, halfway through.

**Ship related posts first.** Auto-summaries and suggested tags are a deliberate
second slice. A `summary` field would duplicate `description`, which already
serves as the excerpt on the home page, in `PostList.astro` and in `rss.xml.ts`.
One capability, end to end, before widening.

**Anthropic has no embeddings model.** Its own guidance points at Voyage AI;
`voyage-4-lite` is the cheap end and returns 1024 dimensions by default. Claude
comes back into the picture for the summaries and tags slice.

**The shape:**

```
scripts/build-related.mjs  →  src/data/related.json  →  read at build time
  (offline, needs a key)       (committed, reviewable)    (no key, no JS)
```

That split is load-bearing. CI runs `npm run build` with no secrets at all, so
nothing needing an API key can run inside `astro build`. The script runs
separately and commits what it produced; the site only ever reads a file.

1. **Write `scripts/build-related.mjs`.** Walk `src/content/blog/**/*.mdoc` with
   `readFile` and strip the frontmatter — `scripts/assert-web-safe-images.mjs`
   already does exactly this walk, so start from it. POST the bodies to Voyage
   (`https://api.voyageai.com/v1/embeddings`) with `model: "voyage-4-lite"` and
   `input_type: "document"`, rank each post against the others, and write
   `src/data/related.json` as `{ "<post-id>": ["<id>", "<id>", "<id>"] }`. Store
   ids only: the artifact stays readable in a diff and can't drift out of sync
   with post content. Voyage vectors come back unit-normalised, so cosine
   similarity is just a dot product — there's no normalising step to write.

2. **Add `src/lib/related.ts`.** Resolve those ids into real posts through the
   existing `getPublishedPosts()` in `src/lib/posts.ts`. Return `[]` when the
   JSON is missing. That one line is what keeps the guardrail above honest —
   it's why the site still builds, and CI still passes, with no key present.

3. **Render it.** `src/pages/blog/[...slug].astro` is 23 lines and already has
   every post in `getStaticPaths()`, so compute the related list there and pass
   it to `PostLayout.astro` as a new optional prop. Render `<PostList
   posts={related} />` after `</article>`. Copy the home page's `section.more`
   block for the shape: a `.kicker` label above the list, with
   `border-top: 1px solid var(--color-border)`. `PostList.astro` already draws
   the cards, so there's nothing new to style and no JavaScript ships.

4. **Wire it up.** A `build:related` entry in `package.json`, and `VOYAGE_API_KEY`
   documented in `.env.example` — the name only, never the value.

5. **Automate it.** `.github/workflows/build-related.yml`, modelled on
   `fix-images.yml`: trigger on push to `main`, guard with
   `if: github.actor != 'github-actions[bot]'`, and grant `contents: write` plus
   `pull-requests: write`. Open a pull request rather than pushing to `main`, so
   AI-derived output gets looked at before it reaches the live site. Unlike
   `fix-images.yml`, this workflow needs an `npm ci` step — that script has no
   npm dependencies and deliberately skips it.

**Things that will bite you:**

- **Keep derived data in a sidecar file, not in frontmatter.** A new frontmatter
  field has to be declared in both `src/content.config.ts` and
  `keystatic.config.ts` or the parity guard in `src/schema-parity.ts` fails
  `npm run check` — and it would put a machine-written value in the editor UI
  for no good reason. A sidecar file is what `ARCHITECTURE.md` already means by
  "a build-time data step".
- **`npm run verify:static` will fail the build if this ships as an island.**
  `scripts/assert-reader-pages-static.mjs` rejects any prerendered page that
  references an external script, and related posts are fully known at build
  time, so they should be plain server-rendered markup. Note that
  `ARCHITECTURE.md` and `SPECIFICATION.md` §9 still offer related posts as their
  example of an island — wording that predates that guard, worth correcting when
  the feature actually lands.
- **`post.body` already holds the raw Markdoc source at build time.** The `glob`
  loader populates it and nothing in `src/` currently reads it. Useful if you'd
  rather go through `getCollection` than off disk — though the offline script
  can't, since it runs outside Astro.
- **Expect poor results at five posts.** Five same-author posts on overlapping
  themes don't separate well in embedding space. This is a foundation laid
  early, not a feature that pays off today; judge it on whether the seam is
  right, not on the rankings.
- **`_typos.toml` spellchecks committed content in CI**, which will start
  applying to generated prose once the summaries slice lands.

---

## Phase 2 — The radio (audio)

**Goal:** turn the writing into something you can listen to, mostly AI-narrated.

Likely components:

- **Narration:** AI text-to-speech of the author's own posts and of
  public-domain or clearly-licensed source texts. This is the achievable,
  on-theme core and reuses Phase 1.5's index to sequence segments.
- **Content metadata:** an `audioUrl`/narration field added to the post schema
  (`SPECIFICATION.md` §6) so a post can carry its narrated version.
- **Playback surface:** a player experience. If it needs real server logic
  (queues, live state, accounts), build it as a **separate service**, not inside
  the static site (`DECISIONS.md` #7).

**Hard external constraint — music licensing (unresolved).** A radio that plays
*songs* needs music the project may legally play. The obvious consumer catalogs
are currently not available for this use (`DECISIONS.md` #10). Before designing
any music feature, evaluate legal paths explicitly — Creative Commons /
royalty-free libraries, directly licensed music, or official embed players — and
**re-verify terms at that time**, because they change. A realistic early version
may be narration-led with licensed/royalty-free music only as connective tissue.

Copyright also applies to *spoken* content: narrating copyrighted books (e.g. a
passage from a still-in-copyright novel) and publishing it is infringement. Use
the author's own writing and public-domain sources.

---

## Cross-cutting concerns (apply in every phase)

- **Accessibility:** readable contrast, respect reduced-motion, keyboard-usable.
- **Performance:** keep pages light; optimize images; prefer static.
- **Cost:** stay on free tiers until a concrete reason to spend.
- **Documentation:** when a decision is made, record it in `DECISIONS.md`; when
  a contract changes, update `SPECIFICATION.md`.
- **Reversibility:** prefer choices that don't lock the project in.

---

## How to propose a change to this roadmap

Open a short note (issue or PR description) stating: the need, the smallest thing
that meets it, whether it can be done statically/at build time, and which
existing seam it attaches to (`SPECIFICATION.md` §9). If it implies a new server,
database, or framework, say why a lighter option won't do.
