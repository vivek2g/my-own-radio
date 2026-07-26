// Converts camera-format photos (.heic from an iPhone, .tiff from a scanner)
// into web-displayable JPEGs, resizes anything oversized, and repoints the
// posts that referenced them.
//
// Run it after uploading a photo the editor accepted but browsers can't show:
//   npm run fix:images
//
// Uses `sips`, which ships with macOS and reads HEIC natively. On another OS
// this will tell you rather than fail silently — convert by hand and rerun
// `npm run verify:images` to confirm.
import { readdir, readFile, writeFile, stat, unlink } from 'node:fs/promises';
import { join, relative, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const IMAGES = join(ROOT, 'public/images');
const POSTS = join(ROOT, 'src/content/blog');

const CONVERT = new Set(['.heic', '.heif', '.tif', '.tiff', '.bmp']);
const SHRINK = new Set(['.jpg', '.jpeg', '.png']);
const MAX_WIDTH = 2000; // plenty for a full-width hero on a large screen
const MAX_BYTES = 2_000_000; // above this a phone connection notices

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

try {
  await run('which', ['sips']);
} catch {
  console.error('`sips` not found — this helper needs macOS. Convert the file to');
  console.error('JPEG by hand, then run `npm run verify:images`.');
  process.exit(1);
}

const all = await walk(IMAGES);
const targets = all.filter((f) => CONVERT.has(extname(f).toLowerCase()));

// Already-web-safe images that are simply too heavy get resized in place —
// same filename, so nothing needs repointing.
const oversized = [];
for (const f of all) {
  if (!SHRINK.has(extname(f).toLowerCase())) continue;
  if ((await stat(f)).size > MAX_BYTES) oversized.push(f);
}

for (const file of oversized) {
  const before = (await stat(file)).size;
  await run('sips', [
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', '82',
    '--resampleWidth', String(MAX_WIDTH),
    file, '--out', file,
  ]);
  const after = (await stat(file)).size;
  console.log(
    `resized ${relative(ROOT, file)} ` +
      `(${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB)`
  );
}

if (targets.length === 0) {
  if (oversized.length === 0) console.log('Nothing to do — all images are web-ready.');
  else console.log('\nDone. Run `npm run verify:images` to confirm, then commit.');
  process.exit(0);
}

const renames = [];
for (const file of targets) {
  const out = join(dirname(file), `${basename(file, extname(file))}.jpg`);
  await run('sips', [
    '-s', 'format', 'jpeg',
    '-s', 'formatOptions', '82',
    '--resampleWidth', String(MAX_WIDTH),
    file, '--out', out,
  ]);
  const before = (await stat(file)).size;
  const after = (await stat(out)).size;
  await unlink(file);
  renames.push([`/${relative(join(ROOT, 'public'), file)}`, `/${relative(join(ROOT, 'public'), out)}`]);
  console.log(
    `converted ${relative(ROOT, file)} -> ${basename(out)} ` +
      `(${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB)`
  );
}

// Repoint any post that referenced the old filename.
for (const post of (await walk(POSTS)).filter((f) => f.endsWith('.mdoc'))) {
  let text = await readFile(post, 'utf8');
  const original = text;
  for (const [from, to] of renames) text = text.split(from).join(to);
  if (text !== original) {
    await writeFile(post, text);
    console.log(`updated ${relative(ROOT, post)}`);
  }
}

console.log('\nDone. Run `npm run verify:images` to confirm, then commit.');
