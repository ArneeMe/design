export default function cleanyourtv(t, write) {
  const dark = t.mode(t.darkest);
  const walls = t.art.wallpapers ?? [];
  for (const w of walls) write(`wallpapers/${w.file}`, t.art.wallpaper(t, w.scene, 6));
  if (walls.length) write("wallpapers/captions.txt", walls.map(w => `${w.file}\t${w.caption}\n`).join(""));
  const mood = (...scenes) => walls.filter(w => scenes.includes(w.scene)).map(w => w.file);
  write("config.json", JSON.stringify({
    background_color: dark.bg.toUpperCase(),
    sky_intensity: 0,
    wallpaper: walls.length > 0,
    ...(walls.length && {
      wallpaper_rotation_minutes: 60,
      wallpaper_moods: { morning: mood("morning"), evening: mood("afternoon", "evening"), night: mood("night") },
      wallpaper_captions: true,
      wallpaper_dim: 10,
      wallpaper_true_color: true,
    }),
    dock_glass: false,
    dock_opacity: 100,
    ambient_glow: false,
    app_glow: false,
    glass_style: "rim",
    focus_overshoot: false,
    show_greeting: false,
    clock_format: "24",
    clock_wallpaper: walls.length > 0,
    clock_wallpaper_dim: 30,
  }, null, 2) + "\n");
}
