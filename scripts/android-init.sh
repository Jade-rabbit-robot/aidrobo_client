#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

bash scripts/android-ensure-sdk.sh

if [[ ! -d node_modules/@capacitor ]]; then
  echo "[android:init] Missing Capacitor dependencies. Run: npm install"
  exit 1
fi

if [[ ! -f capacitor.config.json ]]; then
  echo "[android:init] capacitor.config.json not found"
  exit 1
fi

if [[ ! -d android ]]; then
  echo "[android:init] Creating Android project"
  npx cap add android
else
  echo "[android:init] Android project already exists"
fi

echo "[android:init] Syncing web assets"
npx cap sync android

echo "[android:init] Done"
echo "[android:init] Next: npm run android:open"