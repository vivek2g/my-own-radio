# Images

## Hero photo

Save your homepage hero photo in this folder as **`hero.jpg`**:

```
public/images/hero.jpg
```

The homepage hero (`src/components/Hero.astro`) points at `/images/hero.jpg`.
Add the file, run `npm run dev`, and it appears. Until then the hero shows a
plain earthy fallback color (so the site still builds).

### Recommended for the hero

- **Orientation:** wide / landscape. Your Madhyamaheshwar shot of Chaukhamba
  works well here.
- **Size:** at least 2000px wide. Export a compressed JPEG (quality ~75–80) so
  it loads fast — aim for under ~500 KB if you can.
- **Composition:** the title sits at the lower-left over a dark scrim, so keep
  the lower-left reasonably uncluttered. The scrim keeps light text readable
  over any photo.
- **Focal point:** the hero is cropped to fill the screen using
  `background-position: center 42%` in `Hero.astro`. If your subject gets cut
  off on some screens, tweak that value (e.g. `center 35%`).

To use a different filename or per-post heroes later, pass the `image` prop:
`<Hero image="/images/some-other-photo.jpg" />`.

## Other images

Anything you reference from a post with a normal path (e.g.
`![caption](/images/manali-1.jpg)`) can live here too.
