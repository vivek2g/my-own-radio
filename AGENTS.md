# AGENTS.md — operating manual for contributors

This file is the first thing a contributor (human or AI agent) should read
before working in this repository. It's a short operating manual: how to run the
project, where things live, the rules to follow, and what not to break. For
deeper context, follow the links in "Documentation map" below.

> If you are an AI agent: read this file and `docs/SPECIFICATION.md` before
> making changes. Respect the constraints in "Guardrails." When a choice has a
> recorded decision in `docs/DECISIONS.md`, follow it or propose superseding it
> explicitly — don't silently reverse it.

---

## What this project is

A personal, reading-first journal website (treks, travel, philosophy), built as
a **static site** with **Astro**, content authored as **Markdoc** (`.mdoc`)
files in Git — by hand or via the **Keystatic** editor at `/keystatic`, which
runs on the live site as well as locally — and hosted free on **Cloudflare
Workers** (static assets). A
later phase adds AI narration / a "radio." The
guiding qualities: reading-first, owned/portable, simple by default, low-cost,
understandable by a non-JavaScript author.

Full intent and requirements: `docs/SPECIFICATION.md`.

---

## Run, build, check

Prerequisites: Node.js at the version in `.nvmrc` (run `nvm use` if you use nvm).

```bash
npm install        # install dependencies (first time, or when deps change)
npm run dev        # local dev server with hot reload — use this to write/preview
                   # (also serves the Keystatic editor at /keystatic)
npm run build      # produce the static site in dist/
npm run preview    # build, then serve dist/ via wrangler (production-like snapshot)
npm run check      # type/content checks (includes the schema parity guard)
npm run deploy     # build + wrangler deploy to Cloudflare Workers
```

Common confusion: `npm run dev` reflects your latest edits live. `npm run
preview` rebuilds and then serves a *frozen snapshot* — edits made while it
runs won't appear until you rerun it. When iterating, use `dev`.

The npm registry may be unreachable from some sandboxes; `npm install` must be
run in an environment with network access.

---

## Where things live

```
src/
  content.config.ts   # the post schema (the content contract) — validated at build
  schema-parity.ts    # compile-time guard: content.config.ts ↔ keystatic.config.ts
  content/blog/       # the posts (Markdoc .mdoc). filename = URL slug
  layouts/            # page shells: BaseLayout (html/head/header/footer), PostLayout
  lib/                # categories.ts (the site's sections) + posts.ts (shared queries)
  components/         # reusable UI: Header, Sidebar (sections), PostList, Search, Footer
  pages/              # routes; file path = URL. index, about, blog/index, blog/[...slug]
  styles/global.css   # design tokens (CSS variables) + base styles; light & dark blocks
public/               # static assets served as-is (favicon, images/)
docs/                 # SPECIFICATION, ARCHITECTURE, DECISIONS, ROADMAP, CONTRIBUTING
```

Source of truth: the **code** for implementation details, the **docs** for
intent and rationale. If code and docs disagree, fix the docs.

---

## House rules

- **Add complexity at the edges.** Prefer build-time steps and small interactive
  "islands" over servers, databases, or frameworks. Don't convert the static
  site into a server app to satisfy one feature — stand up a separate service
  instead (`docs/DECISIONS.md` #7).
- **Reference tokens, not raw colors.** Use the CSS variables in `global.css`;
  never hardcode hex colors in components (it breaks theming and dark mode).
- **Keep motion optional.** Any animation must degrade gracefully without JS and
  honor `prefers-reduced-motion`.
- **Don't break post URLs.** A published post's slug/URL should stay stable.
- **Validate, don't loosen.** The content schema failing the build on bad
  metadata is a feature; keep it strict.
- **Changing the post schema? Touch both files.** The fields are declared in
  `src/content.config.ts` (build validation) *and* `keystatic.config.ts` (the
  editor). `src/schema-parity.ts` fails `npm run check` if they drift — that
  error naming a field means the other config still needs the matching change.
  **The guard compares field names only, not whether they're required.** If a
  field is required in Zod, give it `validation: { isRequired: true }` in
  Keystatic too, by hand — otherwise the editor will happily save a post the
  build then rejects, and the author finds out from a failed deploy.
- **Adding or renaming a section?** Edit `src/lib/categories.ts` only. The
  schema, the Keystatic dropdown, the nav rail, and the category pages all read
  from it. Renaming a slug changes that section's URL — see the URL rule above.
- **Write for a non-JS reader.** Comment the *why*; keep things approachable.
- **Record decisions.** Made a significant choice? Add an entry to
  `docs/DECISIONS.md`. Changed a contract? Update `docs/SPECIFICATION.md`.

## Guardrails (do not do without explicit human sign-off)

- Do not commit secrets or API keys. The editor's GitHub credentials live in
  `.env` locally (gitignored) and in Cloudflare for production — never in the
  repo, which is public. `.env.example` documents the names, never the values.
- Do not add analytics, trackers, or third-party scripts silently.
- Do not design any **music** feature assuming a particular catalog is legal to
  use. Music licensing is unresolved and deferred (`docs/DECISIONS.md` #10);
  verify terms before building, they change.
- Do not publish narrated or quoted content from copyrighted works; use the
  author's own writing or public-domain sources.
- Do not change the published color/theme behavior or remove the theme toggle
  without sign-off.

---

## Documentation map

- `README.md` — quick start, file layout, Cloudflare deploy steps.
- `docs/SPECIFICATION.md` — what the site is and must do (rebuildable spec).
- `docs/ARCHITECTURE.md` — how the code is structured; data flow; extension points.
- `docs/DECISIONS.md` — why each major choice was made.
- `docs/ROADMAP.md` — phased plan and how complexity is staged.
- `docs/CONTRIBUTING.md` — Git workflow and code conventions.

## A good first task for a new contributor

Run `npm run dev`, read `docs/SPECIFICATION.md`, then add a test post under
`src/content/blog/` and confirm it appears on the home and journal pages and at
its own URL. That exercise touches the content contract, routing, and the build,
and proves your environment works.
