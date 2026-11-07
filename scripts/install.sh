#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
theme="${1:-waddle}"
out="$repo/build/$theme"

mkdir -p "$HOME/.claude/skills"
ln -sfn "$repo/skill/design-arne" "$HOME/.claude/skills/design-arne"
echo "skill: ~/.claude/skills/design-arne"

hypr="$HOME/.config/hypr/hyprland.conf"
line="source = $out/hyprland/$theme.conf"
if [ -f "$hypr" ] && ! grep -qxF "$line" "$hypr"; then
  grep -vF "$repo/build/" "$hypr" > "$hypr.tmp" || true
  mv "$hypr.tmp" "$hypr"
  printf '\n%s\n' "$line" >> "$hypr"
  echo "hyprland: bruker $theme i $hypr"
fi

kitty="$HOME/.config/kitty/kitty.conf"
line="include $out/kitty/$theme.conf"
if [ -f "$kitty" ] && ! grep -qxF "$line" "$kitty"; then
  grep -vF "$repo/build/" "$kitty" > "$kitty.tmp" || true
  mv "$kitty.tmp" "$kitty"
  printf '\n%s\n' "$line" >> "$kitty"
  echo "kitty: bruker $theme i $kitty"
fi

paper="$HOME/.config/hypr/hyprpaper.conf"
wall="$(ls "$out"/hyprland/wallpapers/*-2560x1440.png 2>/dev/null | tail -1)"
if [ -n "$wall" ] && [ -d "$HOME/.config/hypr" ] && [ ! -f "$paper" ]; then
  printf 'preload = %s\nwallpaper = ,%s\n' "$wall" "$wall" > "$paper"
  echo "hyprpaper: skrev $paper"
fi

echo "waybar: legg til denne linja øverst i ~/.config/waybar/style.css"
echo "  @import \"$out/waybar/style.css\";"
