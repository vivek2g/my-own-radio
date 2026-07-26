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

- **Status:** Accepted; refined by #17 and #25 (posts are Markdoc `.mdoc`
  files, editable in a browser — Git remains the source of truth).
- **Decision:** Posts are Markdown files in the repo; Git is the source of truth.
- **Why:** Portable, durable, diff-able, free, and not locked to any vendor. A
  build-time schema validates each post so broken metadata can't ship.
- **Alternatives:** A hosted CMS (rejected: vendor lock-in, cost, and another
  system to learn for little benefit at this scale).

## 5. Cloudflare Pages for hosting

- **Status:** Superseded by #18 (Cloudflare Workers).
- **Decision:** Deploy to Cloudflare Pages, auto-building from the `main` branch.
- **Why:** Free tier with a fast global CDN, generous limits, simple Git
  integration, easy custom domains later. Good headroom as traffic grows.
- **Alternatives:** GitHub Pages (fine, slightly less headroom), Netlify/Vercel
  (also fine; Vercel is smoothest if we ever move to Next). The static output
  is portable, so this is a low-stakes, reversible choice.

## 6. "Soft neutral stone" palette; system theme + manual toggle

- **Status:** Palette superseded by #14; the theme behaviour (system default +
  remembered toggle) still stands.
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

## 14. "Forest on sepia" palette (supersedes the stone palette of #6)

- **Status:** Superseded by #21 (the sepia background was replaced with white;
  the forest-green accent survives).
- **Decision:** Warm cream/sepia backgrounds with a deep forest-green accent and
  warm-ink text; matching dark theme (warm-dark bg, light-green accent).
- **Why:** Green reads as nature and calm and fits a Himalayan trek/philosophy
  journal; sepia adds warmth. Together they give the site a distinct, grounded
  identity that the neutral stone lacked. Chosen from a green-on-cream vs
  green-on-sepia comparison; sepia won for being warmer and richer.

## 15. Display headlines in a grotesque (Space Grotesk)

- **Status:** Accepted (refines the typography of #11).
- **Decision:** Big headlines — page/post titles, the homepage lead, and the
  brand wordmark — use **Space Grotesk** (a bold geometric grotesque). Body text
  stays **Newsreader** serif, and in-article subheads (`h2`/`h3` inside a post)
  also stay serif so reading flow is calm. Small labels stay **Inter**.
- **Why:** A heavy grotesque gives titles a modern, punchy, editorial feel
  (matching the reference the author liked) while the serif keeps the reading
  experience literary. The serif/grotesque split is a deliberate contrast.

## 16. Homepage hero returns as "headline → image" (not text-over-photo)

- **Status:** Accepted (refines #13; the lead-story + list structure stands).
- **Decision:** The homepage still leads with the newest post, but now styled as
  a hero: kicker, large display headline, then a big image with an angled
  "cut corner", then the excerpt — image below the headline, never text over the
  photo. The journal index gained a thumbnail for every entry.
- **Why:** It brings back a prominent photo (which the author wanted) without the
  legibility problem of overlaying the title on the image. The cut corner is a
  small editorial flourish from the reference design.

## 17. Keystatic as a local-mode, dev-only editor (refines #4)

- **Status:** Superseded by #25 (the editor now ships to production in GitHub
  mode). Its central claim still holds: files in Git remain the source of
  truth, and the editor is a convenience rather than a backend.
- **Context:** Writing posts by hand-editing frontmatter is error-prone for a
  non-JS author. A visual editor was wanted without giving up #4's principles
  (no vendor lock-in, no backend, Git as the source of truth).
- **Decision:** Add **Keystatic** in *local* storage mode. The editor runs at
  `/keystatic` only during `npm run dev` (the integration is conditionally
  loaded in `astro.config.mjs`); it reads and writes `.mdoc` files on disk.
  Publishing is still commit + push. Production builds contain no editor, no
  React, no server.
- **Why:** All the convenience of a CMS form UI with none of the architecture
  cost — the built site is byte-for-byte as static as before, and deleting
  Keystatic would lose nothing but the editing UI. Posts moved from `.md` to
  `.mdoc` (Markdoc, rendered by `@astrojs/markdoc`), which stays
  Markdown-compatible for hand-editing.
- **Alternatives:** Hosted CMS (still rejected per #4); Keystatic's GitHub
  storage mode (needs an OAuth app and a deployed admin route — unnecessary
  while the author edits locally; can be revisited if editing from other
  devices becomes a need).

## 18. Deploy as a Cloudflare Worker with static assets (supersedes #5)

- **Status:** Accepted (supersedes #5).
- **Context:** #5 chose Cloudflare Pages. Cloudflare has since consolidated on
  Workers as its primary platform; the repo gained `wrangler.jsonc` and the
  `@astrojs/cloudflare` adapter, deploying the same static `dist/` as a Worker
  that serves assets.
- **Decision:** Host on **Cloudflare Workers** (static assets binding). Deploy
  with `npm run deploy` (wrangler), or via Workers Builds Git integration.
- **Why:** Same free CDN hosting and effectively the same static-site behavior,
  on the platform Cloudflare actively develops; keeps the door open for tiny
  server endpoints later *without* changing hosts (though heavy logic still
  belongs in a separate service per #7).
- **Trade-off:** Deploys go through wrangler instead of Pages' zero-config Git
  build, so the worker config is one more file to understand
  (`wrangler.jsonc`).

## 19. Post schema declared twice, guarded by a compile-time parity check

- **Status:** Accepted.
- **Context:** #17 made the post schema live in two places: the Zod schema in
  `src/content.config.ts` (build validation) and the field definitions in
  `keystatic.config.ts` (the editor). The two libraries have incompatible
  schema languages, so one can't simply import the other. Manual syncing
  invites silent drift: a field added to the editor but not the content schema
  (or vice versa) would only surface as confusing behavior much later.
- **Decision:** Keep both declarations, but enforce parity mechanically:
  `src/schema-parity.ts` derives the field-name sets from both configs at the
  type level and makes `npm run check` fail — naming the offending field — if
  they differ. Value types are deliberately not compared (Keystatic writes
  strings; Zod coerces), only field names, which are the actual contract.
- **Why:** Zero runtime cost and no new dependency, in keeping with #2/#7; the
  failure happens at the moment of the mistake, in the tool contributors
  already run. Docs (`AGENTS.md`, `README.md`) point schema-changers at both
  files.
- **Alternatives:** A code generator producing one config from the other
  (rejected: heavy machinery for eight fields); a runtime comparison script
  (rejected: needs a TS runner and duplicates what the type-checker gives for
  free); discipline alone (rejected: it already failed — this decision exists
  because the docs drifted).

## 20. Keyword search: a build-time index plus a vanilla-JS panel

- **Status:** Accepted.
- **Context:** Readers needed a way to find a post by keyword. `ROADMAP.md`
  Phase 1.5 anticipates a *semantic* search built on embeddings; this is the
  much smaller first step, and it had to fit the static architecture (#2, #7).
  Note that React was a dev-only dependency at the time (#17), so an island
  framework was not available for production pages anyway. #25 later shipped
  React to production for the editor, but only the editor route uses it —
  search remains plain JavaScript, and there is no reason to change that.
- **Decision:** Generate `/search-index.json` at build time (an Astro endpoint,
  `src/pages/search-index.json.ts`) holding each published post's title,
  description, tags, and URL. The header's `Search.astro` component fetches it
  lazily the first time the panel is opened and filters it in the browser.
  Matching is case-insensitive, and every whitespace-separated term must match,
  so extra words narrow the results. Each result is a real `<a href>`.
- **Why:** No server, no framework, no index bytes in any page until a visitor
  actually searches — the reading experience is unchanged for everyone who
  doesn't. Results being plain links means navigation works by the browser's own
  rules rather than bespoke JavaScript.
- **Trade-off / when to revisit:** Post *bodies* are not indexed, so search
  finds a post by its title, summary, or tags but not by a phrase buried in the
  text. That keeps the index small and is the right trade at this scale; when
  the archive grows or full-text matching is wanted, the natural upgrade is the
  Phase 1.5 embeddings index — which this endpoint is a sensible place to grow
  into.
- **Alternatives:** Embedding the index in every page's HTML (rejected: every
  reader pays for a feature few use, and it grows with the archive); a search
  library such as Pagefind or Fuse.js (rejected for now: a dependency and a
  bundle for what a dozen lines of filtering do at this size); a server-side
  search endpoint (rejected: violates #2/#7).

## 21. "Ink on white" palette (supersedes the sepia of #14)

- **Status:** Accepted (supersedes the palette in #14).
- **Context:** The sepia/cream background gave the site a warm, papery feel but
  read as dated next to the clean editorial sites the author had in mind, and
  it tinted the trek photography.
- **Decision:** White page (`#ffffff`) with a near-black ink (`#1a1a1a`), grey
  secondary text, and neutral hairlines. The **forest-green accent is kept**
  (#14's one surviving element), as is the light/dark toggle; the dark theme
  moves from warm-brown to neutral near-black (`#121212`).
- **Why:** White lets the photographs supply all the colour and makes long-form
  text maximally legible. Keeping the green preserves the site's identity and
  means link/accent behaviour, hover states, and the brand dot did not have to
  be redesigned.
- **Trade-off:** The site is less distinctive at a glance than the sepia was.
  That's the intended trade — the photographs, not the background, should be
  what's memorable.

## 22. Sections: an explicit `category` field and a left nav rail

- **Status:** Accepted.
- **Context:** With posts spanning treks, travel and philosophy, a single
  reverse-chronological feed made it hard to read one thread. Tags already
  existed but overlap (a post can be both `trek` and `reflection`), so they
  can't decide which section a post belongs to.
- **Decision:** Add a **required `category`** field to the post schema, drawn
  from a fixed list in `src/lib/categories.ts` (`stories`, `treks`,
  `philosophy`). One category per post. That file is the single source of
  truth: the Zod schema, the Keystatic dropdown, the nav rail, and the
  generated category pages (`src/pages/[category].astro`) all read from it, so
  adding a section is a one-line change. Navigation moves from the top bar into
  a **left rail** (sticky on desktop, a horizontal scrolling strip on phones);
  the top bar slims to brand, search, and the theme toggle.
- **Why:** An explicit field means a post's section is a decision the author
  makes once, in the editor's dropdown, rather than something inferred from
  tags and liable to change as tags are edited. Required-and-enumerated means a
  typo or a missing section fails the build (consistent with "validate, don't
  loosen"). Tags remain free-form for finer topics.
- **Trade-off:** A post can only live in one section, so a trek essay that is
  really about philosophy has to pick. Chosen deliberately: a post appearing in
  two sections makes the nav ambiguous and the reader unsure where they are.
- **Alternatives:** Deriving sections from tags (rejected: ambiguous for posts
  tagged both ways, and silently drops posts whose tags map to nothing);
  multi-category posts (rejected as above); generic tag pages (a good future
  addition, but it answers a different question — "more like this" rather than
  "where does this belong").

## 23. UI preferences live on `<html>` and are applied before paint

- **Status:** Accepted (generalises the theme mechanism from #6 to a second
  preference).
- **Context:** A hamburger in the header now collapses the section rail (#22).
  On a **static multi-page site every navigation is a full page load**, so a
  collapse toggle held only in memory would spring back open on the next click,
  making the feature pointless. Storing it isn't enough either: applying it
  after the page has rendered means every load flashes the rail open before it
  collapses.
- **Decision:** Any persisted UI preference is (a) written to `localStorage`,
  (b) reflected as a `data-` attribute on `<html>` that CSS keys off, and (c)
  re-applied by the single inline `<script is:inline>` in `BaseLayout`'s
  `<head>`, which runs before first paint. Currently two such preferences:
  `data-theme` and `data-rail`.
- **Why:** `<html>` is the only element that exists before the body renders, so
  it's the only place an attribute can drive styling with no flash. Keeping all
  of them in one inline script means there is exactly one blocking script in
  `<head>`, and adding a third preference is a couple of lines rather than a
  new pattern.
- **Trade-off:** That inline script is render-blocking and cannot be bundled or
  deferred — the cost of avoiding a flash. It's a few lines, wrapped in
  `try/catch` so that a browser with storage disabled degrades to the default
  rather than erroring.
- **Note on defaults:** the absence of the attribute is always the sensible
  default (theme follows the device; rail is shown), so a visitor with no
  JavaScript gets a working site and never sees the toggle — the button stays
  `hidden` until its script runs, the same progressive-enhancement rule the
  search button follows (#20).

## 24. The rail collapse animates a grid track, not `display`

- **Status:** Accepted (refines #23).
- **Context:** The first version of the collapse used `display: none`, which is
  not animatable — the rail vanished in one frame and the article jumped.
- **Decision:** Animate the grid track the rail occupies. On desktop the column
  goes `var(--sidebar-width) → 0`; on phones the row goes `1fr → 0fr` (the
  standard trick for animating to and from a content-determined height). The
  rail sets `overflow: hidden` so its contents are clipped as the track
  shrinks, and fades via opacity. Duration lives in one token,
  `--rail-collapse`, shared by both files.
- **Why:** Grid track sizes interpolate; `display` does not. Animating the
  track (rather than translating the rail out of view) means the article
  genuinely reflows into the freed space instead of the rail leaving a hole.
- **Consequences worth knowing:**
  - **Spacing moved inside the rail.** The grid `gap` had to go, because a gap
    survives its collapsed track as a stray offset. All 2.5rem of rail-to-article
    spacing is now `padding-right` on `.rail nav`, inside the clipped box.
  - **`visibility: hidden` is delayed** by the full collapse duration, so the
    links leave the tab order only once they are actually gone. The toggle
    additionally pulls focus back to itself when it hides a rail that currently
    holds focus — otherwise the browser drops focus to `<body>` and a keyboard
    user is silently returned to the top of the document.
  - **The mobile `1fr` row depends on `.shell` having an indefinite height.**
    Giving it a definite height (e.g. a `min-height: 100vh` sticky footer)
    would make `1fr` claim leftover space and the rail row would balloon. Noted
    in a comment at the rule.
  - `prefers-reduced-motion` drops both transitions, leaving the instant
    behaviour that #23 shipped.

## 25. The editor ships to production in GitHub mode (supersedes #17)

- **Status:** Accepted (supersedes #17).
- **Context:** #17 kept Keystatic dev-only, so editing required a laptop with
  the repo cloned. The author wanted to fix a typo, swap a photo or add a link
  from a browser, without that.
- **Decision:** Ship the editor. `keystatic.config.ts` moves from
  `storage: { kind: 'local' }` to `{ kind: 'github' }`, and
  `astro.config.mjs` stops gating the React and Keystatic integrations behind
  `process.argv.includes('dev')`. Keystatic injects two on-demand routes —
  `/keystatic` for the admin UI and `/api/keystatic/*` for GitHub auth. Saving
  commits to this repo through the GitHub API; the site then rebuilds as it
  always has.
- **Why this doesn't undo #2 or #7:** the site is still prerendered. Exactly
  two routes are rendered on demand, both of them the editor, and no reading
  page depends on a server. That is #7's "complexity at the edges" rather than
  a violation of it — a static core with an editing island bolted to the side.
- **Authorisation is GitHub's, not ours.** Whoever has write access to the repo
  can edit; nobody else. No user table, no password to store, no session
  system beyond an encrypted cookie holding the GitHub token.
- **Verified before committing** (a spike on the Workers runtime, not a guess):
  the admin UI renders and hydrates under `workerd` via `wrangler dev`, and the
  API route executes — failing only on its own "missing clientId" check.
  Crucially, **no reading page references the editor bundle**: every post,
  listing and category page ships the same three inline scripts as before.
  `dist` grows from 2.1MB to 5.9MB, all of it editor code only an admin loads.
- **Costs accepted:** an edit is a commit, so publishing waits for a rebuild
  (a minute or two, not instant — see #20's note on the same trade); the
  production build now contains React; and `/keystatic` becomes a publicly
  reachable URL, protected by GitHub login rather than by being unguessable.
- **Alternatives:** staying dev-only (rejected: the requirement was precisely
  to edit without a laptop); Keystatic Cloud (rejected for now: paid, and only
  needed if an editor without GitHub access is ever required); a hand-rolled
  admin with its own auth (rejected: storing credentials is a liability this
  project has no reason to take on).
