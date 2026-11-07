#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
theme="${1:-waddle}"
wrapper="${2:-$HOME/Code/waddleOS/phone}"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

cp -r "$repo/build/$theme/iconpack/." "$work/"
cp -r "$wrapper/gradle" "$wrapper/gradlew" "$work/"
[ -f "$wrapper/local.properties" ] && cp "$wrapper/local.properties" "$work/"

(cd "$work" && ./gradlew -q assembleDebug)
adb install -r "$work/app/build/outputs/apk/debug/app-debug.apk"
echo "ikonpakke: installert. Velg «$(sed -n 's/.*app_name">\(.*\)<.*/\1/p' "$repo/build/$theme/iconpack/app/src/main/res/values/strings.xml")» som ikonpakke i launcheren."
