# Local Bishop magnifier revision — 9 September 2026

## Latest owner correction: ring-free soft glass

The owner rejected the visible circular rim and 2× inspection window. Current implementation supersedes that design: no rim or hard circular cutout; small continuous refractive field, approximately 1.18× at its centre, smoothly fading to identity within95CSS pixels. Gentle65ms pointer following and restrained local stroke contrast; normal mouse cursor retained. No painted glow, background ornament or regenerated lettering. Existing scroll/hold/join behaviour is unchanged. ScrollCraft/UI Arsenal guided keeping this within the existing interaction rather than adding another component.

Verification: new `tests/bishop-glass.browser.mjs` compares the same WebGL renderer at two pointer locations. Old implementation fails the outer-footprint assertion (mean difference15.991); current implementation passes (outer annulus105–155px difference0; local lettering difference24.815/255). The baseline deliberately uses the same renderer because comparing native video directly with WebGL includes unrelated fine-text resampling differences. Full intro browser regression passed1440×900,1111×912,touch390×844,reduced/noJS/mediafailure, and40existingtests passed. JSsyntax/diffcheck passed. Native browser inspected on hat/torso with no visible rim. No physical-device/Safari certification or owner acceptance. Local only; no deployment or source-media edit. Previous script retained at `/Users/ob/Documents/Claude/clmi-site-backups/bishop-intro-before-soft-glass-20260909.js`.

Historical circular-lens design and research follow for traceability.

## Direction and scope

Owner requests: remove bottom space, change the arrival cue to Explore, replace the imperceptible ripple with a magnifying-glass effect available during scrolling, and leave a short completed-portrait interval. Local only; no regeneration, source-media alteration, push or deployment.

This remains a Decide/Learn opening with secondary inspection of the word portrait. Desire gate: CLMI word portrait; members and visitors; encounter a familiar faith identity; recognise the ministry and the words behind the portrait; continue to the existing website. Product Fantasy: approach the portrait and discover the lettering within it. Keep existing charcoal/ivory and brand type. Supplied Seedance motion and original word art are the references to preserve; the owner rejects the ripple and timing-dependent hover.

## Research and choice

- [Aceternity Lens](https://ui.aceternity.com/components/lens): pointer-following enlargement, with an explicit magnification factor and circular inspection area. Its page and live preview were inspected. Adapt the interaction principle, not the demo's visual branding or React stack.
- [Codrops Interactive WebGL Hover Effects](https://tympanus.net/codrops/2020/04/14/interactive-webgl-hover-effects/): pointer-centred texture sampling and a zoom variation. Adapt the local sampling approach already used in this site's shader; no RGB splitting, random pixels or fluid displacement.

This is targeted reference research, not an exhaustive review of mouse-reactive websites. Firecrawl connector used because local CLI is unavailable. No private media uploaded.

## Storyboard and implementation

One pinned filmic interval remains; no new page section or imported framework. Arrival: Welcome to CLMI / Explore. Recognition: native film scrubs 0–7.5 seconds. Inspection: after the opening clears, a fine pointer can magnify the current decoded frame while scrolling either direction. Resolve: a short hold followed by ordinary document flow into the existing site.

Desktop travel is 180vh, with film formation in its first 90% (162vh) and an 18vh hold. Phone travel is 150vh, with a 15vh hold; touch has no hover dependency or WebGL allocation. The lower portrait edge (approximately 97% down the frame) sits at the stage bottom; only the source's empty lower rim is outside the stage. Reduced-motion/no-JS retain normal-flow poster and content.

Magnifier: uniform 2× sampling inside a 280px-diameter circle, soft outer edge, restrained rim, short focus-in/out. It samples the decoded video rather than a separate still, retaining source-frame synchronisation. Underlying video hides only while the canvas is painting, preventing lightened double images. Wheel coordinates retain pointer focus during scrolling. Moving off the portrait settles to the unchanged video. WebGL failure falls back to video.

Meaning scores: arrival gives belonging (welcome text / short arrival); formation gives recognition (approved film / reversible seeking); inspection makes lettering legible (same source pixels / local magnification); close gives access (existing site / ordinary flow). The hold is an authored pause requested by the owner, not a blank spacer. The remembered moment is discovering words inside a recognisable portrait. This refines the existing fingerprint rather than claiming a new site design.

## Preservation and checks

Pre-edit backup: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-before-magnifier-20260909`; public tree compared equal before implementation.

Regression adds mid-reveal lens, stationary-pointer wheel continuity, short hold and lower-edge alignment. Tests run against the old timing first failed on the earlier completion contract. Desktop 1440×900, owner-width 1111×912, touch 390×844 and reduced-motion checks are in `tests/bishop-intro.browser.mjs`. Existing suite remains 40 tests. Final results recorded at handoff below.

Visual judgment: a bounded magnifier is more legible and intentional than the previous low-amplitude ripple. It visibly enlarges facial details too when aimed at the face, as a real inspection lens would. It cannot restore detail absent from the approved encoded source. Phone hardware, Safari performance and owner acceptance remain unverified.

Phone live review additionally exposed a hidden mobile header during the transition, leaving a blank 72px band. A new browser assertion reproduced that failure; the visibility boundary now follows the first appearance of the next section. In-app phone join was reinspected with the header visible directly under the portrait. The magnifier now stops its render loop when idle and wakes for pointer/scroll/frame changes.

Taste audit (subjective): 0/10 listed generic-layout tells in this scoped opening; the deliberately centred owner-requested welcome is not an accidental all-page centre stack. No new gradients, cards, borrowed type, fabricated content or extra cursor decoration beyond the requested inspection lens. Remaining aesthetic judgment belongs to OB.

## Final scoped verification

Final browser run passed: cold load, desktop1440×900, desktop1111×912, touch390×844, reduced motion, no-JS and media-failure paths. The three motion viewports each produced changed decoded pixels at ten sequential intervals; both desktop views passed mid-reveal magnifier and stationary-wheel continuity. The phone join assertion passed after first reproducing its hidden-header failure. Existing40 tests passed; JS syntax and git diff whitespace checks passed. Both MP4 derivatives compare byte-identical with the pre-revision backup. In-app desktop magnifier/flush join and phone-width welcome/join inspected; viewport reset and local preview left at start. No deployment or push.
