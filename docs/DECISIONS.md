# Decisions log

Short records of *why* significant choices were made. The point is to stop
future contributors (human or AI) from re-litigating settled questions, and to
make it clear which decisions are firm versus provisional.

Each entry: the context, the decision, the reasoning, alternatives considered,
and status. Newest decisions can be added at the bottom. If a decision is
reversed, don't delete it — add a new entry that supersedes it, so the history
of reasoning is preserved.

Format is lightweight on purpose. Status values: **Accepted**, **Provisional**
(working assumption, may change), **Superseded by #N**, **Deferred**.

---

## 1. Build the journal first; defer the "radio"

- **Status:** Accepted.
- **Context:** The project's vision includes an AI-narrated "radio." It's
  exciting but the hardest part (especially music licensing) and least defined.
- **Decision:** Ship the writing/journal website first. Treat the radio as a
  later phase that attaches to the journal.
- **Why:** The writing is the actual goal and the foundation everything else
  reuses. Building the journal produces value immediately and de-risks the
  unknowns. Starting with the radio would mean building infrastructure with no
  content to put through it.
- **Alternatives:** Build the radio first (rejected: highest risk, no
  foundation); build both at once (rejected: scope overload, likely ships
  neither).

## 2. Static site, not a server application

- **Status:** Accepted.
- **Decision:** The site is pre-built into static files; no live server or
  database in Phase 1.
- **Why:** A reading site's needs are met by static pages. Static means fast,
  free to host, secure (no server to attack), and hard to break. It also keeps
  the system understandable for a non-JS author.
- **Alternatives:** A dynamic app with a database (rejected for Phase 1 as
  unjustified complexity and cost). Revisit only when a feature genuinely cannot
  be static (see `SPECIFICATION.md` §9).

## 3. Astro as the site generator (over Next.js)

- **Status:** Accepted.
- **Decision:** Use Astro to generate the site.
- **Why:** Astro is content-first, ships zero JavaScript by default (fast,
  simple output), and lets us add interactivity only where needed via "islands."
  This fits a reading site and keeps the door open for later interactive
  features without committing to a heavy framework now.
- **Alternatives:** Next.js — more powerful for full *applications* (auth,
  server APIs, realtime), but heavier and more concept-laden than a blog needs;
  the React boilerplate would be friction for a non-JS author. If a future phase
  needs heavy server logic, prefer adding a **separate** service over rewriting
  the site into Next (see #7).

## 4. Content as Markdown files in Git (no CMS)

- **Status:** Accepted.
- **Decision:** Posts are Markdown files in the repo; Git is the source of truth.
- **Why:** Portable, durable, diff-able, free, and not locked to any vendor. A
  build-time schema validates each post so broken metadata can't ship.
- **Alternatives:** A hosted CMS (rejected: vendor lock-in, cost, and another
  system to learn for little benefit at this scale).

## 5. Cloudflare Pages for hosting

- **Status:** Accepted.
- **Decision:** Deploy to Cloudflare Pages, auto-building from the `main` branch.
- **Why:** Free tier with a fast global CDN, generous limits, simple Git
  integration, easy custom domains later. Good headroom as traffic grows.
- **Alternatives:** GitHub Pages (fine, slightly less headroom), Netlify/Vercel
  (also fine; Vercel is smoothest if we ever move to Next). The static output
  is portable, so this is a low-stakes, reversible choice.

## 6. "Soft neutral stone" palette; system theme + manual toggle

- **Status:** Accepted.
- **Decision:** Use a low-chroma warm-grey ("stone") palette. Follow the
  device's light/dark setting by default, and offer a header toggle that is
  remembered per visitor and applied before paint (no flash).
- **Why:** A quiet, near-neutral palette lets the trek photography provide the
  color and supports the "calm and minimal" goal. System-default respects the
  reader's environment; the toggle gives explicit control without forcing a
  choice on anyone.
- **History:** An earlier warm earthy/brown palette was tried and rejected as
  too brown — in particular its dark-mode amber tones read as muddy. Stone
  replaced it.

## 7. Add complexity at the edges; heavy logic as a separate service

- **Status:** Accepted (architectural principle).
- **Decision:** Future features should be added as build-time steps or small
  interactive islands. Anything needing real server logic (accounts, live state,
  third-party APIs) should be a separate service, not bolted onto the static
  site.
- **Why:** Keeps the reading core fast, cheap, and stable while the project
  grows. Avoids letting one feature's needs force a rewrite of everything.

## 8. Hero scroll-away as progressive enhancement

- **Status:** Superseded by #13 (the full-bleed photo hero was retired).
- **Decision:** The home hero's fade-on-scroll is an enhancement layered on top
  of a site that works without it (no JS, or reduced-motion → the hero just
  scrolls normally).
- **Why:** Accessibility and resilience. Motion effects must never be required
  to read the site, and some readers ask their system to reduce motion.

## 9. Documentation records contracts and intent, not verbatim code

- **Status:** Accepted.
- **Decision:** Docs describe goals, decisions, schemas, and structure, and
  point to the code as the source of truth, rather than duplicating code.
- **Why:** Copied code goes stale and then misleads. Contracts and reasoning age
  far more slowly. This keeps the docs trustworthy as the project grows.

## 10. Music sourcing for the radio is unresolved and deferred

- **Status:** Deferred (external legal constraint).
- **Context:** A "radio that plays songs" needs music the project is legally
  allowed to play. As of late 2024–2025, the obvious consumer catalogs are not
  available for this:
  - YouTube's Terms of Service state you may not publicly stream music from the
    service, and the API is for adding value to YouTube, not re-hosting playback
    elsewhere. Source: https://developers.google.com/youtube/terms/api-services-terms-of-service
  - Spotify removed access to 30-second preview URLs (and several data
    endpoints) for new apps as of 27 Nov 2024. Source:
    https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api
- **Decision:** Do not assume any particular music source is usable. When the
  radio phase begins, evaluate legal options explicitly: Creative Commons /
  royalty-free libraries, directly licensed music, or official embed players
  (link-out rather than re-host). Re-verify terms at that time — they change.
- **Why recorded now:** So nobody designs the radio around a music source that
  isn't actually permitted.

## 11. Typefaces: Newsreader (reading) + Inter (UI); "quiet editorial" design

- **Status:** Accepted.
- **Decision:** Use **Newsreader** as the reading serif (headings and body) and
  **Inter** for small UI text (nav, dates, labels). The overall design language
  is "quiet editorial": typography-led, a single centered reading column (~66
  characters), a fluid type scale, hairline rules, letter-spaced uppercase date
  "kickers", an italic standfirst under post titles, and a drop cap on each
  post's opening paragraph.
- **Why:** The site is reading-first; type carries the look. Newsreader reads as
  modern-yet-literary and is designed for screens (stays crisp phone→desktop);
  Inter is a neutral, legible companion for interface text. A centered measure
  plus fluid sizing (`clamp()`) is what makes the layout hold identically across
  desktop, iPad, and mobile without breakpoint jumps.
- **Alternatives considered:** EB Garamond (more classic/old-world but more
  delicate at small sizes on low-res screens); Spectral (contemporary, a touch
  cooler). Both were rendered and compared before choosing Newsreader.

## 12. Font delivery via Google Fonts now; self-hosting is a later option

- **Status:** Provisional.
- **Decision:** Load Newsreader and Inter from Google Fonts via a `<link>` in
  `BaseLayout`, with `preconnect` and `display=swap`.
- **Why:** Zero setup and good-enough performance to ship. `display=swap`
  avoids invisible text while the font loads; `preconnect` starts the fetch
  early.
- **Trade-off / when to revisit:** Self-hosting the fonts (e.g. via Fontsource)
  would be faster and more private (no third-party request) at the cost of a
  build dependency and a few KB in the repo. Revisit if font loading becomes a
  measured performance or privacy concern.

## 13. Front page: "lead story + list", not a full-bleed photo hero

- **Status:** Accepted (supersedes #8).
- **Context:** A full-bleed photo hero was built first, but the available photo
  was a posed portrait that fought the title and read as a snapshot rather than
  an atmospheric image. Three alternatives were compared.
- **Decision:** Drop the full-bleed photo hero. The home page opens with a
  typographic masthead and uses an editorial "lead story + list" layout: newest
  post leads with its image; the rest follow as compact entries with thumbnails.
  Posts carry an optional `heroImage`/`heroAlt`, shown on the post page too.
- **Why:** It's the news/editorial feel that suits a writing site, uses photos
  where they're earned (on the posts), keeps the front page calm, and removes
  the fragile dependency on one perfect hero photo. The `Hero.astro` component
  was removed (recoverable from Git history).
- **Trade-off:** Posts look best with a `heroImage`; without one they still work
  but show no thumbnail. That's an acceptable, graceful degradation.
