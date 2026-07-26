// Makes uploaded photos web-ready: converts camera formats (.heic from an
// iPhone, .tiff from a scanner) to JPEG, shrinks anything too heavy for a
// phone connection, and repoints the posts that referenced the old filename.
//
// Runs in two places:
//   - by hand, `npm run fix:images`, on a laptop;
//   - automatically in CI after a save from the browser editor, which is the
//     one that matters — see .github/workflows/fix-images.yml. The editor
//     cannot convert on upload (its UI is prebuilt and not ours to change), so
//     this runs immediately afterwards instead.
//
// Two image toolchains are supported because those two places differ: macOS
// has `sips` built in and reads HEIC natively; the Linux CI runner uses
// ImageMagick, with `heif-convert` as a fallback when ImageMagick was built
// without HEIF support.
import { readdir, readFile, writeFile, stat, unlink, rename } from 'node:fs/promises';
import { join, relative, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';

const run = promisify(execFile);
const ROOT = fileURLToPath(new URL('../', import.meta.url));
const IMAGES = join(ROOT, 'public/images');
const POSTS = join(ROOT, 'src/content/blog');

const CONVERT = new Set(['.heic', '.heif', '.tif', '.tiff', '.bmp']);
const SHRINK = new Set(['.jpg', '.jpeg', '.png']);
const MAX_WIDTH = 2000; // plenty for a full-width hero on a large screen
const MAX_BYTES = 2_000_000; // above this a phone connection notices
const QUALITY = 82;

async function has(cmd) {
  try {
    await run('which', [cmd]);
    return true;
  } catch {
    return false;
  }
}

const tools = {
  sips: await has('sips'),
  magick: (await has('magick')) ? 'magick' : (await has('convert')) ? 'convert' : null,
  heifConvert: await has('heif-convert'),
};

if (!tools.sips && !tools.magick) {
  console.error('No image tool available. Install ImageMagick (`brew install imagemagick`');
  console.error('or `apt-get install imagemagick`), then rerun.');
  process.exit(1);
}

// Write `src` to `dest` as a JPEG no wider than MAX_WIDTH.
async function toJpeg(src, dest) {
  if (tools.sips) {
    await run('sips', [
      '-s', 'format', 'jpeg',
      '-s', 'formatOptions', String(QUALITY),
      '--resampleWidth', String(MAX_WIDTH),
      src, '--out', dest,
    ]);
    return;
  }
  const resize = ['-resize', `${MAX_WIDTH}x>`, '-quality', String(QUALITY)];
  try {
    await run(tools.magick, [src, ...resize, dest]);
  } catch (err) {
    // ImageMagick without a HEIF delegate: decode first, then resize.
    if (!tools.heifConvert) throw err;
    const staged = join(tmpdir(), `${basename(src, extname(src))}-staged.jpg`);
    await run('heif-convert', ['-q', String(QUALITY), src, staged]);
    await run(tools.magick, [staged, ...resize, dest]);
    await unlink(staged).catch(() => {});
  }
}

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

const all = await walk(IMAGES);
const renames = [];
let changed = 0;

// 1. Formats no browser can display.
for (const file of all.filter((f) => CONVERT.has(extname(f).toLowerCase()))) {
  const out = join(dirname(file), `${basename(file, extname(file))}.jpg`);
  const before = (await stat(file)).size;
  await toJpeg(file, out);
  const after = (await stat(out)).size;
  await unlink(file);
  renames.push([
    `/${relative(join(ROOT, 'public'), file)}`,
    `/${relative(join(ROOT, 'public'), out)}`,
  ]);
  changed++;
  console.log(
    `converted ${relative(ROOT, file)} -> ${basename(out)} ` +
      `(${(before / 1e6).toFixed(1)}MB -> ${(after / 1e6).toFixed(1)}MB)`
  );
}

// 2. Displayable but too heavy. Resized in place, so nothing needs repointing.
for (const file of all.filter((f) => SHRINK.has(extname(f).toLowerCase()))) {
  let size;
  try {
    size = (await stat(file)).size;
  } catch {
    continue; // converted away in step 1
  }
  if (size <= MAX_BYTES) continue;
  const staged = join(tmpdir(), `resize-${basename(file)}.jpg`);
  await toJpeg(file, staged);
  await rename(staged, file);
  changed++;
  console.log(
    `resized ${relative(ROOT, file)} ` +
      `(${(size / 1e6).toFixed(1)}MB -> ${((await stat(file)).size / 1e6).toFixed(1)}MB)`
  );
}

// 3. Point the posts at any new filenames.
for (const post of (await walk(POSTS)).filter((f) => f.endsWith('.mdoc'))) {
  let text = await readFile(post, 'utf8');
  const original = text;
  for (const [from, to] of renames) text = text.split(from).join(to);
  if (text !== original) {
    await writeFile(post, text);
    console.log(`updated ${relative(ROOT, post)}`);
  }
}

console.log(
  changed === 0
    ? 'Nothing to do — all images are web-ready.'
    : `\nFixed ${changed} image${changed === 1 ? '' : 's'}.`
);
