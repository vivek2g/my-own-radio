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
tags; matching post *bodies* is left to the embeddings work below.

Candidates (pick deliberately, don't build all):

- Per-post hero images and image handling (captions, optimized images).
- RSS feed and sitemap (cheap, high value for a writing site).
- Tag pages / filtering.
- **AI content pipeline (headline feature):** an offline/build-time step that
  reads the posts and produces derived data — auto-summaries, suggested
  tags, and an **embeddings index** powering a "related reflections" search.
  This is implemented as a small island over a prebuilt index, so the site stays
  static. It reuses the same files authors already write, and the index it
  produces is exactly what the radio phase needs to choose what to play/narrate.

Why this is the right AI feature: it's a clean, describable embeddings/RAG
capability (good for the résumé goal), it serves readers, and it's the
foundation the radio reuses rather than throwaway work.

Guardrails: any model/API keys go in environment variables, never in Git; keep
the feature optional so the site still builds without it.

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
