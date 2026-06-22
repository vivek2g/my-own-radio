// @ts-check
import { defineConfig } from 'astro/config';

// Astro configuration.
// `site` is used to generate absolute URLs (canonical links, RSS, sitemaps).
// Update this to your real Cloudflare Pages / custom domain when you have one.
// See: https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://my-own-radio.pages.dev',
  // Build a fully static site (default). Cloudflare Pages serves the `dist/` folder.
  output: 'static',
});
