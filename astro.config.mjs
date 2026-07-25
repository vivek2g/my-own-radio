// @ts-check
import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

// Keystatic's editor (and its React admin UI) run ONLY during local dev, so the
// production build stays a pure static site that needs no server adapter.
//   - `astro dev`   → process.argv includes "dev"  → editor enabled
//   - `astro build` → no "dev"                     → static, no editor routes
// Markdoc is always on, because it renders the post bodies in production too.
const isDev = process.argv.includes('dev');

// https://astro.build/config
export default defineConfig({
  site: 'https://my-own-radio.vivek-k2g.workers.dev',
  output: 'static',
  integrations: [markdoc(), ...(isDev ? [react(), keystatic()] : [])],
});
