#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
VARIABLES_FILE="$ANDROID_DIR/variables.gradle"

get_required_api_level() {
  if [[ -f "$VARIABLES_FILE" ]]; then
    local level
    level="$(sed -nE 's/^[[:space:]]*compileSdkVersion[[:space:]]*=[[:space:]]*([0-9]+).*/\1/p' "$VARIABLES_FILE" | head -n 1)"
    if [[ -n "$level" ]]; then
      printf '%s\n' "$level"
      return 0
    fi
  fi

  printf '34\n'
}

detect_sdk_dir() {
  if [[ -n "${ANDROID_HOME:-}" && -d "${ANDROID_HOME}" ]]; then
    printf '%s\n' "$ANDROID_HOME"
    return 0
  fi

  if [[ -n "${ANDROID_SDK_ROOT:-}" && -d "${ANDROID_SDK_ROOT}" ]]; then
    printf '%s\n' "$ANDROID_SDK_ROOT"
    return 0
  fi

  local candidates=(
    "/usr/lib/android-sdk"
    "/opt/android-sdk"
    "$HOME/Android/Sdk"
  )

  local candidate
  for candidate in "${candidates[@]}"; do
    if [[ -d "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  return 1
}

escape_for_local_properties() {
  printf '%s' "$1" | sed 's#\\#\\\\#g; s#:#\\:#g'
}

ensure_local_properties() {
  local sdk_dir="$1"
  if [[ ! -d "$ANDROID_DIR" ]]; then
    return 0
  fi

  cat > "$ANDROID_DIR/local.properties" <<EOF
sdk.dir=$(escape_for_local_properties "$sdk_dir")
EOF
}

main() {
  local required_api_level required_platform sdk_dir
  required_api_level="$(get_required_api_level)"
  required_platform="android-$required_api_level"

  if ! sdk_dir="$(detect_sdk_dir)"; then
    echo "[android:sdk] Android SDK not found."
    echo "[android:sdk] Set ANDROID_HOME or install Android Studio / Android SDK first."
    exit 1
  fi

  export ANDROID_HOME="$sdk_dir"
  export ANDROID_SDK_ROOT="$sdk_dir"

  ensure_local_properties "$sdk_dir"

  if [[ ! -d "$sdk_dir/platforms/$required_platform" ]]; then
    echo "[android:sdk] Found SDK at: $sdk_dir"
    echo "[android:sdk] Missing required platform: $required_platform"
    echo "[android:sdk] Install at least: platform-tools, platforms;$required_platform, build-tools;$required_api_level.0.0"
    echo "[android:sdk] If sdkmanager is available, run:"
    echo "[android:sdk]   sdkmanager \"platform-tools\" \"platforms;$required_platform\" \"build-tools;$required_api_level.0.0\""
    exit 1
  fi

  echo "[android:sdk] Using SDK: $sdk_dir"
  echo "[android:sdk] Using platform: $required_platform"
}

main "$@"