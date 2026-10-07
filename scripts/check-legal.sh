#!/usr/bin/env bash
# Stops a production release while the legal pages still have empty details.
set -euo pipefail
DIR="${1:-dist/touchline/public}"
MISSING="$(grep -hoE '\[fill in: [^]]*\]' "$DIR"/{privacy,terms,safeguarding,cookies,refunds,acceptable-use}.html | sort -u || true)"
if [[ -n "$MISSING" ]]; then
  echo "$MISSING" >&2
  echo "Fill in app/legal-details.json before going live (the items above are still empty)." >&2; exit 1
fi
echo "Legal pages complete."
