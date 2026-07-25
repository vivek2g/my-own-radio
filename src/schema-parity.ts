// Schema parity guard — keeps the two post schemas from drifting apart.
//
// The post's shape is declared twice, on purpose, in two different languages:
//   1. src/content.config.ts  (Zod)      — what Astro validates at build time.
//   2. keystatic.config.ts    (Keystatic) — what the editor shows and writes.
// They must always describe the same frontmatter fields. This file makes that
// a *compile-time contract*: it derives the field names from both configs and
// fails `npm run check` if either side has a field the other doesn't — with an
// error message that names the offending field.
//
// This file is types only. It is never imported by the site and adds zero
// bytes to the build; deleting it would not change the site, only remove the
// safety net.
//
// What is intentionally NOT compared:
//   - Value types. Keystatic writes dates as strings; Zod's `z.coerce.date()`
//     turns them into Date objects, and Keystatic's "optional" often means
//     `null`/empty-string where Zod uses `undefined`. Those mismatches are the
//     normal serialize/parse boundary, not drift. Field *names* are the
//     contract.
//   - Keystatic's `content` field: that's the post body, not frontmatter.
import type { z } from 'astro:content';
import type { Entry } from '@keystatic/core/reader';
import type { blogSchema } from './content.config';
import type keystaticConfig from '../keystatic.config';

// The frontmatter fields as Astro sees them.
type AstroPost = z.infer<typeof blogSchema>;

// The fields as the Keystatic editor writes them (minus the body).
type KeystaticPost = Entry<
  NonNullable<(typeof keystaticConfig)['collections']>['posts']
>;
type KeystaticFrontmatterKeys = Exclude<keyof KeystaticPost, 'content'>;

// If a field exists on one side but not the other, it shows up in one of
// these two types (which should both be `never`).
type MissingFromKeystatic = Exclude<keyof AstroPost, KeystaticFrontmatterKeys>;
type MissingFromAstro = Exclude<KeystaticFrontmatterKeys, keyof AstroPost>;

// The guard itself. If parity breaks, `npm run check` fails here with:
//   Type '"someField"' does not satisfy the constraint 'never'.
// → add the named field to the config that's missing it (or remove it from
//   the one that still has it).
// (Exported only so the type-checker doesn't flag them as unused — nothing
// imports this module.)
type MustBeNever<T extends never> = T;
export type AstroFieldMissingInKeystaticConfig = MustBeNever<MissingFromKeystatic>;
export type KeystaticFieldMissingInContentConfig = MustBeNever<MissingFromAstro>;
