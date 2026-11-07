#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
theme="${1:-waddle}"
out="$repo/build/$theme/android"
home=/data/data/com.termux/files/home
tmp=/data/local/tmp/design-$theme

adb get-state >/dev/null

adb shell mkdir -p "/sdcard/Pictures/$theme"
adb push "$out"/wallpapers/*.png "/sdcard/Pictures/$theme/" >/dev/null
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file:///sdcard/Pictures/$theme" >/dev/null
echo "bakgrunner: Bilder/$theme på telefonen"

adb shell cmd uimode night yes >/dev/null
adb shell settings put secure theme_customization_overlay_packages "'$(tr -d '\n' < "$out/theme.json")'"
echo "farge: $(grep -o '"[0-9A-F]\{6\}"' "$out/theme.json" | head -1 | tr -d '"'), mørk modus på"

adb shell rm -rf "$tmp"
adb push "$out/termux" "$tmp" >/dev/null
if adb shell command -v su >/dev/null 2>&1; then
  as_root() { adb shell "su -c '$1'"; }
else
  adb root >/dev/null
  adb wait-for-device
  as_root() { adb shell "$1"; }
fi
as_root "mkdir -p $home/.termux && cd $home/.termux && for f in colors.properties font.ttf; do [ -f \$f ] && [ ! -f \$f.for-design ] && cp \$f \$f.for-design; cp $tmp/\$f .; done && chown -R \$(stat -c %u:%g $home) . && restorecon -R . && rm -rf $tmp"
echo "termux: kjør termux-reload-settings i Termux"
