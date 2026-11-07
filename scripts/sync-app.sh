#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
module="${1:?bruk: scripts/sync-app.sh <app-modul, f.eks. ~/Code/waddleOS/phone/app> [tema]}"
theme="${2:-waddle}"
out="$repo/build/$theme/app-android"

cp -r "$out/java" "$out/res" "$module/src/main/"
mkdir -p "$module/src/main/res/drawable"
cp "$repo"/build/icons/android/drawable/*.xml "$module/src/main/res/drawable/"
echo "kopierte $theme-tokens fra design $(git -C "$repo" describe --tags --always) til $module"
