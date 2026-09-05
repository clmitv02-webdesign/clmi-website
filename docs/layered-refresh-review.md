# CLMI layered refresh — 2026-09-05

## Recovery

Backup: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-layered-refresh-2026-09-05-220946`.
Before source edits, `diff -qr` found no differences. Base commit: `8e8d7a6`. Work branch: `codex/clmi-layered-refresh-20260905`. No production publishing is authorized for this review.

## Experience brief

1. What: CLMI's familiar church homepage.
2. Who: church members, families and visitors discovering the ministry.
3. Desire: feel welcome and connected to the church's real life.
4. Belief: this is the same CLMI, presented with care, easy to navigate.
5. Next action: watch a service, discover a ministry or open the shared WhatsApp link.

Product Fantasy: familiar church life feels present and inviting across every visit.

## Sources and cultural fit

Two approved references: the existing homepage's actual banners/playlist row and the Children's Ministry page's deep green, warm paper, Helvetica UI and soft surfaces. Rejected reference: the earlier replacement playlist cards, which OB explicitly asked to revert. Preserve actual embedded players. The audience is CLMI's Windhoek church community and remote viewers, not a generic luxury/tech audience.

## Grammar and fingerprint

Conservative adaptation of the existing ministry catalog in ordinary vertical flow. The owner explicitly requested retention of the front page. The local project has no earlier Scroll Craft fingerprint registry. Familiar navigation, uncropped carousel, three original playlists, full-width film, two-column ministry catalog, newsletter close. Restraint is the signature: no invented slogans, counters, scroll hints or copied luxury styling.

## Journey / act meaning

| Act | Belief shift | Feeling | Evidence | Motion purpose |
| --- | --- | --- | --- | --- |
| Banner | I recognise my church | Recognition | Existing six artworks, full logo | Preserve direct slideshow control; condense the header on scroll |
| Playlists | I can worship and catch up here | Connection | Original Conventions / Testimony Sundays / Outreach embeds | Quiet raised paper surface, no content delay |
| Social film | This community is active beyond Sunday | Presence | Exact approved CLMI film | Gentle whole-frame expansion; playback stays user controllable |
| Ministries | There is somewhere for me and my family | Belonging | Eight existing ministry images/links | Layered grey grid and tactile card grouping |
| Newsletter | I can stay connected | Resolve | Existing newsletter form | Stable accessible close, no decorative animation |

Peak: the familiar ministry artwork arrives as an ordered, welcoming collection after the film. The playlist row is the authored quiet interval. Desktop follows ordinary scroll with bounded depth; no extra scroll distance is inserted. Phone storyboard at 390×844: compact full logo/navigation; uncropped banner; three stacked players; full film; single-column ministry artwork; newsletter. No lateral content or desktop-only information. Reduced motion: no depth/reveal effects, no automatic hero advance, social video waits for manual playback. No-JS: content remains visible and linked.

## Verification

Local implementation reviewed on 2026-09-05. No Vercel deployment or remote push.

- Backup was byte-compared before editing. The current homepage's original media references, video source, playlist IDs and anchor destinations match that backup.
- Existing contract suite: 21 tests passed, zero failures. JavaScript syntax checks and `git diff --check` exited successfully.
- `node tools/verify-refresh.mjs <backup-path>` checked 39 HTML routes and 385 unique local references: zero missing files or unsuccessful local HEAD responses.
- Browser layout checks covered Home, Children’s Ministry, Youth Movement, Gallery and Church Outreach at 1280×800 and 390×844 (10 route/viewport combinations): zero measured horizontal overflow; no failed already-loaded images. Deferred images outside the viewed areas were not comprehensively inspected.
- Home's actual three YouTube players rendered; slideshow advance, mobile menu click/Enter/Escape, Children’s Ministry navigation and program-tab switching were exercised. Forms and email links were not activated.
- Desktop scroll changed the motion progress and condensed the header. The social film played while visible. The eight ministry artworks loaded in the desktop review.
- The `?motion=off` path held the hero on slide one, paused automatic video playback and disabled film/grid transforms. Actual OS preference switching and a JavaScript-disabled browser run were not exercised; fallbacks were code-inspected.
- Saved screenshots: `docs/evidence/desktop-home.png`, `desktop-layers.png`, `mobile-motion-off.png`.

Design assessment: the familiar content reads more consistently through the shared green navigation, quieter shadows, aligned artwork and bounded scroll depth. This is a visual judgment, not evidence of improved retention. Browser checks were representative, not a visual audit of every route or third-party YouTube playback condition. Await OB's review before any production deployment.
