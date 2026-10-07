#!/usr/bin/env bash
# Sends a built release to the server and installs it. Used by the pipeline; works from your own computer too:
#   DEPLOY_HOST=77.68.125.195 DEPLOY_USER=kcadmin bash scripts/deploy.sh staging dist/touchline-abc1234.tar.gz
# DEPLOY_MODE=docker (default): Docker + Traefik server set up with deploy/docker/setup-docker-host.sh.
#   The release is streamed over SSH to `touchline-docker ssh-gate`, the only thing the pipeline's key may run.
# DEPLOY_MODE=systemd: plain server set up with deploy/server-setup.sh.
set -euo pipefail
ENV="${1:?staging or production}"; TAR="${2:?path to touchline-<version>.tar.gz}"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST to your server address}"; MODE="${DEPLOY_MODE:-docker}"
OPTS=(-o BatchMode=yes -o ConnectTimeout=15 ${DEPLOY_SSH_KEY_FILE:+-i "$DEPLOY_SSH_KEY_FILE"})
NAME="$(basename "$TAR")"
if [[ "$MODE" == docker ]]; then
  USER_="${DEPLOY_USER:-kcadmin}"
  echo "==> Sending $NAME to $USER_@$HOST and deploying to $ENV"
  ssh "${OPTS[@]}" "$USER_@$HOST" "deploy $ENV" < "$TAR"
else
  USER_="${DEPLOY_USER:-deploy}"
  echo "==> Uploading $NAME to $HOST"
  scp "${OPTS[@]}" "$TAR" "$USER_@$HOST:incoming/$NAME"
  echo "==> Installing on $ENV"
  ssh "${OPTS[@]}" "$USER_@$HOST" "sudo /usr/local/bin/touchline-release deploy $ENV ~/incoming/$NAME; rc=\$?; find ~/incoming -name 'touchline-*.tar.gz' -mtime +7 -delete; exit \$rc"
fi
