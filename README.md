# DSAverse — Learn DSA Visually

A responsive learning MVP built with Next.js App Router, TypeScript, Tailwind CSS, Radix UI, React Flow, Recharts, and optional Supabase persistence. The original repository README is preserved in `docs/INITIAL_README.md`.

## Run locally

Use Node 24 (see `.nvmrc`; package engines permit Node 22–24).

```sh
npm ci --cache /tmp/dsaverse-npm
npm run dev
```

The server listens on port 3000. Start at `/dashboard`, `/roadmap`, or `/visualizer`. No credentials are required for local learning. Guest progress is stored in this browser, not in a server database; export it from Profile before clearing storage. Guests and signed-in accounts keep separate data; guest progress is not automatically uploaded.

## Included

- Dashboard with real progress, calendar streaks, a focus timer, and activity heatmap.
- 102 concise lessons, prerequisite completion rules, searchable chapters, and an interactive prerequisite graph.
- 34 deterministic visualizers with custom inputs, forward/backward steps, playback speed, variables, and graph/linked-list arrows.
- 172 curated LeetCode links with self-reported statuses, notes, bookmarks, and scheduled revisions.
- Personalized daily plan, study-minute chart, achievements, light/dark themes, and JSON export.
- Optional Supabase email/password authentication and isolated cloud progress with optimistic concurrency control.

This is an MVP, not the complete original specification. Most lessons currently share a labeled array-traversal code reference. Binary search has its own reference; both examples are provided in six languages. Full explanations, algorithm-specific code, and additional teaching features remain in `TASKS.md`. No submissions are executed or graded.

## Checks

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Browser tests run against a production build. They use `/usr/bin/chromium` when available, otherwise Playwright's installed Chromium. On another machine, install it with `npx playwright install chromium`. Database tests execute the actual SQL migration using PGlite with simulated Supabase auth roles. They are not a substitute for a live Supabase integration test.

## Optional Supabase setup

1. Create a Supabase project. Apply `supabase/migrations/001_initial.sql` in its SQL editor or through your migration workflow.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the project's public URL and anon key. Never put a service-role key into a `NEXT_PUBLIC_*` variable.
3. Configure Supabase Auth's Site URL to the application's deployment origin. Email confirmation can return to that origin; sign in with the confirmed email/password afterward. OAuth and invitation flows are not implemented. Password reset and password update routes are available but need live verification.
4. Restart development or rebuild production so Next.js picks up public environment variables. Test with two accounts: one user's saved progress must not appear for the other.
5. Optionally seed the public catalog: `node --env-file=.env.local --import tsx scripts/seed.ts`. Set `SUPABASE_SERVICE_ROLE_KEY` only for this server-side command. The app currently reads its bundled catalog, so seeding is optional.

The `save_progress` RPC authenticates the caller, derives its user ID server-side, bounds document size, validates the document envelope, and rejects stale revisions. Authenticated users cannot directly mutate `user_state`; RLS only exposes their own row. Client validation additionally checks progress fields before loading. Client-generated statuses/XP are learning aids, not trusted competitive scores. Production deployments should apply their own retention and rate-limiting policies as needed.

On a conflict or save failure, export current progress before reloading. Cloud writes stop on conflict; there is no automatic multi-device merge. No Supabase credentials were supplied in this workspace, so live authentication, email delivery, and cloud synchronization have not been verified.

## Deployment

Import the repository into Vercel, select the Next.js preset, and use Node 24. Install with `npm ci`, build with `npm run build`, and let the platform detect the output. Local learning works without environment variables; set the two public Supabase variables before building to enable cloud mode. Apply the migration separately and configure the Auth Site URL. Do not expose the service-role key to the deployment unless a future server-only feature explicitly requires it.

A self-hosted deployment can run `npm run build` followed by `npm run start` behind an HTTPS reverse proxy. No deployment has been performed, and no public deployment URL is claimed.

## Cloud workspace recovery

`scripts/setup.sh` contains the reusable installation command for `/workspace/DSAverse`. It installs dependencies only; it does not reconstruct source files from an empty remote repository. Preserve this source in your repository or retain the supplied source archive before replacing the environment. Background server processes must be restarted after a snapshot is restored.

## Git and Vercel delivery

GitHub Actions runs lint, type checking, unit/database tests, production build and browser tests on pushes to `main` and pull requests. It does not deploy: use Vercel's Git integration once connected to avoid duplicate deployments.

In the authenticated Vercel account, import `drunkmonkkk/DSAverse`, name the project `dsaverse`, retain the repository root as Root Directory, choose Next.js and Node 24, and set Production Branch to `main`. Vercel's integration supplies production deployments for `main` and preview deployments for pull requests. The committed `vercel.json` sets the framework/install/build commands but cannot create the account-side Git integration.

No environment variables are needed to deploy demo mode. Supabase variables are optional. `NEXT_PUBLIC_SITE_URL` can set the canonical origin; otherwise metadata uses Vercel's production domain environment variable. Set Supabase's allowed redirect URLs to `/auth/login` and `/auth/update-password` on the actual deployment origin when enabling authentication. Password recovery must begin with a fresh recovery email link.

The CLI can be used after authorization in this workspace:

```sh
XDG_DATA_HOME=/tmp/dsaverse-vercel-data XDG_CACHE_HOME=/tmp/dsaverse-vercel-cache npx vercel login
XDG_DATA_HOME=/tmp/dsaverse-vercel-data XDG_CACHE_HOME=/tmp/dsaverse-vercel-cache npx vercel link
# Select your authorized account/team and project dsaverse.
XDG_DATA_HOME=/tmp/dsaverse-vercel-data XDG_CACHE_HOME=/tmp/dsaverse-vercel-cache npx vercel git connect https://github.com/drunkmonkkk/DSAverse.git
XDG_DATA_HOME=/tmp/dsaverse-vercel-data XDG_CACHE_HOME=/tmp/dsaverse-vercel-cache npx vercel --prod
```

Use a single deployment path; if the Git import already deployed the latest `main`, inspect and verify that deployment instead of running another production deploy. Do not commit `.vercel` state or paste tokens into source or chat.
