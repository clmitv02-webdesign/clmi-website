# CLMI finishing touches — 6 September 2026

Local-only revision under OB's instruction to build without another approval gate. No push, commit or Vercel deployment.

## Recovery and scope

Backup: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-motion-polish-2026-09-06-004120`. Full copy matched with `diff -qr` before edits. Prior uncommitted revisions remain preserved.

1. Desktop menu reduced from54px to44px; eight equal-width cells retained.
2. About's original abstract artwork removed as a standalone hero image and moved behind overview, vision and mission. The initial pale scrim was rejected by OB; see the correction below. Team section retains its separate surface.
3. Gallery uses1.8s opacity dissolves, a16px glide and3.5% slow zoom;7.2s automatic cadence. Visible count/select/pause/progress removed; previous/next arrows retained. Keyboard focus stops automatic advancement; viewport Space toggles pause without adding visible controls. Reduced motion disables automatic movement. Fixed a pre-existing1512px width that clipped the right arrow at1110px.
4. Children's invitation uses warm gold with slate text and a fine angled-line treatment; copy preserved.
5. Removed Children's breadcrumb only.
6. Shared primary buttons now red; hospital's existing gold variant remains.
7. Youth Service has one sticky particle-video background beneath its title, with six existing text sections in normal scrolling order, restrained28px text drift and scroll-linked media seeking. Duplicate still removed from the content; original still reused as poster. Original video preserved; new720p H.264 dense-keyframe, silent scrub copy generated locally.
8. Button press feedback extended to native/role buttons, forms, tabs, arrows, WhatsApp and desktop/mobile Go Live. Go Live has deeper shadow and a red decorative dot.
9. Header/mobile/team social icons have subtle drop shadows.

## Live status limitation

There is no live/offline status feed in this static site. The red Go Live dot identifies the streaming destination; it is **not** proof of an active broadcast. No fake on-air label, invented schedule or live/offline claim was added. Real-time status integration remains out of this refinement's implemented scope and would require a reliable data source.

## Scroll Craft design record

Desire gate: this is CLMI's Youth Service introduction; young people and visiting families want a welcoming place to grow in faith; they should desire participation and connection; they should believe the program includes worship, Scripture, prayer and care; their next step is exploring the youth programs or contacting the church through the existing routes.

Product Fantasy: being part of an active, thoughtful church community, not watching a technical animation demo.

Sources and cultural fit: retain CLMI's supplied particle film, approved framed navigation, typography and actual ministry content. The positive references are OB's chosen tactile buttons and existing particle artwork; the rejected reference is the detached player followed by a duplicate still. No invented church facts, faces, dates, or imagery. The audience remains CLMI's Namibian church community and online visitors.

Grammar: chaptered editorial on one persistent particle ground. Fingerprint comparison: same site navigation and footer intentionally preserved; only Youth Service introduces a continuous background rather than the prior media block. No synthetic spacer acts or scroll interception. The main page title is the quiet opening; the strongest authored moment is reading Scripture and prayer themes while the owned particles move behind them; the pastor profile resolves into normal page flow.

Feeling curve and act purpose: recognition at the Youth Service title; welcome through praise/worship; curiosity through Bible study; reflection through prayer and knowledge; confidence through maturity; belonging through love; practical clarity at the existing pastor profile. Each act's evidence is its supplied text, not an invented outcome. Motion keeps the six themes in one visual world; no counters or hints compete with the content.

Desktop: sticky near-full-height background, readable660px text column, generous natural text intervals. Phone390×844:24px side margins, smaller type, stronger uniform scrim, ordinary stacked copy. Reduced-motion/motion-off: static poster, compact sections, no scrub video source loaded. No-JS content remains readable with poster background; an actual JavaScript-disabled browser session was not exercised.

Cold visual review (agent judgment, not owner approval): inspected Youth Service desktop and390px phone while scrolling; the background remains subordinate to white/gold text, changes actual decoded frames and does not interrupt reading. Inspected About layering and Children's new closing panel. The site identity is retained; visitor-retention impact is unknown.

## Verification

-40tests pass. Three new timeline tests first failed on absent implementation; new range-request test first failed200vs206 and passed after fixing the preview server.
-39HTMLroutes and433unique local references extracted from HTML checked without failures; original homepage media, playlist IDs and destinations match the new backup.
-16layout checks: eight changed/shared-component routes at1110×948 and390×844, no measured horizontal overflow or failed sourced loaded images. This is not exhaustive visual inspection of39routes.
-98Galleryarrow steps reached98distinct loaded sources and wrapped to0. A normal-motion click advanced0→1 and automatic progression then1→2. In-flight opacity measured0.699; both arrows now fit1110px.
-Youth actual decoded currentTime advanced7.14→10.52seconds during two desktop scroll positions; phone frame time8.01observed. Motion-off renders six sections and leaves video src unset.
-Menu height44px on eight desktop pages; equal widths retained. Children's breadcrumb count0 and invitation heading colourrgb(48,61,89).
-No email, newsletter/contact submission, payment, external messaging or production mutation. ActualOS-reduced-motion/no-JS browser modes and end-to-end external playback remain unverified.

Evidence: `docs/evidence/motion-polish/`. Local preview server was restarted with `.mjs` MIME and bounded range-request support, session53767 on8123. That support is required to verify real media seeking locally. Vercel remains untouched.

## About background correction — 2026-09-06

OB rejected the washed-out background and visible bottom band. Inspecting the original 2000×789 artwork confirmed a white strip baked into the image. The earlier visual review missed this and did not establish owner acceptance.

Only About-scoped rules in `public/assets/revision.css` changed: artwork now lives on an isolated background layer extended 6% below the clipped section; a 30% dark green scrim replaces the pale wash; restrained green checks sit above it; text is white with warm-white headings. Artwork ends before Meet the Team. No source image was modified. About HTML is byte-identical to the fresh backup, preserving copy and team markup.

Backup: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-about-background-correction-2026-09-06-005749`, full copy verified with `diff -qr` before editing.

Fresh verification: 40 tests passed; 39 HTML routes / 433 unique HTML-local references checked with no failures; `git diff --check` clean. Browser inspection at 1110×948 and 390×844 found no horizontal overflow; phone had zero failed loaded images. Inspected Mission's bottom edge at both sizes: no pale strip. Desktop background contains original artwork, three heading colours verified, six team cards remain. Evidence: `docs/evidence/about-background-desktop.png` and `docs/evidence/about-background-phone.png`. Visual styling is an agent proposal, not owner approval. No deployment or form action.
