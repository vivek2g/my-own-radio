// What more than one script in this directory needs.
//
// Both image scripts — assert-web-safe-images.mjs (the check) and
// fix-images.mjs (the fixer) — had their own copy of everything below,
// identical down to the whitespace. That is the arrangement where a fix lands
// in one and silently misses the other, and where the checker and the fixer
// quietly start disagreeing about what "too big" means.
//
// Keep this to things genuinely used by two or more scripts. Anything one
// script owns belongs in that script, not here.
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

// The weight limit for a committed image. The check warns above it, the fixer
// shrinks above it — so it has to be one number, or the fixer could hand back
// a file the check still complains about. Anything over this is slow on a
// phone connection, even when it renders fine.
export const MAX_BYTES = 2_000_000;

// Lists every file under a directory, recursively.
//
// A missing directory yields an empty list rather than throwing: a repo with
// no images yet is not an error, and both callers want to carry on.
//
// assert-reader-pages-static.mjs deliberately keeps its own walker instead of
// using this one. It skips the _worker.js bundle, returns only .html, and
// wants the throw when dist/ is absent — different enough that sharing would
// mean options no other caller passes.
export async function walk(dir) {
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
