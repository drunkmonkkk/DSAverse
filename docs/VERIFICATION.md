# Verification — 2026-10-17

These results apply to the rebuilt source in this checkout, not the lost earlier workspace.

| Check | Result |
| --- | --- |
| Clean install via `bash scripts/setup.sh` (`npm ci`) | Passed, 579 packages installed |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed; final production build also completed TypeScript checking |
| `npm test` | 48 passed across 2 files |
| `npm run build` | Passed |
| `npm run test:e2e` | 14 passed, 7 scenarios on desktop Chromium and mobile Chromium |

Environment: Node 24.19.0, npm 11.9.0, Chromium 154.0.8037.57. Tests ran with local learning mode; no Supabase credentials were supplied.

Coverage includes catalog counts and prerequisite DAG integrity; all 34 trace engines; sorting negatives/duplicates; binary search misses and invalid order; window validation; cyclic/unreachable graphs; progress validation; reward deduplication; DST-aware streaks; planning prerequisites; actual SQL migration/RLS/concurrency behavior in PGlite; local persistence after reload; bookmarks/notes; practice revisions; step controls and playback; React Flow graph rendering; mobile navigation; route rendering without page errors; dashboard widths of 320, 375, 768, 1024 and 1440 pixels.

The dashboard screenshot was visually reviewed. Browser tests found an overly broad test selector for the app error message and Next.js route announcer; the selector was narrowed. A final review also corrected the initial search target to match the control and stopped playback scheduling at the final frame. Both are covered by passing browser checks.

Limits: tests do not establish live Supabase authentication/email delivery or production deployment, nor all browser engines, all input combinations, complete accessibility conformance, or live validity of external problem links. The full curriculum and six-language example expansion remain in TASKS.md.

Reusable install/start instructions were saved as an environment configuration draft. The tool confirmed `status: saved` and `requires_publish: true`. Review/save settings and publish the environment to activate that draft. Fresh-task restoration has not been independently tested. Source is not pushed to the remote repository.

## Publication follow-up

The MVP was committed locally as `0fc15c0`. Follow-up changes add dedicated auth routes, password recovery/update UI, Shiki highlighting and copying, Open Graph image, icon, robots/sitemap, route loading UI, GitHub Actions and Vercel build settings. TypeScript, lint, 48 unit/database tests and the production build passed after these changes. Expanded browser results are recorded below after completion.

Vercel CLI 64.5.0 reports `Logged out`. A direct proxied request to `https://api.vercel.com/v2/user` received HTTP 403 during CONNECT. No Vercel credentials or integration are configured. The environment draft now includes api.vercel.com, vercel.com and *.vercel.app; the saved change requires publishing. This is a network/authentication blocker, not a failed application build. No Vercel project or production URL has been created or verified.
