# Running the service

All admin commands run on the server, inside the live release:
```bash
cd /srv/touchline/production/current
sudo -u touchline node --no-warnings admin.js <command>
```
(Use `/srv/touchline/staging/current` for the staging site.)

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
| `test-email <address>` | Check email settings |

## Routines

**Every day or two during the beta**: `admin.js reports`. Concerns about a player page come first: if a child could be at risk, `take-down` the page straight away, then contact the coach. Our safeguarding page promises we look within 2 working days.

**Weekly**: copy the latest backup off the server:
```bash
scp you@VPS:/srv/touchline/production/shared/backups/touchline-$(date +%F).db .
```

**Monthly**: check for system updates (`sudo apt update && sudo apt upgrade`); security updates install automatically.

**Yearly**: run `admin.js inactive`, email those coaches, and delete accounts that don't reply within 30 days. Review the legal pages, the safeguarding page and the risk assessments in the Launch pack. Renew the data protection fee.

## Restoring a backup
```bash
sudo systemctl stop touchline@production
cd /srv/touchline/production/shared
sudo -u touchline cp data/touchline.db data/touchline.db.before-restore
sudo -u touchline cp backups/touchline-2026-11-01.db data/touchline.db
sudo rm -f data/touchline.db-wal data/touchline.db-shm
sudo systemctl start touchline@production
```

## If something goes wrong
- **Site down**: `sudo systemctl status touchline@production`, `sudo journalctl -u touchline@production -n 100`, then `sudo touchline-release rollback production` if a release caused it.
- **Data breach** (someone may have got at personal data): follow the breach steps in the Launch pack. You have **72 hours** to report it to the Information Commission if it's a risk to people.
- **Lost the staging password**: create a new one with `caddy hash-password` and replace the hash in `/etc/caddy/Caddyfile`, then `sudo systemctl reload caddy`.
