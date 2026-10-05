#!/usr/bin/env bash
# One-time setup of a fresh Ubuntu 22.04/24.04 or Debian 12 VPS for Touchline Studio,
# with a live site and a password-protected staging site, ready for the GitHub pipeline.
#
# Usage (as root, from the unpacked release or the repo's deploy/ folder):
#   sudo bash server-setup.sh --domain touchlinestudio.co.uk --staging beta.touchlinestudio.co.uk \
#        --deploy-key "ssh-ed25519 AAAA... github-actions"
#
# Safe to run again: it never overwrites your .env files or data.
set -euo pipefail
DOMAIN=""; STAGING=""; KEY=""; SUSER="tester"
while [[ $# -gt 0 ]]; do case "$1" in
  --domain) DOMAIN="$2"; shift 2;; --staging) STAGING="$2"; shift 2;;
  --deploy-key) KEY="$2"; shift 2;; --staging-user) SUSER="$2"; shift 2;;
  *) echo "Unknown option $1"; exit 2;; esac; done
[[ $EUID -eq 0 ]] || { echo "Run with sudo."; exit 1; }
[[ -n "$DOMAIN" && -n "$STAGING" ]] || { echo "Usage: sudo bash server-setup.sh --domain example.com --staging beta.example.com --deploy-key 'ssh-ed25519 ...'"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"
ENVEX="$HERE/../.env.example"; [[ -f "$ENVEX" ]] || ENVEX="$HERE/../server/.env.example"
[[ -f "$ENVEX" ]] || { echo "Can't find .env.example next to the deploy folder."; exit 2; }

echo "==> System packages: Node.js 22, Caddy, firewall, brute-force protection, automatic security updates"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y curl ca-certificates gnupg debian-keyring debian-archive-keyring apt-transport-https ufw fail2ban unattended-upgrades sqlite3
if ! command -v node >/dev/null || ! node -e 'const [a,b]=process.versions.node.split(".").map(Number);process.exit(a>22||(a===22&&b>=13)?0:1)'; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -; apt-get install -y nodejs
fi
if ! command -v caddy >/dev/null; then
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' > /etc/apt/sources.list.d/caddy-stable.list
  apt-get update -y && apt-get install -y caddy
fi
dpkg-reconfigure -f noninteractive unattended-upgrades || true
systemctl enable --now fail2ban

echo "==> Users: 'touchline' runs the app, 'deploy' is what the pipeline logs in as"
id touchline >/dev/null 2>&1 || useradd --system --home /srv/touchline --shell /usr/sbin/nologin touchline
id deploy >/dev/null 2>&1 || useradd --create-home --shell /bin/bash deploy
install -d -m 700 -o deploy -g deploy /home/deploy/.ssh /home/deploy/incoming
if [[ -n "$KEY" ]] && ! grep -qF "$KEY" /home/deploy/.ssh/authorized_keys 2>/dev/null; then echo "$KEY" >> /home/deploy/.ssh/authorized_keys; fi
touch /home/deploy/.ssh/authorized_keys; chown deploy:deploy /home/deploy/.ssh/authorized_keys; chmod 600 /home/deploy/.ssh/authorized_keys
install -m 755 "$HERE/touchline-release" /usr/local/bin/touchline-release
# the pipeline may run the release command and nothing else as root
echo 'deploy ALL=(root) NOPASSWD: /usr/local/bin/touchline-release' > /etc/sudoers.d/touchline-deploy; chmod 440 /etc/sudoers.d/touchline-deploy; visudo -cf /etc/sudoers.d/touchline-deploy

echo "==> Environments"
mkenv() { # name port url
  local E=$1 P=$2 URL=$3 S=/srv/touchline/$1/shared
  install -d -o root -g root /srv/touchline/$E /srv/touchline/$E/releases
  install -d -o touchline -g touchline -m 750 "$S" "$S/data" "$S/backups"
  if [[ ! -f "$S/.env" ]]; then
    local CODE; CODE="$(tr -dc 'A-HJ-NP-Z2-9' </dev/urandom | head -c 8)"
    sed -e "s#^BASE_URL=.*#BASE_URL=$URL#" -e "s#^SIGNUP_CODE=.*#SIGNUP_CODE=$CODE#" -e "s#^PORT=.*#PORT=$P#" \
        -e "s#^APP_ENV=.*#APP_ENV=$E#" -e "s#^DB_PATH=.*#DB_PATH=$S/data/touchline.db#" "$ENVEX" > "$S/.env"
    echo "   $E: created $S/.env (invite code $CODE)"
  fi
  chown touchline:touchline "$S/.env"; chmod 640 "$S/.env"
  cat > /etc/cron.d/touchline-backup-$E <<CRON
15 3 * * * touchline cd /srv/touchline/$E/current && /usr/bin/node --no-warnings=ExperimentalWarning admin.js backup >/dev/null 2>&1 && find $S/backups -name 'touchline-*.db' -mtime +14 -delete
CRON
}
mkenv production 3000 "https://$DOMAIN"
mkenv staging 3001 "https://$STAGING"
install -m 644 "$HERE/touchline@.service" /etc/systemd/system/touchline@.service
systemctl daemon-reload
systemctl enable touchline@production touchline@staging >/dev/null

echo "==> HTTPS (Caddy) for $DOMAIN and $STAGING"
SPASS=""
if [[ ! -f /etc/caddy/Caddyfile ]] || ! grep -q "$STAGING" /etc/caddy/Caddyfile; then
  SPASS="$(tr -dc 'a-zA-Z0-9' </dev/urandom | head -c 16)"; HASH="$(caddy hash-password --plaintext "$SPASS")"
  sed -e "s#__STAGING_DOMAIN__#$STAGING#g" -e "s#__DOMAIN__#$DOMAIN#g" -e "s#__STAGING_USER__#$SUSER#" -e "s#__STAGING_HASH__#$HASH#" "$HERE/Caddyfile.template" > /etc/caddy/Caddyfile
fi
systemctl reload caddy || systemctl restart caddy

echo "==> Firewall: SSH, HTTP, HTTPS only"
ufw allow OpenSSH >/dev/null; ufw allow 80 >/dev/null; ufw allow 443 >/dev/null; ufw --force enable >/dev/null

echo
echo "Setup done. Next:"
echo " 1. Fill in email settings in /srv/touchline/production/shared/.env (and staging)."
echo " 2. Push to GitHub: the pipeline deploys to https://$STAGING, then you approve production."
echo "    (Or deploy by hand: sudo touchline-release deploy production touchline-<version>.tar.gz)"
[[ -n "$SPASS" ]] && echo " Staging login: user '$SUSER', password '$SPASS'  (save it now: it is not shown again)"
echo " Invite codes: production $(grep ^SIGNUP_CODE /srv/touchline/production/shared/.env | cut -d= -f2), staging $(grep ^SIGNUP_CODE /srv/touchline/staging/shared/.env | cut -d= -f2)"
