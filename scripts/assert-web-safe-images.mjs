// Catches images a browser cannot actually display, and posts pointing at
// images that aren't there.
//
// This exists because of a real miss: a photo uploaded straight from an
// iPhone arrived as .heic, was committed, passed every check we had, and went
// live — where no browser could render it. The checks were green and the page
// was broken. Nothing here knew that HEIC isn't a web format, so nothing
// complained.
//
// Two things are verified:
//   1. Every file under public/images uses a format browsers can render.
//   2. Every heroImage a post refers to actually exists on disk.
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const IMAGES = join(ROOT, 'public/images');
const POSTS = join(ROOT, 'src/content/blog');

// Formats every current browser can display.
const WEB_SAFE = new Set(['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg']);
// Common camera/scanner formats that look fine on a Mac and break on the web.
const KNOWN_BAD = new Set(['.heic', '.heif', '.tif', '.tiff', '.bmp', '.raw', '.cr2', '.nef', '.dng']);
// Anything over this is slow on a phone connection, even if it renders.
const MAX_BYTES = 2_000_000;

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

const problems = [];
const warnings = [];

for (const file of await walk(IMAGES)) {
  const ext = extname(file).toLowerCase();
  const rel = relative(ROOT, file);
  if (ext === '.md') continue;

  if (KNOWN_BAD.has(ext)) {
    problems.push(
      `${rel}\n      ${ext} is not a web image format — browsers cannot display it.\n` +
        `      Convert it:  npm run fix:images`
    );
  } else if (!WEB_SAFE.has(ext)) {
    problems.push(`${rel}\n      unrecognised image format "${ext}".`);
  } else {
    const { size } = await stat(file);
    if (size > MAX_BYTES) {
      warnings.push(`${rel} is ${(size / 1_000_000).toFixed(1)}MB — consider resizing.`);
    }
  }
}

// Every heroImage must point at a file that exists.
for (const post of (await walk(POSTS)).filter((f) => f.endsWith('.mdoc'))) {
  const text = await readFile(post, 'utf8');
  const match = text.match(/^heroImage:\s*["']?([^"'\n]+)["']?\s*$/m);
  if (!match) continue;
  const value = match[1].trim();
  if (!value || value === 'null') continue;
  const onDisk = join(ROOT, 'public', value.replace(/^\//, ''));
  try {
    await stat(onDisk);
  } catch {
    problems.push(`${relative(ROOT, post)}\n      heroImage points at ${value}, which does not exist.`);
  }
}

for (const w of warnings) console.warn(`  warning: ${w}`);

if (problems.length > 0) {
  console.error('\nImage problems that would reach readers:\n');
  for (const p of problems) console.error(`    ${p}\n`);
  process.exit(1);
}

console.log('OK — all images are web-displayable and every heroImage resolves.');
