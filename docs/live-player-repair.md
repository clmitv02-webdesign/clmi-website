# Go Live repair — 13 September 2026

Local only; no deployment, commit, tag, or production change made for this repair.

## Behavior

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
- The unauthenticated channel-page schema can change or Vercel's network can receive a blocked YouTube response. These fail closed to a labelled fallback, not a false live status. Check `/api/live-service` on a Vercel preview before promoting this change. Consider an official YouTube Data API integration if dependable server-side public-page lookup becomes unavailable; no API credential was requested or added here.
- The emergency replay ID/date is supplied by `data-replay-id` / `data-replay-title` on the player section. Normal successful lookups do not use a hardcoded latest-service ID.
- `tools/server.js` now handles the same API locally. Do not run legacy page generators over the edited live page.
- Preserve unrelated local Bishop mobile fixes and already-deployed outreach files when preparing a scoped release. Local HEAD still predates the production outreach commit.

References: [YouTube player API](https://developers.google.com/youtube/iframe_api_reference), [embed parameters](https://developers.google.com/youtube/player_parameters), [CLMI channel](https://www.youtube.com/@BishopArowoloCLMItv/streams).
