// Guards the site's central promise: a reading page ships no framework
// JavaScript.
//
// This became worth enforcing when the Keystatic editor started shipping to
// production (docs/DECISIONS.md #25). React is now in the build, and the only
// thing keeping it off reader pages is that no reader page imports it — true
// today, but nothing would tell us if that changed. A comment claiming it is
// not a guarantee; this is.
//
// It asserts that no prerendered page references an external script bundle.
// Inline scripts (the theme toggle, search) are fine and expected — they are
// small, hand-written, and shipped deliberately.
//
// If this fails because you added an interactive island on purpose, that is a
// real architectural decision: record it in docs/DECISIONS.md and add the page
// to ALLOWED below, rather than deleting the check.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

// fileURLToPath, not URL.pathname — this project's path contains spaces, which
// pathname would hand back percent-encoded.
const DIST = fileURLToPath(new URL('../dist/', import.meta.url));

// Pages permitted to load a bundle. The editor is not here because it is not
// prerendered — it renders on demand, so it never appears as a .html file.
const ALLOWED = new Set();

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    // _worker.js is the server bundle, not a page anyone is served directly.
    if (entry.isDirectory()) {
      if (entry.name === '_worker.js') continue;
      found.push(...(await htmlFiles(path)));
    } else if (entry.name.endsWith('.html')) {
      found.push(path);
    }
  }
  return found;
}

const pages = await htmlFiles(DIST);
if (pages.length === 0) {
  console.error('No built pages found in dist/. Run `npm run build` first.');
  process.exit(1);
}

const offenders = [];
for (const page of pages) {
  const rel = relative(DIST, page);
  if (ALLOWED.has(rel)) continue;
  const html = await readFile(page, 'utf8');
  const scripts = [...html.matchAll(/<script[^>]+src=["']([^"']+)["']/g)].map((m) => m[1]);
  if (scripts.length > 0) offenders.push({ page: rel, scripts });
}

if (offenders.length > 0) {
  console.error('Reader pages must not load JavaScript bundles.\n');
  for (const { page, scripts } of offenders) {
    console.error(`  ${page}`);
    for (const s of scripts) console.error(`    -> ${s}`);
  }
  console.error(
    '\nIf this is deliberate, record the decision in docs/DECISIONS.md and add\n' +
      'the page to ALLOWED in scripts/assert-reader-pages-static.mjs.'
  );
  process.exit(1);
}

console.log(`OK — ${pages.length} prerendered pages, none loading a JS bundle.`);
