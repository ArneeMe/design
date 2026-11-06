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

echo "waybar: legg til denne linja øverst i ~/.config/waybar/style.css"
echo "  @import \"$repo/build/waybar/style.css\";"
