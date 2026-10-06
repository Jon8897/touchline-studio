# Touchline Studio

Animated football tactics, 100 drills, a session planner, fitness plans and one weekly link for players. Built for grassroots coaches.

Created by [KeefeCodes](https://keefecodes.com/).

## What's in here

| Folder | What it is |
|---|---|
| `app/` | The app and website: `1_shell.html` + numbered `.js` files (the app), `landing/` (front page), `pages/` (privacy, terms, safeguarding, cookies), `assets/` (share image, fonts, QR library) |
| `app/legal-details.json` | **Your business details for the legal pages. Fill this in before going live.** |
| `server/` | The Node.js server: accounts, teams, assistants, emails, player links (no npm packages needed) |
| `scripts/` | `build.mjs` (builds everything into `dist/`), `deploy.sh`, `smoke.sh`, `check-legal.sh` |
| `tests/` | Automated tests: the whole API end to end, plus checks on the built pages |
| `deploy/` | Server setup, the release command with automatic rollback, service and HTTPS config |
| `.github/workflows/pipeline.yml` | Build → test → staging → (approve) → production |
| `docs/` | [Pipeline setup & soft launch](docs/PIPELINE.md) · [Running the service](docs/OPERATIONS.md) |

## Commands (Node.js 22.13 or newer)

```bash
npm run build    # builds dist/touchline (deployable), dist/touchline-<version>.tar.gz and dist/preview.html
npm test         # runs the automated tests against the built server
npm run check    # both
npm run dev      # build and run locally at http://localhost:3000 (invite code: dev)
```

`dist/preview.html` is a single file with the front page and the whole app that works without a server. It saves on the device only.

## Releasing

Push to `main`. GitHub builds and tests it, deploys to staging, and waits for you to approve production. One-time setup: [docs/PIPELINE.md](docs/PIPELINE.md).
