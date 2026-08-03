#!/usr/bin/env bash
# Smoke test for POST /api/runs. Usage: bash scripts/smoke.sh <key> <slug> [tenant-b-key]
KEY="$1"; SLUG="$2"; KEY_B="${3:-}"; BASE="${BASE:-http://localhost:3000}"
TS="$(date +%s)-$$"

ping() {
  code=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/runs" \
    -H "Authorization: Bearer $3" -H "Content-Type: application/json" -d "$4")
  echo "$1  want=$2 got=$code"
}

ping "start smoke-1   " 202 "$KEY" '{"pipeline":"'$SLUG'","status":"start","run_id":"smoke-'$TS'-1"}'
ping "close smoke-1   " 202 "$KEY" '{"pipeline":"'$SLUG'","status":"success","run_id":"smoke-'$TS'-1"}'
ping "replay close    " 202 "$KEY" '{"pipeline":"'$SLUG'","status":"success","run_id":"smoke-'$TS'-1"}'
ping "no-start close  " 202 "$KEY" '{"pipeline":"'$SLUG'","status":"success","run_id":"smoke-'$TS'-2"}'
ping "bad key         " 401 "trk_wrong" '{"pipeline":"'$SLUG'","status":"start"}'
ping "unknown slug    " 404 "$KEY" '{"pipeline":"nope","status":"start"}'
[ -n "$KEY_B" ] && ping "cross-tenant    " 404 "$KEY_B" '{"pipeline":"'$SLUG'","status":"start"}'
ping "bad status      " 422 "$KEY" '{"pipeline":"'$SLUG'","status":"exploded"}'
ping "broken json     " 422 "$KEY" '{"pipeline":'
ping "fail smoke-3    " 202 "$KEY" '{"pipeline":"'$SLUG'","status":"fail","run_id":"smoke-'$TS'-3","exit_code":1,"message":"timeout"}'