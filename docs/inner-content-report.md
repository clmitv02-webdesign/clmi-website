# Inner content reconstruction — Task 1

Scope: the 38 inner HTML routes in the approved 2026-09-05 spec. Homepage HTML and shared CSS/JavaScript were not edited by this task. The immutable source is `/Users/ob/Documents/Claude/clmi-site-backups/clmi-site-before-inner-page-rebuild-2026-09-05-224256`.

## Result and interface

Each route now contains one main, one h1, `body.clmi-inner`, the shared inner stylesheet, deferred ScrollCraft vendor script and deferred inner script. Legacy desktop/mobile body duplication and the body-zoom script were removed. Original desktop/mobile header, navigation, footer and WhatsApp shell remain. The formerly standalone Convention 2026 route now uses that shell.

Most pages use `main.inner-main[data-page-family] > header.page-hero + div.page-content`. Hero copy lives in `.hero-copy`; optional source artwork in `figure.hero-media[data-sc-act="flow"]`. Standard components use the classes specified in the implementation plan, plus `.event-grid`, `.event-card`, `.team-grid`, `.team-card`, `.media-frame`, `.contact-grid` and `.contact-card`.

The approved Children component retains `main.children-experience`, its three tab panels, assigned photographs and inline interaction. Added breadcrumbs and a no-JavaScript rule reveal its hidden panels. The approved main Gallery retains its slideshow markup, CSS and script, with a visually hidden h1, semantic main wrapper and archive links. No promotional slideshow copy was added. Mobile navigation is visible without JavaScript through a noscript rule. The old zoom script also contained the mobile menu click handler; shared inner JS must supply that handler (communicated to the parent agent).

## Content reconstruction

- Youth Movement now contains six named program cards, preserving six original descriptions and destinations. Its six program details place activity copy before the original Pastor Ken profile and contact information.
- About has readable overview, vision and mission sections plus six team cards. Original social destinations/icons remain.
- Branches has 49 person/location cards, reconstructed from the original table rows. Existing names, branches, cell numbers and email text remain; blank source cells do not become invented information.
- Contact has grouped details, original map, one original form, associated labels and unchanged field names, hidden fields and action. No form was submitted or email activated.
- Events and Community Outreach have semantic cards; convention stories retain source dates and copy. Archive photographs use static responsive grids with reserved dimensions, lazy loading and source order, collapsing repeated images.
- Convention 2026 has 49 source photographs with its original curated/rotating captions and introductory text in a static photo grid. Its former automatic slideshow, blob background and unrelated fonts were replaced by the common photo-story layout.
- Hospital Outreach, Marriage Seminars, Leadership Seminars and Giving have short topic introductions and contact links. These additions do not claim schedules, programs, staff, bank details or donation processing arrangements.

## Source identity and limitations

`docs/inner-content-ledger.json` records 38 routes across eight families: 13 photo stories, 8 ministry overviews, 6 youth programs, 4 event pages, 3 information pages, 2 watch pages, 1 giving page and 1 main Gallery. It inventories 394 image references when summed per route, representing 377 distinct source URLs across those routes. Those totals exclude shared-shell icons. Each route records the source SHA-256, substantive text fragments, image URLs, embedded-media URLs and anchor destinations. Repeated generic button labels are replaced with descriptive labels; they are explicitly identified as presentation exclusions. Mobile text fragments that combine desktop cells are decomposed by exact source substrings rather than retained as duplicate paragraphs.

Legacy URLs do not reliably name their content. Headings now follow source document titles for archives, with clear spelling normalisation. Examples: `/highlights/` is the 2023 gallery; `/copy-of-2023-convention-gallery/` is the 2024 gallery; `/copy-of-2024-convention-gallery/` is the 2026 gallery. `/copy-of-convention/` had a misleading 2025 document title, but its artwork and complete story explicitly identify the 23rd convention in June 2024, which is the displayed title.

Several outreach parent-card labels conflict with the title of their destination document. Their original destinations remain unchanged as required; image identities were not inferred from filenames. For example `/copy-of-kilimanjaro-outreach/` is titled Shona Bibles in Zimbabwe in its source document. Resolving any underlying content-to-destination mismatch needs a separate editorial decision; this task does not claim those historical associations are verified.

Original supplied prose, spelling, claims and historical forward-looking event language remain. Preservation is not an independent verification of those claims. No new factual claims were added to replace them.

## Verification observed in this task

Before reconstruction, the four new tests failed: duplicate mains, missing preservation ledger, empty sparse bodies and missing named Youth cards.

After reconstruction, a fresh `node --test tests/*.test.mjs` run reported 25 tests passing and 0 failures: the original 21 tests plus four new content tests. The new checks cover 38-route semantics, nonempty sparse bodies, six Youth cards, ledger source hashes, substantive text/media preservation and independent extraction of backup anchor/image URLs. Existing tests were not edited.

A separate HTMLParser stack audit checked all 38 inner HTML files and found no mismatched or unclosed tags. Node `vm.Script` parsed 77 nonempty inline scripts from those inner files without syntax exceptions. `git diff --check` returned no output after whitespace cleanup.

Browser appearance, loaded assets, external media availability, mobile/reduced-motion interaction and no-JavaScript behaviour are not established by these static checks. Parent integration work owns the 76 desktop/mobile browser combinations and shared CSS/JS review. No deployment, push, payment action, email delivery or form delivery occurred in this task.

During the parent's desktop review, the Convention 2026 archive exposed a pre-existing asset gap: the backup references 49 photos but contains only the first 15 files. The 34 remaining exact filenames were located in `/Users/ob/Documents/Claude/convention-2026/site/images/web` and the original Downloads convention folder. Restoration is assigned to the parent, which owns asset additions. A fifth new test now checks filesystem existence for local images, resolving both absolute and relative URLs; its first run correctly failed on `IMG_2671.JPG`. Rerun the complete suite after those assets are restored. This is a concrete gap beyond the earlier successful text/URL-preservation checks.

The same review requested smaller About role text and normal postal-address links. These HTML changes are included: About roles use `.eyebrow`, names use h3, and Contact address links use `.contact-address` rather than filled button classes.

Final Task 1 rerun after restoration: the parent copied the 34 missing files, then this task independently compared SHA-256 for all 49 local convention JPGs against `/Users/ob/Documents/Claude/convention-2026/site/images/web`; 49 matched. The generator was rerun to read their actual dimensions. A fresh full suite reported **26 tests passing, 0 failures** (original 21 plus five new tests), including the image-existence test that previously failed. `git diff --check` produced no output. Asset additions remain in the parent's separate commit scope.

Independent review follow-up: added two regression tests before changing code. The focused run reported 5 passing and 2 failing, confirming that Gallery lacked a static no-JavaScript photo list and the Watch page's image links shared the same generic accessible label. Gallery now supplies noscript CSS that lists all six existing photographs vertically, removes slideshow transforms/animation, restores uncropped natural image proportions and hides the inert controls/progress. Its JavaScript-enabled slideshow is unchanged. Watch image links now read “Watch CLMI live streams” and “Listen to the CLMI podcast”, retaining the original image sources and destinations. After regeneration, the full suite reported **28 passing, 0 failing**; `git diff --check` remained clean. Parent browser review owns confirmation of the rendered no-JavaScript behaviour.

## Reproduction and handoff

Run `python3 tools/rebuild-inner-pages.py` from the repository to regenerate only the inner HTML and content ledger from the immutable backup. This deliberately restores the migrated inner content from that source and would overwrite later manual inner HTML edits; preserve or incorporate such edits in the helper before rerunning. Use `--backup PATH` only for another intentionally selected source. `--check` inventories without writing output.

The generated pages were handed to the parent for browser verification. Do not claim visual completion from the static preservation tests alone.
