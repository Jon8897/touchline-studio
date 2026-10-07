#!/usr/bin/env bash
# Checks a deployed site from the outside:  bash scripts/smoke.sh https://beta.example.com [expected-version]
# Set SMOKE_AUTH=user:password for the password-protected staging site.
set -euo pipefail
URL="${1:?site address}"; WANT="${2:-}"
C=(curl -fsS --max-time 20 --retry 12 --retry-delay 5 --retry-all-errors ${SMOKE_AUTH:+-u "$SMOKE_AUTH"})
fail(){ echo "SMOKE TEST FAILED: $*" >&2; exit 1; }
H="$("${C[@]}" "$URL/healthz")" || fail "no answer from $URL/healthz"
echo "health: $H"
[[ "$H" == *'"ok":true'* ]] || fail "unhealthy"
[[ -z "$WANT" || "$H" == *"\"version\":\"$WANT\""* ]] || fail "expected version $WANT"
for p in / /app /demo /guide /privacy /terms /refunds /acceptable-use /safeguarding /cookies /og.png; do
  code="$("${C[@]}" -o /dev/null -w '%{http_code}' "$URL$p")" || fail "$p"
  [[ "$code" == 200 ]] || fail "$p returned $code"; echo "ok  $p"
done
HOME_HTML="$("${C[@]}" "$URL/")"; [[ "$HOME_HTML" == *"Plan the week"* ]] || fail "front page content"
code="$(curl -s -o /dev/null -w '%{http_code}' ${SMOKE_AUTH:+-u "$SMOKE_AUTH"} -X POST "$URL/api/teams")"; [[ "$code" == 403 || "$code" == 401 ]] || fail "API should refuse anonymous writes (got $code)"
echo "Smoke test passed for $URL"
