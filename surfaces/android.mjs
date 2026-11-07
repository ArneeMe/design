import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const phones = [{ id: "fairphone-6", width: 1116, height: 2484, scale: 6 }];
const ansi = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];

export default function android(t, write) {
  const m = t.mode(t.darkest);
  for (const p of phones)
    for (const w of t.art.wallpapers ?? [])
      write(`wallpapers/${w.file.replace(".png", `-${p.id}.png`)}`, t.art.wallpaper(t, w.scene, p.scale, "phone"));

  const seed = m.accent.slice(1).toUpperCase();
  write("theme.json", JSON.stringify({
    "android.theme.customization.color_source": "preset",
    "android.theme.customization.system_palette": seed,
    "android.theme.customization.accent_color": seed,
    "android.theme.customization.theme_style": "TONAL_SPOT",
  }) + "\n");

  write("termux/colors.properties", [
    `background=${m.bg}`,
    `foreground=${m.text}`,
    `cursor=${m.accent}`,
    ...[...ansi, ...ansi.map(n => `bright-${n}`)].map((n, i) => `color${i}=${t.get(`color.ansi.${n}`)}`),
  ].join("\n") + "\n");
  write("termux/font.ttf", readFileSync(new URL("assets/fonts/jetbrains-mono/ttf/JetBrainsMono-Regular.ttf", root)));
  write("termux/install.sh", `dir="$(cd "$(dirname "$0")" && pwd)"
mkdir -p ~/.termux
for f in colors.properties font.ttf; do
  [ -f ~/.termux/$f ] && [ ! -f ~/.termux/$f.for-design ] && cp ~/.termux/$f ~/.termux/$f.for-design
  cp "$dir/$f" ~/.termux/
done
termux-reload-settings
echo "termux: bruker ${t.id}"
`);
}
