// @ts-check
import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

// The editor now ships to production so posts can be edited from a browser
// (docs/DECISIONS.md #25, superseding #17). Keystatic injects two on-demand
// routes — /keystatic (the React admin UI) and /api/keystatic/* (its GitHub
// auth) — and everything else stays prerendered.
//
// Reading pages are unaffected: Astro only sends a page the JS it actually
// uses, and no reader page uses React. Verified in the build output — no post
// or listing page references the editor bundle.

// https://astro.build/config
export default defineConfig({
  site: 'https://my-own-radio.vivek-k2g.workers.dev',
  output: 'static',
  adapter: cloudflare(),
  integrations: [markdoc(), react(), keystatic()],
});
