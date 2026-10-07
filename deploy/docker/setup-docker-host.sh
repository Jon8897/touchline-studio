#!/usr/bin/env bash
# One-time setup of Touchline Studio on a server that already runs Docker + Traefik
# (Traefik network "public", entrypoints web/websecure, certificate resolver "le").
# It only creates /opt/apps/touchline and one command. It does not touch Traefik, the firewall or other apps.
#
# Run as your normal admin user (needs sudo once, and must be in the docker group):
#   bash deploy/docker/setup-docker-host.sh --live touchline.keefecodes.com --beta beta.touchline.keefecodes.com \
#        --deploy-key "ssh-ed25519 AAAA... github-actions"
set -euo pipefail
LIVE=""; BETA=""; KEY=""; SUSER="tester"
while [[ $# -gt 0 ]]; do case "$1" in --live) LIVE="$2"; shift 2;; --beta) BETA="$2"; shift 2;; --deploy-key) KEY="$2"; shift 2;; --beta-user) SUSER="$2"; shift 2;; *) echo "Unknown option $1"; exit 2;; esac; done
[[ -n "$LIVE" && -n "$BETA" ]] || { echo "Usage: bash setup-docker-host.sh --live touchline.example.com --beta beta.touchline.example.com --deploy-key 'ssh-ed25519 ...'"; exit 2; }
HERE="$(cd "$(dirname "$0")" && pwd)"; APP=/opt/apps/touchline
ENVEX="$HERE/../../.env.example"; [[ -f "$ENVEX" ]] || ENVEX="$HERE/../../server/.env.example"; [[ -f "$ENVEX" ]] || { echo "Can't find .env.example"; exit 2; }
docker network inspect public >/dev/null 2>&1 || { echo "Docker network 'public' not found. Is Traefik running?"; exit 1; }
docker info >/dev/null 2>&1 || { echo "Your user can't run docker. Add it to the docker group first."; exit 1; }

echo "==> Folders in $APP"
sudo mkdir -p "$APP"/{live,beta}/{data,backups} "$APP/releases" "$APP/incoming"
sudo chown -R "$(id -u):$(id -g)" "$APP"
sudo chown -R 1000:1000 "$APP"/live "$APP"/beta      # the app runs as user "node" (uid 1000) inside the container
install -m 644 "$HERE/docker-compose.yml" "$APP/docker-compose.yml"

SPASS=""
if [[ ! -f "$APP/.env" ]]; then
  SPASS="$(openssl rand 400 | LC_ALL=C tr -dc 'a-zA-Z0-9' | cut -c1-16)"
  HASH="$(openssl passwd -apr1 "$SPASS")"   # single-quoted below so docker compose keeps the $ signs
  cat > "$APP/.env" <<ENV
LIVE_HOST=$LIVE
BETA_HOST=$BETA
BETA_AUTH='$SUSER:$HASH'
LIVE_IMAGE=touchline:none
BETA_IMAGE=touchline:none
ENV
fi
mkenv() { local F=$1 URL=$2 CODE
  [[ -f "$APP/$F" ]] && return
  CODE="$(openssl rand 400 | LC_ALL=C tr -dc 'A-HJ-NP-Z2-9' | cut -c1-8)"
  sed -e "s#^BASE_URL=.*#BASE_URL=$URL#" -e "s#^SIGNUP_CODE=.*#SIGNUP_CODE=$CODE#" -e "/^PORT=/d" -e "/^HOST=/d" -e "/^DB_PATH=/d" -e "/^APP_ENV=/d" "$ENVEX" > "$APP/$F"
  chmod 600 "$APP/$F"; echo "   $F created (invite code $CODE)"
}
mkenv live.env "https://$LIVE"; mkenv beta.env "https://$BETA"

echo "==> Command: /usr/local/bin/touchline-docker"
sudo install -m 755 "$HERE/touchline-docker" /usr/local/bin/touchline-docker

if [[ -n "$KEY" ]]; then
  echo "==> Pipeline key (can only deploy Touchline, nothing else)"
  mkdir -p ~/.ssh && chmod 700 ~/.ssh && touch ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
  LINE="command=\"/usr/local/bin/touchline-docker ssh-gate\",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty $KEY"
  grep -qF "$KEY" ~/.ssh/authorized_keys || echo "$LINE" >> ~/.ssh/authorized_keys
fi

echo "==> Nightly backups at 03:15, kept 14 days"
( { crontab -l 2>/dev/null || true; } | { grep -v 'touchline-docker backup' || true; } ; \
  echo "15 3 * * * /usr/local/bin/touchline-docker backup production >/dev/null 2>&1; find $APP/live/backups -name 'touchline-*.db' -mtime +14 -delete" ; \
  echo "20 3 * * * /usr/local/bin/touchline-docker backup staging >/dev/null 2>&1; find $APP/beta/backups -name 'touchline-*.db' -mtime +14 -delete" ) | crontab -

echo
echo "Done. Next: put your email and Stripe settings in $APP/live.env and $APP/beta.env, then push to GitHub."
echo "First release by hand instead:  touchline-docker deploy staging touchline-<version>.tar.gz"
[[ -n "$SPASS" ]] && echo "Beta site login: user '$SUSER', password '$SPASS'  (save it now: it isn't shown again)"
echo "Invite codes: live $(grep ^SIGNUP_CODE= "$APP/live.env" | cut -d= -f2), beta $(grep ^SIGNUP_CODE= "$APP/beta.env" | cut -d= -f2)"
