# Running the service

All admin commands run on the server:
```bash
touchline-docker admin production <command>      # or: staging
```

| Command | What it does |
|---|---|
| `users` | List coaches, their teams and last login |
| `stats` | Totals: coaches, teams, published weeks, player views |
| `teams <email>` | A coach's teams and assistants |
| `reports` / `reports all` | Open feedback, concerns and privacy requests, with how many days old (reply within 30) |
| `report-done <id>` | Mark a report as dealt with |
| `take-down <link>` | Remove a published player page straight away (after a concern) |
| `export-user <email>` | Write a coach's data to a file (for a data request received by email) |
| `delete-user <email> --yes` | Delete a coach and everything they run |
| `reset-password <email>` | Give a coach a temporary password (if email isn't working) |
| `set-teams <email> <n>` | Change one coach's team limit |
| `inactive [months]` | Coaches who haven't logged in for 24+ months (for the retention promise) |
| `backup` | Make a backup now |
| `billing <email>` | A coach's plan, Stripe status, renewal and trial dates |
| `comp <email> [months] [teams]` | Free access for demo or partner accounts (`0` months removes it) |
| `founders [--mark-all]` | List founding coaches, or mark everyone so far |
| `stripe-setup` | Create Stripe products, prices, coupon, billing page and webhook |
| `test-email <address>` | Check email settings |

## Routines

**Every day or two during the beta**: `admin.js reports`. Concerns about a player page come first: if a child could be at risk, `take-down` the page straight away, then contact the coach. Our safeguarding page promises we look within 2 working days.

**Weekly**: copy the latest backup off the server:
```bash
scp kcadmin@77.68.125.195:/opt/apps/touchline/live/backups/touchline-$(date +%F).db .
```

**Monthly**: check for system updates (`sudo apt update && sudo apt upgrade`); security updates install automatically.

**Yearly**: run `admin.js inactive`, email those coaches, and delete accounts that don't reply within 30 days. Review the legal pages, the safeguarding page and the risk assessments in the Launch pack. Renew the data protection fee (once you have paid it, put the number in `app/legal-details.json`).

## Restoring a backup
```bash
cd /opt/apps/touchline
docker compose stop touchline-live
sudo cp live/data/touchline.db live/data/touchline.db.before-restore
sudo cp live/backups/touchline-2026-11-01.db live/data/touchline.db
sudo rm -f live/data/touchline.db-wal live/data/touchline.db-shm
sudo chown 1000:1000 live/data/touchline.db
docker compose start touchline-live
```

## If something goes wrong
- **Site down**: `touchline-docker status`, `docker logs --tail 100 touchline-live`, then `touchline-docker rollback production` if a release caused it.
- **Payments look wrong**: `touchline-docker admin production billing their@email`; in Stripe, **Developers → Webhooks** shows every event and whether it was delivered. Failed deliveries are retried automatically.
- **Data breach** (someone may have got at personal data): follow the breach steps in the Launch pack. You have **72 hours** to report it to the Information Commission if it's a risk to people.
- **Lost the beta password**: run `openssl passwd -apr1 NEWPASSWORD`, put `BETA_AUTH='tester:<the result>'` in `/opt/apps/touchline/.env`, then `cd /opt/apps/touchline && docker compose up -d touchline-beta`.
