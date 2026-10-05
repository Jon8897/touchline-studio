#!/usr/bin/env bash
# Sends a built release to the server and installs it.  Used by the pipeline, and works from your own computer too:
#   DEPLOY_HOST=203.0.113.10 bash scripts/deploy.sh staging dist/touchline-abc1234.tar.gz
set -euo pipefail
ENV="${1:?staging or production}"; TAR="${2:?path to touchline-<version>.tar.gz}"
HOST="${DEPLOY_HOST:?set DEPLOY_HOST to your server address}"; USER_="${DEPLOY_USER:-deploy}"
OPTS=(-o BatchMode=yes -o ConnectTimeout=15 ${DEPLOY_SSH_KEY_FILE:+-i "$DEPLOY_SSH_KEY_FILE"})
NAME="$(basename "$TAR")"
echo "==> Uploading $NAME to $HOST"
scp "${OPTS[@]}" "$TAR" "$USER_@$HOST:incoming/$NAME"
echo "==> Installing on $ENV"
ssh "${OPTS[@]}" "$USER_@$HOST" "sudo /usr/local/bin/touchline-release deploy $ENV ~/incoming/$NAME; rc=\$?; find ~/incoming -name 'touchline-*.tar.gz' -mtime +7 -delete; exit \$rc"
