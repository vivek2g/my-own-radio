# Images

Static images live here and are referenced from posts with a `/images/...`
path.

## Post lead images

A post can have a lead image. It shows on the post's own page and as the
thumbnail (or large lead image) on the home page.

1. Save your image here, e.g. `public/images/post-kedarkantha.jpg`.
2. In the post's frontmatter, set:

   ```yaml
   heroImage: "/images/post-kedarkantha.jpg"
   heroAlt: "Short description of what's in the photo, for accessibility."
   ```

A post without `heroImage` still works — it falls back to the shared default
image `post-default.svg` (a minimal stone mountain graphic), so the layout
always has an image.

### Recommended

- **Orientation/shape:** wide landscape. Images are displayed at a 16:9 crop, so
  keep the important content away from the extreme top/bottom edges.
- **Size:** around 1600–2000px wide is plenty. Export a compressed JPEG
  (quality ~75–80); aim for roughly under ~500 KB so pages stay fast.
- **Alt text:** always fill `heroAlt` — it's read by screen readers and shown if
  the image fails to load.

## Current files

- `post-chaukhamba.jpg`, `post-ridge.jpg`, `post-walking.jpg` — sample images for
  the three sample posts (derived from `IMG_0370.JPG`). Replace with your own
  per-post photos.
- `post-default.svg` — the default fallback image used for posts with no
  `heroImage`. Edit this file to change the placeholder for the whole site.
- `IMG_0370.JPG` — the original Madhyamaheshwar source photo (kept as a backup).
- `hero.jpg` — a cropped/cooled version from the earlier full-bleed hero design,
  now unused. Safe to delete if you don't repurpose it.
