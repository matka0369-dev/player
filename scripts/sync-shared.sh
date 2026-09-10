#!/usr/bin/env bash
# src/shared/ is a VENDORED copy of the shared UI library. Canonical source
# is the monorepo at ${SHARED_SRC:-/Users/chikki/Desktop/matka/web/packages/shared/src}.
#
# EXCEPTION: src/shared/lib/api.ts is a deliberately reduced player-only
# client (no admin/agent endpoints in the bundle) — it is NOT overwritten by
# a sync. Keep it in step by hand when a player-facing endpoint changes.
set -euo pipefail
SRC="${SHARED_SRC:-/Users/chikki/Desktop/matka/web/packages/shared/src}"
DEST="$(cd "$(dirname "$0")/.." && pwd)/src/shared"
[ -d "$SRC" ] || { echo "not found: $SRC (set SHARED_SRC)"; exit 1; }
KEEP_API="$(mktemp)"
cp "$DEST/lib/api.ts" "$KEEP_API"
rm -rf "$DEST" && cp -R "$SRC" "$DEST"
cp "$KEEP_API" "$DEST/lib/api.ts" && rm -f "$KEEP_API"
echo "synced $SRC -> $DEST (kept player-only lib/api.ts)"
