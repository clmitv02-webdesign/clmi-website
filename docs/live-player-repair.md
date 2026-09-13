# Go Live repair — 13 September 2026

## Latest correction — local only, not deployed

The owner reported an unexpected video switch and requested a continuous cycle: current live broadcast, then that broadcast's replay on repeat, until the next live broadcast replaces it. The deployed controller had no ENDED handler or periodic lookup and could load a hardcoded older replay after errors. These are verified code defects; the exact event behind the owner's observed switch was not captured.

Local changes remove the hardcoded fallback and add end-of-video restart at zero, serial 30-second lookups, same-ID live-to-replay promotion, retired-ID protection, and correction if the YouTube player reports playing/cuing an unexpected video ID. Errors retain the selected ID and retry it; failed initial lookups wait and retry without selecting an arbitrary video. Sound is not remuted on normal replay loops. The resolver also supplies ordered stream IDs so an unseen newer completed broadcast can replace the current replay only when the channel ranks it ahead of the current stream. Artwork and page layout are unchanged.

Verification: 10 new lifecycle tests failed against the previous controller (2 existing behaviors passed), then passed after implementation. Three resolver contract checks failed before adding ordered IDs, then passed. Three additional edge checks pass. Fresh full Node suite: 65 tests passed, zero failures. JavaScript syntax and git whitespace checks succeeded. Real local Chrome playback was observed at 8.97 seconds with `paused:false`, `muted:true`, `readyState:4`, on latest replay `AdHCkko5Cmc`. The restarted local API returned that replay and ordered channel IDs. Server: `node tools/server.js 8123`, session28653.

Limits: replay end/restart, new-live handoff and stale-result handling have controlled API-event test coverage, **not a verified real YouTube end-to-end handoff**. An attempted browser seek check did not reach the real video's end. No real active broadcast or physical Safari check. YouTube lookup availability and archive-processing delay remain external dependencies: an unavailable replay waits/retries the same broadcast rather than falling back. 30-second polling plus upstream/cache delays means new live detection is not instantaneous. No Vercel deployment, push, commit or rollback tag changes in this correction. The production record below remains historical/current production until a separately authorised release.

## Production release — 13 September 2026

Owner subsequently approved deployment. Production is now commit `ead735b49612616bb375fcd5d2db63edb975bccc`; Vercel GitHub deployment `6421136775` reports success. URL: https://www.christloveministriesinternational.org/copy-of-live-streams. Deployment: https://clmi-site-pzmglydvo-clmi.vercel.app. Framework: static HTML with a Node.js Vercel Function. Build duration unavailable.

Production autoplay was observed without a player click at desktop and 390×844 Chrome viewport sizes. Video time advanced with `paused:false`, `muted:true`. Phone page width390 matched the viewport. The live page, player script, unchanged home page, unchanged intro CSS and outreach page byte-matched the release (five checks, all HTTP200).

**Reliability caveat:** server-side YouTube lookup is intermittent from Vercel. A production sample returned two HTTP200 responses and one HTTP503 `SOURCE_DATA_UNAVAILABLE`; four later cache-miss checks returned HTTP200 with the correct latest replay. No root-cause fix is claimed. Two small follow-up commits added safe diagnostic codes to distinguish missing data, schema changes, consent/challenge and timeouts. The frontend uses an explicitly labelled dated replay if lookup fails. Actual live-broadcast playback and physical iPhone Safari remain unverified. Vercel runtime logs, drains and continuous monitoring were inaccessible/unverified; GitHub deployment status and public endpoint/browser checks were used.

Backup: tag `backup-before-go-live-20260913` retains previous production `1b1ad3a58d10ce6776cb8a147338399a5f02c935`. Local archives are in `/Users/ob/Documents/Claude/clmi-site-backups/go-live-release-20260913-FIeQvo`. V1.0/V1.1/V2.0 tags remain unchanged. Local HEAD/index were preserved; unrelated mobile-intro changes were not deployed. The original seven-file release was `0f188983`, diagnostics `6e179c2`, final diagnostics `ead735b`. Final focused tests:13 passed.

## Previous production behavior (superseded locally)

- Existing desktop/mobile Go Live links still navigate directly to `/copy-of-live-streams`.
- Existing Live Stream artwork is displayed in the page hero, with the player below it.
- `/api/live-service` reads the official CLMI channel's public Live tab and selects an active broadcast first, otherwise its most recent completed stream. Scheduled items are not treated as live.
- The player embeds the actual video ID, requests muted inline autoplay and provides the required cross-origin referrer. There is no intermediate launch button.
- Replays are explicitly labelled. If lookup is unavailable, a verified dated replay is used with a live-status-unavailable notice. If playback itself fails, an honest message and direct YouTube link remain.
- Sound requires the YouTube speaker control. Browser/device autoplay restrictions cannot be overridden.

## Diagnosis and evidence

The old `embed/live_stream?channel=UCqkrpCvbRCLEjc9v-jU67MQ` URL produced a generic YouTube playback error. It did not request autoplay. Attaching the iframe API to that channel embed could stall before readiness/error events. An actual-video embed played successfully.

The official channel identity was verified as `UCqkrpCvbRCLEjc9v-jU67MQ`. At testing time, YouTube listed the 13 September Youth Sunday Service (`AdHCkko5Cmc`) as completed, not currently live. The resolver independently returned that replay.

55 Node tests passed (44 existing + 11 new resolver/controller tests). New behavior tests failed before implementation. Browser verification used Chrome at desktop size and a 390×844 viewport: one Go Live click, no player click; HTML video reported `paused:false`, `muted:true`, `readyState:4` and elapsed playback. Artwork loaded at its natural width of 2000px. Phone page width equalled viewport width, without horizontal overflow. A 200px minimum player height meets YouTube's embed minimum on narrow screens.

## Limits and next checks

- Real on-air broadcast selection/playback remains unverified because the church was off-air during QA. Live/upcoming/replay selection is covered with controlled public-page-schema fixtures.
- Physical iPhone Safari is unverified; phone-width testing used Chrome, not an iPhone.
- The unauthenticated channel-page schema can change or Vercel's network can receive an unavailable YouTube response. These fail closed to a labelled fallback, not a false live status. The preview built successfully but team protection prevented playback inspection; protection was not changed. Consider an official YouTube Data API integration to remove the observed dependency on intermittent public-page responses; no API credential was requested or added here.
- The emergency replay ID/date is supplied by `data-replay-id` / `data-replay-title` on the player section. Normal successful lookups do not use a hardcoded latest-service ID.
- `tools/server.js` now handles the same API locally. Do not run legacy page generators over the edited live page.
- Preserve unrelated local Bishop mobile fixes and already-deployed outreach files when preparing a scoped release. Local HEAD still predates the production outreach commit.

References: [YouTube player API](https://developers.google.com/youtube/iframe_api_reference), [embed parameters](https://developers.google.com/youtube/player_parameters), [CLMI channel](https://www.youtube.com/@BishopArowoloCLMItv/streams).
