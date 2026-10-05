# Deployment pipeline and soft launch

Every push to `main` runs this automatically:

```
 push to main ──▶ Build + 31 automated tests ──▶ Deploy to STAGING ──▶ Smoke test
                                                      │
                     you check beta.yourdomain, then press "Approve" in GitHub
                                                      ▼
                       Legal pages complete? ──▶ Deploy to PRODUCTION ──▶ Smoke test
```

- **Staging** (`beta.yourdomain.com`) is your private test copy. It's password protected, shows a red "STAGING" bar, is hidden from Google, and has its own separate database.
- **Production** (`yourdomain.com`) is the real site your test coaches use. It only updates after you approve, and only if `app/legal-details.json` is filled in.
- **Every release is checked on the server.** If the new version doesn't start, the server switches back to the previous one automatically. The database is backed up before every update.
- **Pull requests** run the build and tests but never deploy.

---

## One-time setup (about 30 minutes)

### 1. Domain
Point two DNS **A records** at your VPS's IP address:

| Name | Points to |
|---|---|
| `yourdomain.com` (or `@`) | your VPS IP |
| `beta.yourdomain.com` | your VPS IP |

### 2. A key for the pipeline
On your own computer:
```bash
ssh-keygen -t ed25519 -f touchline_deploy -N "" -C "github-actions"
```
This makes `touchline_deploy` (private, goes into GitHub) and `touchline_deploy.pub` (public, goes on the server).

### 3. Set up the server
Copy the repo's `deploy/` folder and `server/.env.example` to the VPS. The simplest way is to clone the repo there. Then:
```bash
sudo bash deploy/server-setup.sh \
  --domain yourdomain.com --staging beta.yourdomain.com \
  --deploy-key "$(cat touchline_deploy.pub)"
```
It installs Node.js 22 and Caddy (which handles HTTPS certificates automatically). It also sets up the firewall, fail2ban (blocks password guessing) and automatic security updates. Then it creates both sites and nightly backups.

**At the end it prints the staging password and the invite codes. Save them.**

Then add your email settings to both config files, `/srv/touchline/production/shared/.env` and `/srv/touchline/staging/shared/.env` (see `server/.env.example`). Also set `CONTACT_EMAIL` and `ADMIN_EMAIL`, which is where "report a concern" and feedback messages go.

### 4. GitHub
1. Create a **private** repository and push this folder to it:
   ```bash
   git remote add origin git@github.com:YOUR-NAME/touchline-studio.git
   git push -u origin main
   ```
2. **Settings → Secrets and variables → Actions → Secrets**, add:

   | Secret | Value |
   |---|---|
   | `DEPLOY_HOST` | your VPS IP address or hostname |
   | `DEPLOY_SSH_KEY` | the whole contents of `touchline_deploy` (the private key) |
   | `DEPLOY_KNOWN_HOSTS` | output of `ssh-keyscan YOUR_VPS_IP` |
   | `STAGING_AUTH` | `tester:THE-STAGING-PASSWORD` |

3. On the same page, under **Variables**, add:

   | Variable | Value |
   |---|---|
   | `STAGING_URL` | `https://beta.yourdomain.com` |
   | `PRODUCTION_URL` | `https://yourdomain.com` |

4. **Settings → Environments → New environment** `production` → tick **Required reviewers** and add yourself. This is the "Approve" step. Also create an environment called `staging` with no rules.

5. Delete `touchline_deploy` from your computer once it's in GitHub.

### 5. First release
Push any commit (or **Actions → Pipeline → Run workflow**). Watch it in the **Actions** tab. Staging deploys on its own. Production waits for you to press **Review deployments → Approve and deploy**.

---

## Day to day

| I want to… | Do this |
|---|---|
| Release a change | Push to `main`, check staging, approve production in GitHub |
| Try a change without releasing | Open a pull request: it's built and tested only |
| Undo a bad release | On the server: `sudo touchline-release rollback production` (takes seconds) |
| See what's live | `sudo touchline-release status production`, or open `/healthz` |
| Release by hand (no GitHub) | `npm run build`, then `DEPLOY_HOST=… bash scripts/deploy.sh staging dist/touchline-*.tar.gz` |
| Run the tests on my computer | `npm run check` (needs Node.js 22.13+) |
| Ask everyone to accept new terms | Change the pages in `app/pages/`, bump `TERMS_VERSION` in both `.env` files, restart: `sudo systemctl restart touchline@production` |

Releases live in `/srv/touchline/<env>/releases/` (the last 5 are kept). Your data and settings live in `/srv/touchline/<env>/shared/` and are never touched by a release.

---

## Soft launch plan

The soft launch is the production site with **sign-up by invite code only** (`SIGNUP_CODE`) and the **Beta · Feedback** badge on (`BETA=1`). Nobody can join without the code you give them.

**Before inviting anyone**
- [ ] `app/legal-details.json` filled in, legal pages reviewed (the pipeline won't deploy production until it's filled in)
- [ ] Data protection fee paid to the Information Commission, registration number in `legal-details.json`
- [ ] Email working: `node admin.js test-email you@…` on both sites; reset and invite emails arrive in the inbox, not spam
- [ ] You've run through the test list on staging (see the Launch pack doc) on an iPhone, an Android phone and a computer
- [ ] Backups: the next morning, check `/srv/touchline/production/shared/backups/` has a file, and copy one to your own computer

**Week 1–2: 3–5 coaches you know**
- [ ] Send each coach the link, the invite code and a 2-line "what to try" list (build a session, publish a week, share the link)
- [ ] Ask them to use it for 2 training sessions and 1 match
- [ ] Check `node admin.js reports` every day or two; reply to everything
- [ ] Check `node admin.js stats` to see who's publishing and whether players open links

**Week 3–4: 10–20 coaches**
- [ ] Fix the top issues from feedback (each fix goes through staging first)
- [ ] Post in 1–2 local Facebook groups with the code; change the code if it spreads further than you want
- [ ] Short feedback survey to everyone

**Ready to open up when**
- [ ] No serious bugs reported for 2 weeks, no unresolved safety reports
- [ ] Coaches are publishing weekly and players are opening links
- [ ] Then remove `SIGNUP_CODE` (anyone can join) and keep `BETA=1` until paid plans arrive
