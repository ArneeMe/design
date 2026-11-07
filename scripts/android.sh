#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
theme="${1:-waddle}"
out="$repo/build/$theme/android"
termux=/sdcard/Download/$theme-termux

adb get-state >/dev/null

adb shell mkdir -p "/sdcard/Pictures/$theme"
adb push "$out"/wallpapers/*.png "/sdcard/Pictures/$theme/" >/dev/null
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file:///sdcard/Pictures/$theme" >/dev/null
echo "bakgrunner: Bilder/$theme på telefonen"

adb shell cmd uimode night yes >/dev/null
adb shell settings put secure theme_customization_overlay_packages "'$(tr -d '\n' < "$out/theme.json")'"
echo "farge: $(grep -o '"[0-9A-F]\{6\}"' "$out/theme.json" | head -1 | tr -d '"'), mørk modus på"

adb shell rm -rf "$termux"
adb push "$out/termux" "$termux" >/dev/null
echo "termux: kjør dette i Termux (første gang: termux-setup-storage)"
echo "  sh $termux/install.sh"
