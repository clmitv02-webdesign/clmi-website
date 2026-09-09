# Bishop portrait — local opening

Latest owner revision: [magnifier and flush join](bishop-lens-revision.md). That revision supersedes the ripple, final-frame-only hover, old scroll lengths and “Scroll down to explore” described in historical sections below.

Owner instruction, 9 September 2026: integrate the approved original-motion film locally; wheel/touch scroll reveals and reverses it, pointer interaction only after formation, existing site follows. No deployment or regeneration.

## Experience specification

This is a Decide/Learn surface: one filmic opening before the existing ministry site.

- What: CLMI's word-built Bishop portrait, using the approved Seedance film.
- Audience: church members, families and first-time visitors.
- Desire: encounter the ministry's personal, faith-centred identity.
- Belief: this is a living church community with a recognisable spiritual leader.
- Next: continue into the existing services, outreach and ministry content.
- Product fantasy: words of faith come together as a familiar person, then respond to the visitor's presence.

Sources: approved charcoal/silver film and existing CLMI homepage. Rejected reference: early silhouette and late still-image crossfade. Preserve the film's native formation, not a replacement reveal mask.

Feeling curve: curiosity (quiet particles) → recognition (portrait forms) → connection (local mouse response) → welcome (existing homepage). Peak: the site where a portrait made of faith-filled words comes together under your scroll. Existing site is the resolved ending, not another competing effect.

Desktop storyboard (revised after owner feedback): animated “Welcome to CLMI” and “Scroll down to explore” on arrival. Welcome clears during the first 13% of scroll progress. No corner identity, entry link or bottom captions. Source fills the stage vertically, against matching charcoal with lightening compositing and a narrow empty-rim feather to avoid a boxed edge. Middle: hat/face formation. Peak: fully formed at 7.5s, subtle local fluid displacement follows the mouse only over the portrait. End: the original homepage rises in ordinary document flow. No wheel interception.

Phone storyboard: 390×844, remove only empty horizontal source margins, retain the whole portrait; native vertical touch scrolling drives the same formation. No hover effect or hover-only information. End: original mobile header and content. Reduced motion/no JS: settled poster and welcome in ordinary flow, no scrub download.

Fingerprint: filmic one-shot opening, one pinned interval (~220vh of travel), native video progress plus mouse-local image displacement, ordinary-flow exit. This differs from the existing editorial Youth scene and normal-flow homepage; familiar identity/navigation remain intentionally unchanged.

## Implementation sequence

1. Preserve local repo before editing; verified archive: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-before-bishop-intro-20260909-223609` (diff -qr identical).
2. Add browser regression checks for opening, reversible seeking, hover gating, ordinary-flow exit, phone, reduced motion and failure fallback. Run against unmodified homepage and confirm missing-intro failure.
3. Encode 1080p desktop / 720p phone dense-keyframe derivatives of the approved 4K delivery using ScrollCraft encode.sh. Keep the source unchanged. Extract a 7.5s fallback poster.
4. Add isolated bishop-intro.css/js and semantic homepage section before canvas-wrap. Existing ScrollCraft vendor files remain byte-identical. Native scroll position is explicit state; no smooth-scroll library. Video scrub ends at 7.5s (settled native frame), avoiding the film's long ending hold. Pointer shader samples that same video frame, not the original PNG.
5. Run existing tests, local reference audit and browser checks. Inspect actual desktop/phone views, reverse and hover. Keep changes uncommitted/local for OB review.

## Safety and fallbacks

Current website remains reachable through ordinary scrolling without successful media loading. Reduced-motion changes remove video source and pinning. Video failure collapses to static poster. WebGL failure retains the video without hover distortion. Hide/exit stops reaction. No email/form testing, remote uploads, pushes or deployment.

## Verification

Implemented locally, uncommitted. Server: `node tools/server.js 8123` (session 53852). Review: http://127.0.0.1:8123/ . No push or deployment performed.

- Fresh existing suite: 40 tests passed. Reference audit: 39 HTML routes, 436 unique local HTML references, zero failures. This audit does not count JS-selected video URLs; both intro clips separately loaded in browser tests and passed full FFmpeg decode.
- New real-browser regression: cold load hides completed poster until enhancement (prevents early face flash); desktop 1440×900 and touch phone 390×844 seek forward/backward; desktop hover actually paints a canvas and settles on exit; touch phone allocates no hover canvas; native scrolling reaches existing homepage; original three embeds/eight ministry cards remain. Reduced motion fetches no intro clip. No-JS and deliberately failed-video entry paths tested. Welcome arrival/scroll dismissal and absence of entry link are asserted.
- 11 decoded samples per device across 0–7.5s produced changed pixels at each of 10 intervals, not merely a changed playhead. No page errors or horizontal overflow in the three main browser modes. Tests deliberately abort third-party network traffic; external media delivery is not certified by this suite.
- In-app browser: actual desktop scroll formation, completed portrait, pointer reaction, upward reverse and original website transition visually inspected. 390×844 viewport opening/complete portrait also inspected, then viewport override reset and preview left at start. Phone hardware/Safari performance is unverified.
- Source preservation: 38 inner HTML files and existing home HTML from its original header onward are byte-identical to backup; ScrollCraft vendor JS/CSS byte-identical. Selected original PNG hash remains `e11dbf2cbde0536f7c8ccabe0c7597d2efed1c2c348ef44379eeab395c08120f`.
- Desktop derivative: 1920×1080, 7,736,810 bytes. Phone: 1280×720, 4,367,995 bytes. Both H264/24fps/241 frames/10.041667s, silent. Scrub uses the first 7.5s, avoiding the long held end. Original 4K delivery remains untouched outside the website.
- `tests/bishop-intro.browser.mjs` and `docs/evidence/bishop-intro/report.json` hold the reproducible scoped checks. Generic ScrollCraft harness also produced a whole-page sheet; it does not register the bespoke intro outside its mount and reports dead-scroll warnings in unchanged ordinary-flow content. Those warnings are not a pass for the intro; the decoded sweep and manual review are its evidence.

## Visual review and lesson

Judgment: the approved charcoal/ivory source leads the composition; no new cards, gradients, labels over the face or competing hero copy. Desktop complete-source fit and phone empty-margin crop retain the portrait. Initial mouse displacement visibly pinched the mouth; replaced the singular radial field with a low-amplitude continuous field and inspected again. Hover is now a gentle local ripple, not a new AI animation or independently movable words.

Cold first-paint test exposed a potential completed-poster flash while deferred JS loaded; the head marker hides it for motion-enabled users, while no-JS/reduced-motion keep the static fallback. Lesson: test both initial paint and decoded frame output, not just final CSS state and video currentTime.

Owner visual approval of this local integration is pending. No claims about retention, physical-device frame rate, or production readiness.

## Welcome revision — 9 September 2026

Preserved a second verified full backup before revision: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-before-welcome-refinement-20260909-230109`. Removed rejected corner/bottom UI. New welcome text animates on arrival and exits as scrolling starts. The stage no longer reserves caption bands. A #1c1c1c ground, lighten blend and source-rim feather soften the background join without modifying the MP4 or replacing its formation. Desktop and phone browser suite rerun successfully after the final blend change; phone start/rest screenshots and in-app desktop welcome/formation inspected. Physical-device playback remains unverified. ScrollCraft/UI Arsenal informed the restrained arrival, native reversible scroll and reduced-motion fallback, not a new page redesign.
