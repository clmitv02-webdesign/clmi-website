# CLMI owner revisions — local review, 6 September 2026

Scope: the five homepage annotations and twelve inner-page annotations, implemented together. No remote push or Vercel deployment. Changes remain uncommitted on `codex/clmi-layered-refresh-20260905`, following `be1f87e`.

## Recovery

Full pre-edit copy: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-vibrant-revisions-2026-09-05-234349`. `diff -qr` reported no differences immediately after the copy. Earlier backups remain preserved.

## Annotation checklist

| Annotation | Implementation |
|---|---|
| Home 1 — menu | Original framed/red glow and shadow treatment; eight equal-width cells and active areas. |
| Home 2 — header | White centre with grey edges, not black. |
| Home 3 — YouTube shadows | Original image shadow and two lifted-corner shadow strips; original iframe sources retained. |
| Home 4 — ministry shadows | Same restored depth, with curved corners retained. |
| Home 5 — newsletter | Blue/magenta surface, gold accent/button, white input, responsive split layout. |
| Inner 1 — Outreach | New introduction and program copy; image-led community feature with colourful hospital/prison cards. |
| Inner 2 — Outreach buttons | Raised magenta and gold rectangular buttons with shadow. |
| Inner 3 — Events depth | Shadows on event containers and images. |
| Inner 4 — Events buttons | Shared raised button style and system sans typography. |
| Inner 5 — Events headings | Compact sans card headings replace oversized serif headings. |
| Inner 6 — Watch depth | Shadows on linked livestream/podcast image cards. |
| Inner 7 — Giving | Only the existing Giving introduction remains in the main content; checked white/grey hero preserved. |
| Inner 8 — About surface | Checked gradient continues behind overview, vision and mission, ending before Meet the Team. |
| Inner 9 — Team | Stronger card shadows; compact sans names. |
| Inner 10 — latest photos | 98 images from both existing 2026 albums, not the previous six highlights. |
| Inner 11 — archive navigation | Six image-led album cards replace loose pill links. Original six destinations retained. |
| Inner 12 — Branches | Dense searchable directory; 49 original contact articles preserved byte-for-byte. |

## Verification scope

- 36 automated tests pass, including gallery model, content preservation and owner revision contracts.
- 39 HTML routes and 431 unique local references extracted from HTML checked without failures by `tools/verify-refresh.mjs`.
- 78 route/viewport combinations: 39 routes at 1463×948 and 390×844. No horizontal document overflow, overflowing checked card headings, failed loaded images with a source, or browser error logs in this audit. Deferred images with no source are counted separately, not classified as broken.
- 18 opening-viewport screenshots saved, plus representative deeper visual reviews. This is not a claim of visual inspection of every element at every scroll position.
- Menu cells measured equally: 173.625px at 1463px and 119.25px at 996px. Mobile menu opens; keyboard dismissal exercised.
- Branch directory showed 10 complete contacts in the tested 1463×948 opening view. Search for Grootfontein returned two contacts; clearing restored 49. Phone layouts show fewer contacts.
- Gallery traversed 98 distinct image sources, each loaded and with exactly one active slide, then wrapped to the first. Autoplay, pause, explicit play after motion-off and direct selection of image 98 exercised.
- Home YouTube thumbnails rendered. External video playback, contact delivery and newsletter delivery were not tested. No form submissions or email actions occurred.
- Actual OS reduced-motion preference and JavaScript-disabled browser mode remain unverified; source-level fallback and motion-off query checks exist.

Evidence: `docs/evidence/vibrant-revisions/layout-audit.json`, `gallery-audit.json`, and route screenshots.

## Maintaining the latest convention slideshow

`tools/sync-convention-gallery.mjs` scans local dated Convention photo archives, selects the highest nonempty year and combines its photo sets. The two current 2026 albums contain 49 files each, 98 distinct file hashes. It generates Gallery figures and `public/assets/latest-convention.json`.

Run `node tools/sync-convention-gallery.mjs --check` to check consistency. `--build` regenerates the output and is configured as the future Vercel build command. A newly added dated convention album takes over on the next build; this does not fetch or monitor remote photos. Historical `tools/rebuild-inner-pages.py` writing is disabled to avoid overwriting these owner revisions; its `--check` inventory mode remains available.

Primary files: `public/assets/revision.css`, `convention-gallery.js`, `inner-pages.js`; Home, Outreach, About, Giving, Branches and Gallery HTML; Gallery generator/model; revision tests. Production remains untouched.
