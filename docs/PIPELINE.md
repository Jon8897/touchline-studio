# Going live: server, pipeline and payments

Touchline runs on your existing server next to your other apps. It uses two Docker containers behind your Traefik:

| Site | Address | Container | Data |
|---|---|---|---|
| Live | https://touchline.keefecodes.com | `touchline-live` | `/opt/apps/touchline/live/` |
| Beta (password protected, test payments) | https://beta.touchline.keefecodes.com | `touchline-beta` | `/opt/apps/touchline/beta/` |

Every push to `main` runs this:

```
push ──▶ build + automated tests ──▶ deploy to BETA ──▶ smoke test
                                         │  you check beta, then press "Approve" in GitHub
                                         ▼
                   legal pages filled in? ──▶ deploy to LIVE ──▶ smoke test
```

Each deploy builds a new image, backs up the database, switches over and checks the new version answers. If it doesn't, it switches back to the previous version automatically. Nothing else on the server is touched: not Traefik, not the firewall, not your other apps.

---

## 1. DNS (in your domain panel)

| Type | Name | Points to |
|---|---|---|
| A | `touchline` | 77.68.125.195 (done) |
| A | `beta.touchline` | 77.68.125.195 |

Traefik gets the HTTPS certificates automatically once these resolve.

## 2. Pipeline key (on your computer, PowerShell is fine)

```powershell
ssh-keygen -t ed25519 -f touchline_deploy -N '""' -C github-actions
```

This makes `touchline_deploy` (private: goes into GitHub) and `touchline_deploy.pub` (public: goes on the server). On the server, this key can only deploy Touchline. It can't open a shell or do anything else.

## 3. Server setup (once, about 5 minutes)

Copy the project to the server and run the setup:

```powershell
scp touchline-studio-repo.zip touchline_deploy.pub kcadmin@77.68.125.195:~
ssh kcadmin@77.68.125.195
```

```bash
unzip -o touchline-studio-repo.zip && cd touchline-repo
bash deploy/docker/setup-docker-host.sh \
  --live touchline.keefecodes.com --beta beta.touchline.keefecodes.com \
  --deploy-key "$(cat ~/touchline_deploy.pub)"
```

**Save the beta password and the invite codes it prints.**

Then fill in the settings. The two files are `/opt/apps/touchline/live.env` and `/opt/apps/touchline/beta.env`:

```bash
nano /opt/apps/touchline/live.env
```

| Setting | Live | Beta |
|---|---|---|
| `EMAIL_PROVIDER` | `resend` | `resend` |
| `RESEND_API_KEY` | your Resend key | same, or a second key |
| `EMAIL_FROM` | `Touchline Studio <touchline@keefecodes.com>` | same |
| `CONTACT_EMAIL`, `ADMIN_EMAIL` | where messages and reports should reach you | same |
| `PAYMENTS` | `off` for now (see section 6) | `on` |
| `STRIPE_SECRET_KEY` | `sk_live_…` (later) | `sk_test_…` |

Your keefecodes.com domain is already verified in Resend, so emails from any address `@keefecodes.com` will deliver.

## 4. GitHub (once)

1. Create a **private** repository, then push. From the `touchline-repo` folder on your computer:
   ```bash
   git remote add origin git@github.com:YOUR-NAME/touchline-studio.git
   git push -u origin main
   ```
2. **Settings → Secrets and variables → Actions → Secrets:**

   | Secret | Value |
   |---|---|
   | `DEPLOY_HOST` | `77.68.125.195` |
   | `DEPLOY_SSH_KEY` | the whole of `touchline_deploy` (the file without `.pub`) |
   | `DEPLOY_KNOWN_HOSTS` | output of `ssh-keyscan 77.68.125.195` |
   | `STAGING_AUTH` | `tester:THE-BETA-PASSWORD` |

3. Same page, **Variables:**

   | Variable | Value |
   |---|---|
   | `DEPLOY_USER` | `kcadmin` |
   | `STAGING_URL` | `https://beta.touchline.keefecodes.com` |
   | `PRODUCTION_URL` | `https://touchline.keefecodes.com` |

4. **Settings → Environments:** create `staging`, then create `production` and tick **Required reviewers** with yourself.

## 5. First release

Push a commit, or open **Actions → Pipeline → Run workflow**. Beta updates by itself. Check https://beta.touchline.keefecodes.com on your phone, then in the Actions run press **Review deployments → Approve and deploy** for live.

Live only deploys once `app/legal-details.json` is filled in.

## 6. Payments (Stripe)

**Test on beta first (Stripe test mode):**

1. In the Stripe dashboard, switch to **Test mode**, then go to **Developers → API keys** and copy the secret key (`sk_test_…`) into `beta.env`. Apply it with `touchline-docker restart staging`.
2. Create the products, prices, founder discount, billing page and webhook in one go:
   ```bash
   touchline-docker admin staging stripe-setup
   ```
   It prints about 10 lines. Paste them into `beta.env`, then `touchline-docker restart staging`.
3. On beta, sign up, then use **Team week → Plan & billing → Start free trial** with Stripe's test card `4242 4242 4242 4242` (any future date, any CVC). Try Cancel, Keep my plan, extra teams, and Manage billing. A card that fails: `4000 0000 0000 0341`.
4. In Stripe's billing settings, turn on customer emails for **upcoming renewals**, **failed payments** and **expiring cards** (your Terms promise a reminder before yearly renewals). Under **Settings → Business → Public details**, add your support email and the links to `/terms` and `/privacy`.

**Then switch live on** (when you're ready to charge):

1. Switch Stripe to live mode, put `sk_live_…` in `live.env`, run `touchline-docker restart production`, then `touchline-docker admin production stripe-setup`. Paste the lines it prints into `live.env`, including `PAYMENTS=on`.
2. Optional: give everyone who joined during the beta the founder half-price-for-life discount, plus free access until a date. Set `FOUNDER_GRACE_UNTIL=2026-12-31` in `live.env`, then run `touchline-docker admin production founders --mark-all`.
3. `touchline-docker restart production`

**Demo or partner accounts that don't pay:** `touchline-docker admin production comp their@email 12 3` gives them 12 months free with 3 teams.

---

## Day to day

| I want to… | Do this |
|---|---|
| Release a change | Push to `main`, check beta, approve live |
| Undo a bad release | `touchline-docker rollback production` |
| See what's running | `touchline-docker status` |
| Admin commands | `touchline-docker admin production users` (or `reports`, `stats`, `billing someone@email`…) |
| Change settings | Edit `live.env`, then `touchline-docker restart production` |
| Release by hand | `npm run build`, copy `dist/touchline-*.tar.gz` to the server, then `touchline-docker deploy staging touchline-….tar.gz` |
| Run the tests | `npm run check` on your computer (Node.js 22.13+) |

Backups run nightly at 03:15 (live) and 03:20 (beta) into `/opt/apps/touchline/live/backups`, and are kept 14 days. A backup is also taken before every deploy.

*(If you ever move to a fresh server without Docker, `deploy/server-setup.sh` sets up the same thing with Caddy and systemd; set the GitHub variable `DEPLOY_MODE=systemd`.)*
