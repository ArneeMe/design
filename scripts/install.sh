#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$HOME/.claude/skills"
ln -sfn "$repo/skill/design-arne" "$HOME/.claude/skills/design-arne"
echo "skill: ~/.claude/skills/design-arne"

hypr="$HOME/.config/hypr/hyprland.conf"
line="source = $repo/build/hyprland/waddle.conf"
if [ -f "$hypr" ] && ! grep -qxF "$line" "$hypr"; then
  printf '\n%s\n' "$line" >> "$hypr"
  echo "hyprland: la til source i $hypr"
fi

kitty="$HOME/.config/kitty/kitty.conf"
line="include $repo/build/kitty/waddle.conf"
if [ -f "$kitty" ] && ! grep -qxF "$line" "$kitty"; then
  printf '\n%s\n' "$line" >> "$kitty"
  echo "kitty: la til include i $kitty"
fi

paper="$HOME/.config/hypr/hyprpaper.conf"
wall="$repo/build/hyprland/wallpapers/03-natt-2560x1440.png"
if [ -d "$HOME/.config/hypr" ] && [ ! -f "$paper" ]; then
  printf 'preload = %s\nwallpaper = ,%s\n' "$wall" "$wall" > "$paper"
  echo "hyprpaper: skrev $paper"
fi

echo "waybar: legg til denne linja øverst i ~/.config/waybar/style.css"
echo "  @import \"$repo/build/waybar/style.css\";"
