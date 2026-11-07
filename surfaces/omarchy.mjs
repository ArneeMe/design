const ansi = ["red", "yellow", "green", "cyan", "blue", "magenta"];

export default function omarchy(t, write) {
  const m = t.mode(t.darkest);
  const color = n => t.get(`color.ansi.${n}`);
  write("colors.toml", `mode = "${t.darkest}"

accent = "${m.accent}"
selection = "${m.border}"
muted = "${m.muted}"

background = "${m.bg}"
lighter_background = "${m.surface}"
foreground = "${m.text}"

orange = "${m.accent}"
${ansi.map(n => `${n} = "${color(n)}"`).join("\n")}

${ansi.map(n => `bright_${n} = "${color(`bright-${n}`)}"`).join("\n")}

hyprland_active_border = "${m.accent}"
hyprland_inactive_border = "${m.border}"
`);
  write("icons.theme", "Yaru\n");
  const walls = t.art.wallpapers ?? [];
  for (const w of walls) write(`backgrounds/${w.file}`, t.art.wallpaper(t, w.scene, 8, "desktop"));
  const night = walls.find(w => w.scene === "night") ?? walls[0];
  if (night) write("preview.png", t.art.wallpaper(t, night.scene, 8, "desktop"));
}
