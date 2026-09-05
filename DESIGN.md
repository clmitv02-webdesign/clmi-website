---
name: CLMI — familiar, connected, welcoming
colors:
  primary: "#174d37"
  secondary: "#8b0000"
  neutral: "#f7f5ef"
  ink: "#17201c"
typography:
  body-md:
    fontFamily: Helvetica Neue, Helvetica, Arial, sans-serif
    fontSize: 1rem
rounded:
  sm: 8px
  md: 16px
spacing:
  sm: 8px
  md: 16px
  lg: 32px
---

## Overview

Retain CLMI's actual logo, banners, ministry artwork, playlists, film, routes and content order. Extend the already approved Children's Ministry palette and soft surface treatment into the homepage and shared navigation. This is a local review branch only.

## Colors

Deep church green remains an identity accent. Navigation uses the original blue labels and green active state within a red illuminated frame. White-to-grey edges and a subtle checked surface connect the pages. Blue, magenta and gold, drawn from the existing artwork, energise the newsletter and calls to action. Artwork retains its original colors. Never apply a filter or crop to the banners.

## Typography

Use Helvetica for body copy and the church name. Card titles, directory names and the newsletter use a compact system sans stack: Avenir Next, Segoe UI, then the existing Helvetica fallback. Georgia remains for editorial page headings. No font downloads.

## Layout

Fluid site up to 1512px with inner reading areas up to 1120px. Preserve the six-banner opening, original three embedded YouTube playlists, full social film, eight ministry links, newsletter and footer. Two columns of ministry artwork on desktop; one column on phones. Inner pages replace legacy pixel-positioned duplicate desktop/mobile bodies with responsive semantic layouts: ministry/program stories, events, photo archives, contact/branch information and watch pages. Keep their real content, photographs and route identities.

## Elevation & Depth

Visible depth is an explicit owner preference: restore the original lifted-corner image shadows on the YouTube and ministry artwork, and use stronger layered shadows on story, event, team and media cards. Keep the new curved corners. The film expands gently into its full width. Use small displacements with real wheel response; no prolonged pinned scenes, scroll interception or blocking intro.

## Components

Adapt existing site header, Go Live pill, Children’s Ministry card surfaces and eight ministry artwork cards. The shared Scroll Craft runtime is vendored unchanged for continuous scroll progress.

Desktop navigation uses eight equal-width cells in a44px menu, including equal active/hover areas regardless of label length. Raised rectangular red/gold buttons replace the flat green pills; press feedback extends to controls and Go Live. Branches uses a dense searchable directory, not large promotional cards. Gallery uses the full latest convention photo set, a slow dissolve/glide/zoom with arrows only, and image-led archive navigation; its source is selected from dated convention archive pages at build time. About artwork is a background behind the overview, vision and mission, never a separate picture card. Youth Service uses its owned particle clip behind scroll-linked readable text; reduced motion uses its still poster without fetching the clip.

## Do's and Don'ts

Keep artwork fully visible. Keep YouTube iframes and their playlist IDs. Make focus visible. Honor reduced motion. All content must remain usable if JavaScript fails. Do not submit newsletter/contact forms in QA.
