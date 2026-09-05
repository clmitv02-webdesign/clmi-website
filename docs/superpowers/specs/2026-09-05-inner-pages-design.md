# CLMI — one connected website

## Status and outcome

OB approved the shared-design direction on 2026-09-05. This document turns that direction into the rebuild scope; written-spec review is pending. Deliverable is a local website preview, not a Vercel deployment.

Visitors should recognise the same church on every page: familiar CLMI artwork and photographs, consistent navigation, readable content, and a clear way to explore related ministries. The homepage retains its current content and ordering. Inner page bodies will be rebuilt, not merely recoloured.

## Recovery and boundaries

- Repository: `/Users/ob/Documents/Claude/clmi-site`.
- Branch: `codex/clmi-layered-refresh-20260905`; earlier homepage work is uncommitted and must be preserved.
- Pre-rebuild backup: `/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-inner-page-rebuild-2026-09-05-224256`, byte-compared against source before this work.
- Preserve the 39 existing HTML routes: Home plus 38 inner routes. Do not rename legacy URLs.
- No deployment, paid assets, generated media, new backend, or framework migration.
- Never activate email links or deliver form submissions during testing. Payment flows and external messages are not test actions.

## Shared visual language

Use the existing Helvetica family for body/UI and Georgia for editorial headings, deep green `#174d37`, warm paper `#f7f5ef`, ink `#17201c`, and restrained existing red accents. Preserve original artwork colours; no invented branding or new font downloads.

Use one responsive page body, replacing duplicate desktop/mobile content and pixel-positioned canvases. Standard reading width is approximately 1120px; wider media can reach the existing 1512px site maximum. Shared spacing uses 8/16/24/32/48/72px steps, subtle one-pixel separators and restrained 8–16px corner radii. Main text remains comfortably readable instead of shrinking with body zoom.

The header, active navigation, footer, button styling and single floating WhatsApp control belong to one shared system. Breadcrumbs and descriptive related-page links connect inner pages. Use the real page title, not the legacy URL slug, for display.

## Layout families and route ledger

These are variations of one system, not unrelated designs. Each listed route must be accounted for in implementation and verification.

| Family | Routes | Layout |
| --- | --- | --- |
| Ministry overview (8) | `/youth-movement/`, `/children-s-ministries/`, `/church-outreach/`, `/community-outreach/`, `/prison-outreach/`, `/hospital-outreach/`, `/marriage-seminars/`, `/leadership-seminars/` | Recognisable artwork or genuine photo introduction, clear program/story sections, relevant existing links and media. |
| Youth program detail (6) | `/about-5/`, `/copy-of-youth-service/`, `/copy-of-spiritual-growth/`, `/copy-of-community-building/`, `/copy-of-creative-expression/`, `/copy-of-outreach-and-evangelism/` | Program title, readable story/activity sections, existing pastoral information where supplied, gallery links and return to Youth Movement. |
| Events (4) | `/events/`, `/convention/`, `/copy-of-convention/`, `/copy-of-convention-2025/` | Event cards and individual event stories using existing dates, artwork and archive links. |
| Photo stories and archives (13) | `/1/`, `/highlights/`, `/copy-of-2023-convention-gallery/`, `/copy-of-2024-convention-gallery/`, `/copy-of-christmas-day-at-orphanage/`, `/copy-of-church-outreach-wavis-bay/`, `/copy-of-community-building-gallery/`, `/copy-of-community-police/`, `/copy-of-donations-to-the-orphange/`, `/copy-of-katutura-street-evangelism/`, `/copy-of-kilimanjaro-outreach/`, `/copy-of-zimababwe-shona-bibles/`, `/convention-2026/` | Consistent story heading and photo rhythm; retain existing photo sequences and descriptions. Integrate the standalone 2026 convention experience into the common shell without copying its unrelated fonts/background style across the site. |
| Main Gallery (1) | `/publication/` | Preserve the approved one-photo-at-a-time slideshow, edge-to-edge photo area, controls and absence of promotional slideshow text. Connect to existing archive routes. |
| Watch (2) | `/livestream/`, `/copy-of-live-streams/` | Consistent watch-page introduction, existing players and destinations, responsive media frames. |
| Information (3) | `/about-us/`, `/about-1/`, `/branches/` | About: history, mission/vision and people. Contact: clearly grouped existing details/form. Branches: readable existing location information. |
| Giving (1) | `/donations/` | A finished, restrained introduction and existing contact pathway. No invented bank accounts, payment buttons, donation processor or impact statistics. |

## Content and interaction contracts

- Build a preservation ledger before replacing markup: each route's substantive text, unique content images, embedded media, contact details and link destinations. Deduplicate desktop/mobile copies, not substantive content.
- Youth Movement becomes a clear overview of its six existing linked areas, with descriptive link labels replacing repeated ambiguous “View More” labels. Retain the existing destinations.
- Children’s Ministry keeps the three approved tabs, assigned photographs, informational copy and accessible tab/hash behaviour. Do not restore numbered photo badges or extra enquiry buttons.
- Preserve the homepage's exact six-banner assets, three YouTube playlist identities, approved social film and eight ministry destinations.
- Empty Hospital Outreach, Marriage Seminars, Leadership Seminars and Donations page bodies need short, honest introductions and existing navigation/contact pathways. Copy may explain the topic, but must not claim unverified activities, schedules, eligibility, staff, facilities, results or payment arrangements. Do not pad pages with invented programs.
- Preserve history, scripture, names, phone numbers, addresses and dates from source. Editorial restructuring must not alter their meaning. Use existing generic CLMI identity artwork for sparse pages if no topic-specific photo is available; do not imply an unrelated photo documents that ministry.
- Preserve existing form destinations and fields; improve labels/layout only. QA is non-delivering.

## Motion and responsive experience

Motion supports reading and continuity rather than withholding information. Use subtle depth at selected media/section boundaries, small hover/focus lifts, and smooth existing slideshow transitions. No scroll hijacking, long pinned sequences, repeated entrance theatre or hidden content dependent on JavaScript.

Desktop journey: recognisable title/artwork → readable story/programs → authentic photographs → related ministry/archive. The strongest moment is the church's real photography; long-form reading sections stay still. At 390×844: compact usable header, short introduction, single-column content, responsive photos/players, reachable controls and footer. Avoid desktop body zoom and fixed-height text boxes.

Reduced motion removes depth and automatic motion where appropriate, while retaining manual controls. No-JavaScript mode retains meaningful page text, media links and navigation; enhanced tab/gallery controls need an accessible content fallback. Photo dimensions reserve layout space; below-fold media loads lazily, with the leading meaningful image prioritised. Do not eagerly mount a large gallery of full-resolution images.

## Technical responsibilities

Keep static HTML/CSS/JavaScript and `public/` as the output. Shared inner-page CSS owns tokens, responsive layout families and components; a small shared script owns progressive enhancements. Semantic page HTML owns its content. Avoid making runtime JavaScript reconstruct the main page from legacy positioned elements.

A local generation/helper script is acceptable for repetitive shared markup, but the served HTML must remain self-contained and readable without that script. Any helper must preserve page-specific content and not overwrite unrelated edits. Update `DESIGN.md` to supersede its old rule that legacy content geometry remains unchanged.

## Acceptance and review

1. A route ledger covers all 38 inner routes with a recorded layout family and content-preservation result.
2. Existing 21 contracts remain meaningful; extend tests for shared semantics, preserved content/media/destinations and nonempty page bodies. Do not weaken tests to conceal regressions.
3. Check local route and asset responses, JavaScript syntax and patch whitespace. Report exact counts from fresh results.
4. Render each inner route at desktop and 390×844, recording horizontal overflow, loaded-image failures, heading/main structure and console issues. Visually inspect the rendered layout, not only computed metrics.
5. Exercise representative menus, program tabs, gallery controls, navigation and reduced-motion/no-JS fallbacks. Inspect contact/payment/email destinations without activating them.
6. Recheck the homepage against the preserved media/link contracts after shared-shell changes. Capture comparable evidence for Home, Youth Movement, Children’s Ministry, an archive, About and Contact.
7. Record remaining limitations honestly. A cohesive appearance is a design assessment, not measured retention improvement. Leave the local preview open for OB's visual review; deploy only on a later explicit request.

## Design review

The scope deliberately replaces legacy page geometry while retaining substantive content, route identities and approved interactions. The alternative of shared CSS overrides alone was insufficient; separate bespoke designs would repeat the current inconsistency. A small set of shared page families provides cohesion while respecting different content needs.

Written specification requires OB's review before implementation planning under the design-planning workflow.
