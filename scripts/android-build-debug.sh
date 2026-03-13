#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
APK_PATH="$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
LOG_DIR="$ROOT_DIR/android/build/logs"
BUILD_LOG="$LOG_DIR/assemble-debug.log"
cd "$ROOT_DIR"

bash scripts/android-ensure-sdk.sh

echo "[android:apk:debug] Preparing Android assets"
bash scripts/android-sync.sh

if [[ ! -f android/gradlew ]]; then
  echo "[android:apk:debug] android/gradlew not found. Check Android SDK/Gradle project generation."
  exit 1
fi

echo "[android:apk:debug] Building debug APK"
mkdir -p "$LOG_DIR"
pushd android >/dev/null
if ! ./gradlew assembleDebug --console=plain >"$BUILD_LOG" 2>&1; then
  popd >/dev/null
  echo "[android:apk:debug] Gradle build failed. Log tail:"
  tail -n 80 "$BUILD_LOG"
  exit 1
fi
popd >/dev/null

if [[ ! -f "$APK_PATH" ]]; then
  echo "[android:apk:debug] Build finished but APK not found: $APK_PATH"
  echo "[android:apk:debug] See log: $BUILD_LOG"
  exit 1
fi

echo "[android:apk:debug] Build succeeded"
echo "[android:apk:debug] APK: $APK_PATH"
echo "[android:apk:debug] Size: $(du -h "$APK_PATH" | awk '{print $1}')"
echo "[android:apk:debug] Log: $BUILD_LOG"