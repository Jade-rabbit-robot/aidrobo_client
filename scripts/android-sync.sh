#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT_DIR/android/build/logs"
WEB_BUILD_LOG="$LOG_DIR/web-build.log"
CAP_SYNC_LOG="$LOG_DIR/cap-sync.log"
cd "$ROOT_DIR"

echo "[android:sync] Building web assets"
mkdir -p "$LOG_DIR"

if ! npm run build >"$WEB_BUILD_LOG" 2>&1; then
  echo "[android:sync] Web build failed. Log tail:"
  tail -n 80 "$WEB_BUILD_LOG"
  exit 1
fi

if [[ ! -d android ]]; then
  echo "[android:sync] Android project missing, initializing first"
  bash scripts/android-init.sh
  exit 0
fi

echo "[android:sync] Syncing Capacitor Android project"
if ! npx cap sync android >"$CAP_SYNC_LOG" 2>&1; then
  echo "[android:sync] Capacitor sync failed. Log tail:"
  tail -n 80 "$CAP_SYNC_LOG"
  exit 1
fi

echo "[android:sync] Done"
echo "[android:sync] Web log: $WEB_BUILD_LOG"
echo "[android:sync] Sync log: $CAP_SYNC_LOG"