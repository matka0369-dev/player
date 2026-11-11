# player

The **player** portal — a standalone Vite + React SPA.

## Local dev
```bash
npm install
npm run dev
```
Defaults to core-service `http://localhost:3000`, prediction-service
`http://localhost:8080`. Override in `.env.local`.

## Deploy (Vercel)
- Framework preset: **Vite** · Build `npm run build` · Output `dist`
- `vercel.json` proxies `/api/core/*` and `/api/prediction/*` to the backends,
  so the browser only talks to this origin — **no CORS**, session cookie stays
  `sameSite=lax`. `.env.production` already points the app at those paths.
- If the backend URLs differ, edit them in `vercel.json`.

## Backends
- core-service (NestJS): repo `player-backend`
- prediction-service (Go): repo `go-predict`

## Shared UI library
`src/shared/` is a **vendored copy** from the monorepo
(`web/packages/shared/src`). Edit it there, then run
`./scripts/sync-shared.sh` in each portal repo.

## Android APK (per Agent)

Each Agent has its own lightweight APK — a ~1 MB Trusted Web Activity that opens this
site full-screen at `/join/<agent invite code>`. Players get it from that Agent's invite
page (the Register screen offers "Install the app" in an Android browser), served from
`public/apk/<code>.apk`.

Build one with `scripts/build-agent-apk.sh <inviteCode>` (the code is on the Agent's
"Invite players" screen). One-time toolchain and signing key live **outside** the repo —
see the script header. Back up `~/.predictsim-keystore`: if the key is lost, installed
apps can't be updated in place, only uninstalled and reinstalled. The key's SHA-256
fingerprint is in `public/.well-known/assetlinks.json`; change one, change the other.
