# CLMI inner-page rebuild — local review, 2026-09-05

## Outcome and recovery

38 inner HTML routes now use responsive content layouts and one shared CLMI visual system. The homepage remains the familiar, previously refreshed entry point. No Vercel deployment, remote push or merge was performed.

Source: `/Users/ob/Documents/Claude/clmi-site`, branch `codex/clmi-layered-refresh-20260905`.
Backup before this rebuild: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-inner-page-rebuild-2026-09-05-224256`. The copy matched the source with `diff -qr` before implementation.
Preview: `http://127.0.0.1:8123/youth-movement/` (server `node tools/server.js 8123`).

## Experience and implementation

The desired experience is recognition, orientation and belonging: visitors should recognise the same church, understand the page they opened, and find a relevant next step. Youth uses six named program cards; program pages use readable prose; archives use responsive photo grids; About, Branches and Contact use structured information. Four sparse pages have restrained introductions and contact navigation without invented schedules, services or donation details.

The approved homepage and Children's Ministry supply the palette and typography: deep green, warm paper, Helvetica body text and Georgia editorial headings. Reading sections stay still. Selected artwork has at most 16px of scroll depth, and the desktop header condenses on scroll. There is no pinned scroll or delayed reveal that hides content. Phone layouts stack naturally. This is a visual-cohesion judgment, not evidence of improved visitor retention.

Shared files: `public/assets/inner-pages.css`, `inner-pages.js`, `site-nav.js`. Served pages are complete static HTML; `tools/rebuild-inner-pages.py` is a development helper, not a runtime dependency. The backup-derived `docs/inner-content-ledger.json` records preservation checks. Approved Children program photos/tabs, information-only panels, Gallery photos and original URLs remain. Homepage media/player references are covered by preservation tests.

The original local Convention 2026 set contained 49 referenced photos, while the website directory had 15. Restored the 34 missing files from `/Users/ob/Documents/Claude/convention-2026/site/images/web`, without overwriting the existing 15. SHA-256 comparison confirmed all 49 now match that source set.

## Fresh verification

- `node --test tests/*.test.mjs`: 30 tests passed, zero failures. Covers 21 existing contracts and nine inner-page contracts, including content preservation, photo existence, six Youth destinations, Gallery no-JS markup and distinct Watch-link labels.
- `node tools/verify-refresh.mjs <backup>`: 39 HTML routes and 436 unique local references, zero failures; homepage backup-content preservation true.
- Syntax checks for `inner-pages.js`, `home-refresh.js` and `site-nav.js` succeeded. `git diff --check` produced no errors.
- Final browser audit: 38 inner routes at 1280×800 and 390×844, 76 route/viewport combinations. One main and one h1 per route, no measured horizontal overflow, no failed already-loaded images, and no browser error logs at the sampled opening viewports. Saved screenshots and measurements are in `docs/evidence/inner/` and `layout-audit.json`. Screenshots/contact sheets were visually reviewed by layout family, plus deeper About/team and Children program sections.
- Mobile Menu click and Enter opened navigation; Escape closed it. Youth Service navigation reached `/about-5/` with the expected heading. Children Evangelism click and ArrowRight to Christmas Gift changed the visible panel.
- Gallery: each of six photo controls produced one active photo with 1080px natural width and zero overflow at phone width. `?motion=off` kept the active photo unchanged over 5.2 seconds. Archive links have 24px phone-side spacing. The 2024 Convention Gallery link reached its preserved legacy URL and displayed 33 photo elements.
- Normal Youth scrolling changed hero-media translation from approximately -1.34px to -7.64px and condensed the header by 78px at scrollY 400. Youth `?motion=off` disabled its artwork transform.
- Independent source review raised Gallery no-JS and Watch-label concerns. Both were fixed; scoped re-review of `75f82ea` and `2dfe30a` found no unresolved actionable issues.

## Limitations and next step

Browser coverage samples opening viewports, not every scroll position or every third-party playback condition. Deferred/offscreen media was not exhaustively played. Live YouTube playback across watch pages remains unverified in this pass. Actual OS reduced-motion switching and a JavaScript-disabled browser session were not available in the review interface; those fallbacks were source/test-reviewed, while the motion-off query was exercised in the browser. Forms, email links, WhatsApp sending and payments were not activated.

Some inherited archive paths do not match their human-readable content titles; URLs and source content were intentionally preserved. See the content ledger/report before any future editorial rename. Owner visual approval is pending. Review locally and refine; publish only after a new explicit Vercel instruction.
