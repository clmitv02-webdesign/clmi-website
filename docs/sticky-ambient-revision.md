# Sticky header and ambient portrait — 10 September 2026

## Follow-up: visibly continuous idle drift

Owner reported the side particles still appeared static. Earlier code hid them until film5.2s and eased to a stop at each alternating turn. New behavior fades them in from film0.85–2.05s (as portrait formation begins), with independent linear9–13.8s upward travel and invisible respawns. Each journey spans152–218px, with staggered soft opacity envelopes. Particle count, size, side placement, portrait media, shader and header remain unchanged. Reduced-motion/offscreen handling retained.

New regression first reproduced hidden particles at45%scroll, then passed at1111×912 and390×912. It now requires at least8 visible particles to travel over5px in each of three800ms no-input intervals, with scrollY unchanged; final-rest, header and reduced-motion checks also pass. In-app desktop confirmed different particle positions at identical scrollY1514; desktop and390×844 phone views inspected. Subjective judgment: clearer continuous drift, still subordinate to the portrait. Same Decide/Learn filmic-one-shot story and existing brand/type; no additional act or scroll length. Backup of pre-change JS/CSS: /Users/ob/Documents/Claude/clmi-site-backups/ambient-continuous-UgnLV5.

Historical initial revision below is retained for traceability.

Local-only owner revision. Desktop logo, social links, Go Live and navigation now remain together at the top after the intro through the homepage footer. Removed the negative header translation. Eight pixels past the homepage boundary, translucent backgrounds and 18px backdrop blur show underlying page colours. Existing mobile header content is unchanged, with the same glass treatment.

Added 24 decorative particles, 12 in each side margin, with 0.8–2.08px warm-white cores and independent 11–21.2-second alternating drift. Size is visually calibrated, not guaranteed pixel-identical to the film. Motion continues without input, fades in late in the reveal and away on reverse, pauses offscreen/when hidden, and disappears with reduced motion. Narrow-screen clearance keeps both sides visible. Source film, portrait lettering and glass shader are untouched.

ScrollCraft and UI Arsenal guided preserving the approved composition, with restrained motion outside the portrait. Subjective visual review: quiet dust rather than a foreground effect; familiar header layout with blurred page colour.

## Verification

- New browser test reproduced the old header failure, then passed at1111×912 and touch-emulated390×912: header at homepage start/middle/footer, backdrop blur, idle particle movement, both visible side margins, offscreen pause and reduced-motion removal.
- Initial reduced-motion assertion wrongly expected animationPlayState paused. Existing global animation:none!important correctly disables animation but resets that property to its default. Corrected test checks animationName none and layer display none. This was a test mismatch, not continuing motion.
- Intro browser regression passed desktop1440×900,1111×912,touch390×844,cold load,reduced motion,no-JS,media failure. Glass regression: local pixel change24.8158/255; outside its small footprint0.
- Existing unit suite40/40 passed. JS syntax and git diff whitespace checks exited0. Both MP4 derivatives compare byte-identical to this revision's backup.
- In-app desktop portrait and footer header visually inspected; phone screenshot reviewed. Physical-device/Safari performance and owner aesthetic acceptance remain unverified.

Evidence under docs/evidence/bishop-intro: sticky-ambient-report.json, sticky-1111.png, sticky-390.png, ambient-1111.png, ambient-390.png, report.json and glass-report.json.

Backup: /Users/ob/Documents/Claude/clmi-site-backups/clmi-before-sticky-dust-20260909. No deployment, push, email or source-media generation.
