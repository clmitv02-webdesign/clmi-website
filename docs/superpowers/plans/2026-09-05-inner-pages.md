# CLMI Inner Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Rebuild 38 inner pages into one cohesive, responsive CLMI website.

**Architecture:** Preserve static HTML and current public URLs. Replace positioned desktop/mobile bodies with semantic responsive content; shared CSS owns layout families and shared JavaScript progressively enhances navigation/motion. Preserve unique content via a backup-derived ledger.

**Tech Stack:** HTML, CSS, vanilla JavaScript, local conversion/test scripts; no client framework or external assets.

**Spec:** `docs/superpowers/specs/2026-09-05-inner-pages-design.md`

## Global Constraints

- No deployment, paid assets, generated media, new backend, or framework migration.
- Preserve the 39 existing HTML routes: Home plus 38 inner routes. Do not rename legacy URLs.
- Never activate email links or deliver form submissions during testing.
- Keep the original homepage playlists, six banner assets, film and ministry destinations.
- Children tabs/photographs and Gallery slideshow retain approved behaviour.
- Existing branch and verified backup are the approved working/recovery locations; do not relocate or discard the earlier uncommitted preview.

### Task 1: Responsive content reconstruction

**Files:** Modify `public/*/index.html`; create `tools/rebuild-inner-pages.py`, `tests/inner-pages.test.mjs`, `docs/inner-content-ledger.json`.

**Interface:** Each inner route has body class `clmi-inner`, one semantic main, one h1, `/assets/inner-pages.css` and deferred `/assets/inner-pages.js`. Shared classes: `page-hero` (breadcrumb, eyebrow, h1, intro, optional artwork), `page-content`, `section-heading`, `program-grid`, `story-card`, `photo-grid`, `prose`, `related-links`, `button-link`, `branch-grid`, `branch-card`. Existing Children/Gallery components retain their identities. Do not write shared CSS/JS in this task.

- [ ] Add route-output tests before reconstruction. Key assertions:
  ```js
  assert.equal((html.match(/<main\b/g)||[]).length, 1, route);
  assert.equal((html.match(/<h1\b/g)||[]).length, 1, route);
  assert.ok(html.includes('inner-pages.css'), route);
  ```
  Also test preservation of unique content image sources, substantive text and anchor destinations against the backup, plus four previously empty main bodies.
- [ ] Run `node --test tests/inner-pages.test.mjs`; record the expected failure for legacy bodies.
- [ ] Rebuild actual content, not a CSS overlay: Youth overview six named linked programs, readable program details, semantic branch cards, event cards, responsive photo archives, About history/team and labelled Contact form. Preserve all supplied content and unique photos; strip fixed geometry and body zoom. Use a local parser/helper for repetitive conversion, with route-specific treatments for meaning. Keep served HTML complete without generation at runtime.
- [ ] Integrate sparse Hospital/Marriage/Leadership/Giving pages with restrained non-factual-intro copy and existing contact/navigation. No invented programs or financial details.
- [ ] Produce a route/content ledger and run focused tests followed by `node --test tests/*.test.mjs`.

### Task 2: Shared visual system and motion

**Files:** Create `public/assets/inner-pages.css`, `public/assets/inner-pages.js`; update `DESIGN.md` and test coverage.

**Consumes:** Task 1 semantic classes. **Produces:** responsive layout families on `body.clmi-inner`, without changing homepage selectors or existing tab logic.

- [ ] Verify the pre-styling Youth desktop and mobile layout deficiency in browser, and ensure route contract tests already demonstrate missing shared integration.
- [ ] Implement inherited green/paper/Helvetica/Georgia tokens; fluid header/footer, responsive 1120px reading widths, photo-story grid, program links, readable contact/branch cards and one-column mobile fallbacks. No body zoom or fixed content heights.
- [ ] Use progressive enhancement only:
  ```js
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = reduced.matches || new URLSearchParams(location.search).get('motion') === 'off';
  ```
  Selected media layers may move at most 16px, via transforms; content starts visible. Keep reading sections still and support keyboard focus.
- [ ] Record normal desktop/mobile, reduced-motion and no-JS checks. Syntax-check scripts and update DESIGN.md's superseded legacy-layout rule.

### Task 3: Integration, visual review and handoff

**Files:** `docs/inner-pages-review.md`, `docs/evidence/inner/`, focused fixes to files above.

- [ ] Audit 38 inner routes at 1280×800 and 390×844 (76 combinations), recording main/h1/overflow/loaded-image status. Read rendered screenshots for each layout family and investigate each exception.
- [ ] Exercise menu, Youth navigation, Children tabs, main Gallery, event gallery links and motion-off; form/email/payment checks remain inert.
- [ ] Run `node --test tests/*.test.mjs`, `node tools/verify-refresh.mjs <backup>`, syntax checks and `git diff --check`.
- [ ] Review spec compliance and code quality independently; fix concrete regressions, then verify fresh.
- [ ] Leave local Youth Movement or homepage preview open; record exact evidence/limitations and update shared project memory. No merge/push/deploy.

## Execution ledger

- Plan/spec reviewed together: Task 1 supplies semantic classes to Task 2; Task 2 avoids homepage selectors; Task 3 validates both. No conflicting file ownership during implementation: page conversion owns inner HTML/tests/helper/ledger; styling owns shared CSS/JS/DESIGN.
- Execution complete for Tasks 1–3, with verification limitations explicitly recorded in `docs/inner-pages-review.md`. The checklists above retain the original plan wording; actual completed checks and evidence are authoritative in that review.
- Task 1: route contracts observed RED, responsive reconstruction and backup-derived ledger implemented; follow-up contracts observed RED before their fixes. Final suite: 30/30 passing.
- Task 2: shared styles, progressive motion and mobile navigation implemented; desktop/phone and motion-off reviewed. Actual OS-preference switching and no-JS browser mode remain unverified; source fallbacks were reviewed/tested.
- Task 3: final 76 route/viewport measurements saved; menu, Youth link, Children tabs, six Gallery controls, archive navigation and motion-off exercised. Source review findings resolved and re-reviewed. Syntax/reference/diff checks passed. No form/email/payment submission, merge, push or deployment.
- Earlier homepage changes are preserved on the approved local branch and covered by the pre-inner-rebuild backup. Next action is owner visual review, not publication.
