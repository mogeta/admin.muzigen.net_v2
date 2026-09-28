# Blog image galleries

New gallery images use Cloudflare R2 and a custom-domain CDN. See [R2 setup](./R2_SETUP.md) for the required server secrets, domain configuration and rollout checks. Ordinary single-image uploads and existing Firebase Storage URLs are unchanged.

Articles may contain a fenced `gallery` block anywhere in Markdown. The admin editor generates and edits these blocks; existing articles and ordinary images are unchanged.

````markdown
本文

```gallery
{"version":1,"images":[{"src":"https://example.com/photo.webp","thumbnail":"https://example.com/photo-thumb.webp","alt":"写真の説明"}]}
```

続きの本文
````

Each block supports 1–200 images with HTTPS full-size and thumbnail URLs and a text description. Multiple galleries are independent. Invalid blocks display a readable error. Thumbnail links still open images when JavaScript is unavailable.

The grid uses three columns on mobile and four from 768px. The native dialog supports close button, background click, Escape, previous/next buttons and arrow keys, with focus restoration and background scroll locking. Full-size images are fetched on opening.

`src/lib/gallery/` is intentionally identical to `lib/gallery/` in `mogeta/admin.muzigen.net_v2`; keep the renderer, declaration and CSS in sync when changing the format. No Firestore migration is needed.

## Release and verification

Deploy this public renderer before enabling gallery authoring in the admin. Article changes require a new public-site build; the existing workflow deploys on pushes to `main` and creates PR previews. Saving a post alone does not trigger that workflow.

Automated check: `node --test tests/gallery.test.mjs`, `pnpm astro check`, `pnpm build`.

Human smoke check (browser automation intentionally omitted):

- Create a draft with text before/after two galleries and an ordinary inline image.
- Upload several landscape/portrait images. Reorder, change descriptions, exclude one, insert, save, reload and edit again.
- Check phone and desktop previews, square crops and image order.
- Open an image; ensure the entire photo fits. Test next/previous, arrow keys, ×, Escape and background click, then keyboard focus and page scrolling after closing.
- Check a failed upload can be retried without duplicating successful images.
- Publish a test article and rebuild the public site, then repeat the display checks.

Gallery uploads produce 480px square thumbnails and full images bounded to 2400×2400, with EXIF rotation and no enlargement. Animated inputs are represented by a still image. Excluding an image removes its article reference, not its uploaded file. Unused-file cleanup and automatic rebuilds on article save are outside this change.
