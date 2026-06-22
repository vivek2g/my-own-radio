# Contributing / Working conventions

Notes for keeping the project consistent and ready for another developer to
join. Even while it's a solo project, following these makes onboarding painless.

## Environment

- Node version is pinned in `.nvmrc` (currently 22). Run `nvm use` or install a
  matching version.
- Install dependencies with `npm install`. Commit `package-lock.json` so
  everyone resolves the exact same dependency versions.
- Never commit `node_modules/`, `dist/`, or `.astro/` — they're in
  `.gitignore` and are regenerated.

## Git workflow

- `main` is the deployable branch. Cloudflare Pages builds whatever is on
  `main`.
- For anything non-trivial, work on a branch and open a pull request, even
  solo — it gives you a build preview and a review surface.
- Suggested commit message style (Conventional Commits):
  - `feat: add semantic search to journal`
  - `post: manali trek day 1`
  - `fix: correct canonical URL on post pages`
  - `docs: explain Cloudflare deploy steps`
  - `chore: bump astro to 5.x`

## Adding a post

See the README's "Writing a post" section. Rules of thumb:

- File name = URL slug. Use lowercase words separated by hyphens.
- Always fill `title`, `description`, and `pubDate`.
- Use `draft: true` while a post is unfinished; it won't appear on the site.

## Code conventions

- Run `npm run check` before committing to catch type/content errors.
- Keep components small and single-purpose; put shared styles in
  `global.css`, component-specific styles in the component's `<style>` block.
- Prefer Astro components for static UI. Only reach for a React/Svelte island
  when something genuinely needs interactivity in the browser.
- Comment the *why*, not the *what*. The code already says what it does.

## Definition of "done" for a change

1. `npm run dev` shows the change working locally.
2. `npm run build` succeeds with no errors.
3. `npm run check` passes.
4. Committed with a clear message and pushed; Cloudflare preview looks right.
