# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read `AGENTS.md` first — it is the operating manual for this repo (house rules, guardrails, doc map). This file only adds what Claude needs beyond it.

## Commands

```bash
npm run dev        # dev server with hot reload; also the ONLY way to run the Keystatic editor (/keystatic)
npm run build      # static build into dist/
npm run preview    # build + serve via `wrangler dev` (production-like, frozen snapshot)
npm run check      # astro check — type + content-schema validation
npm run deploy     # build + `wrangler deploy` to Cloudflare Workers
```

There are no tests or linters; `npm run check` is the verification step. CI (`.github/workflows/ci.yml`) runs check + build on pushes and PRs.

## Architecture essentials

Static Astro site, deployed to **Cloudflare Workers** (via `wrangler.jsonc` + `@astrojs/cloudflare` adapter serving `dist/` as static assets).

- **Content pipeline:** posts are `.mdoc` (Markdoc) files in `src/content/blog/`; filename = URL slug. Frontmatter is validated at build time against the Zod schema in `src/content.config.ts`. The Keystatic schema in `keystatic.config.ts` mirrors it — **changing post fields means updating both files**; the compile-time guard in `src/schema-parity.ts` makes `npm run check` fail (naming the field) if they drift.
- **Keystatic is dev-only:** `astro.config.mjs` includes the React + Keystatic integrations only when `process.argv` contains `dev`. Production builds are pure static output with no editor routes and no React. Keystatic uses local storage: the editor at `/keystatic` writes post files to disk; publishing = commit + push.
- **Routing:** file-based under `src/pages/`; `blog/[...slug].astro` generates one static page per non-draft post via `getStaticPaths()`.
- **Styling:** all design tokens (colors, fonts, fluid type scale) are CSS variables in `src/styles/global.css`, with light and dark blocks. Components must reference tokens, never hardcoded hex values.
- **Layer discipline:** pages → layouts → components → content/tokens. New capability belongs at build time or in isolated islands — never convert the static site into a server app (see `docs/DECISIONS.md` #7).

## Key constraints (from AGENTS.md — see it for the full list)

- Don't break published post URLs (slugs are stable).
- Keep the content schema strict; a build failure on bad frontmatter is intentional.
- No analytics, trackers, or third-party scripts without explicit sign-off.
- Significant choices go in `docs/DECISIONS.md`; contract changes go in `docs/SPECIFICATION.md`. If code and docs disagree, fix the docs.
