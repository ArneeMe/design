import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";
import { encodePng, encodeIco } from "./png.mjs";
import { Canvas, rgb, BAYER4 } from "./canvas.mjs";
import { drawPenguin, penguinSvg, SIZE, width as pw, height as ph } from "./penguin.mjs";
import { wallpaper } from "./wallpapers.mjs";
import { check } from "./check-ai-look.mjs";

const root = new URL("../", import.meta.url);
const out = new URL("build/", root);
const tokens = JSON.parse(readFileSync(new URL("tokens.json", root)));

const flat = {};
(function walk(node, path) {
  if ("$value" in node) return void (flat[path.join(".")] = node.$value);
  for (const [k, v] of Object.entries(node)) if (!k.startsWith("$")) walk(v, [...path, k]);
})(tokens, []);

const resolve = v => typeof v === "string" && v.startsWith("{") ? resolve(flat[v.slice(1, -1)]) : v;
const get = path => resolve(flat[path]);
const group = prefix => Object.keys(flat).filter(k => k.startsWith(prefix + ".")).map(k => [k.slice(prefix.length + 1), get(k)]);
const cssName = path => "--" + path.replaceAll(".", "-");
const cssValue = v => Array.isArray(v) ? (typeof v[0] === "number" ? `cubic-bezier(${v.join(", ")})` : v.map(f => f.includes(" ") ? `"${f}"` : f).join(", ")) : v;

const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lum = h => [1, 3, 5].map(i => lin(parseInt(h.slice(i, i + 2), 16) / 255)).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const pairs = [["text", "bg"], ["text", "surface"], ["muted", "bg"], ["muted", "surface"], ["accent", "bg"], ["accent", "surface"], ["on-accent", "accent"]];
const failed = [];
for (const theme of ["dark", "light"])
  for (const [fg, bg] of pairs) {
    const r = ratio(get(`theme.${theme}.${fg}`), get(`theme.${theme}.${bg}`));
    if (r < 4.5) failed.push(`${theme}: ${fg} on ${bg} is ${r.toFixed(2)}`);
  }
const redOnly = h => "#" + h.slice(1, 3) + "0000";
for (const [fg, bg] of [["text", "bg"], ["text", "surface"], ["accent", "bg"], ["on-accent", "accent"]]) {
  const r = ratio(redOnly(get(`theme.dark.${fg}`)), redOnly(get(`theme.dark.${bg}`)));
  if (r < 3) failed.push(`red filter: ${fg} on ${bg} is ${r.toFixed(2)}`);
}
const gray4 = h => Math.round([1, 3, 5].reduce((s, i, k) => s + parseInt(h.slice(i, i + 2), 16) * [0.2126, 0.7152, 0.0722][k], 0) / 85);
for (const fg of ["border", "text", "muted", "accent"])
  for (const bg of ["bg", "surface"])
    if (gray4(get(`theme.light.${fg}`)) === gray4(get(`theme.light.${bg}`))) failed.push(`e-ink: ${fg} on ${bg} lands on the same grey`);
if (failed.length) { console.error("Check failed:\n" + failed.join("\n")); process.exit(1); }

rmSync(out, { recursive: true, force: true });
mkdirSync(new URL("web/fonts/", out), { recursive: true });

const base = Object.keys(flat).filter(k => !k.startsWith("theme.")).map(k => `  ${cssName(k)}: ${cssValue(get(k))};`);
const theme = t => group(`theme.${t}`).map(([k, v]) => `  --${k}: ${v};`).join("\n");
writeFileSync(new URL("web/tokens.css", out), `:root {
${base.join("\n")}
}

:root, [data-theme="dark"] {
  color-scheme: dark;
${theme("dark")}
}

@media (prefers-color-scheme: light) {
  :root:not([data-theme="dark"]) {
    color-scheme: light;
${theme("light").replaceAll("\n", "\n  ").replace(/^/, "  ")}
  }
}

[data-theme="light"] {
  color-scheme: light;
${theme("light")}
}
`);

cpSync(new URL("assets/fonts/jetbrains-mono/", root), new URL("web/fonts/", out), { recursive: true });
writeFileSync(new URL("web/fonts.css", out), [[400, "Regular"], [700, "Bold"]].map(([w, n]) => `@font-face {
  font-family: "JetBrains Mono";
  src: url("fonts/JetBrainsMono-${n}.woff2") format("woff2");
  font-weight: ${w};
  font-display: swap;
}
`).join("\n"));

const vars = prefix => Object.fromEntries(group(prefix).map(([k]) => [k, `var(${cssName(`${prefix}.${k}`)})`]));
const preset = {
  theme: {
    colors: {
      transparent: "transparent",
      current: "currentColor",
      ...Object.fromEntries(group("theme.dark").map(([k]) => [k, `var(--${k})`])),
      grey: vars("color.grey"),
      nebb: vars("color.nebb"),
    },
    fontFamily: { mono: "var(--font-family-mono)", sans: "var(--font-family-mono)" },
    fontSize: vars("font.size"),
    fontWeight: vars("font.weight"),
    spacing: { 0: "0px", ...vars("space") },
    borderRadius: vars("radius"),
    borderWidth: { DEFAULT: "var(--border-width)", 0: "0px" },
    transitionDuration: vars("motion.duration"),
    transitionTimingFunction: { DEFAULT: "var(--motion-easing-standard)" },
  },
};
writeFileSync(new URL("web/tailwind-preset.js", out), `export default ${JSON.stringify(preset, null, 2)};\n`);

const write = (path, data) => {
  const url = new URL(path, out);
  mkdirSync(new URL("./", url), { recursive: true });
  writeFileSync(url, data);
};
const g = Array.from({ length: 10 }, (_, i) => get(`color.grey.${i}`));
const dark = Object.fromEntries(group("theme.dark"));
const light = Object.fromEntries(group("theme.light"));
const ms = path => parseInt(get(path));

const ink = { ink: dark["penguin-ink"], paper: dark["penguin-paper"] };
const icon = (size, plate) => {
  if (size < SIZE) return icon(size * 2, plate).halved();
  const s = Math.floor(size / SIZE), c = new Canvas(size, size);
  if (plate) c.rect(0, 0, size, size, plate);
  drawPenguin(c, Math.floor((size - pw * s) / 2), Math.floor((size - ph * s) / 2), s, ink);
  return c;
};
const png = c => encodePng(c.w, c.h, c.data);
write("penguin/penguin-light.svg", penguinSvg(ink));
write("penguin/penguin-dark.svg", penguinSvg({ ...ink, plate: dark["penguin-plate"] }));
write("penguin/favicon.svg", penguinSvg({ ...ink, plate: dark["penguin-plate"] })
  .replace("<defs>", `<style>@media (prefers-color-scheme: light) { .plate { fill: ${light["penguin-plate"]} } }</style>\n<defs>`)
  .replace(`<rect width="${SIZE * 2}"`, `<rect class="plate" width="${SIZE * 2}"`));
for (const size of [16, 32, 64, 128, 256, 512]) {
  write(`penguin/png/penguin-light-${size}.png`, png(icon(size)));
  write(`penguin/png/penguin-dark-${size}.png`, png(icon(size, dark["penguin-plate"])));
}
write("penguin/favicon.ico", encodeIco([16, 32, 64].map(size => ({ size, png: png(icon(size, dark["penguin-plate"])) }))));

const scenes = [["01-morgen.png", "morning", "Morgen på isbreen"], ["02-kveld.png", "evening", "Kveld på isbreen"], ["03-natt.png", "night", "Natt på isbreen"]];
for (const [file, scene] of scenes) write(`cleanyourtv/waddle/wallpapers/${file}`, png(wallpaper(g, get("color.nebb.dark"), scene)));
write("cleanyourtv/waddle/wallpapers/captions.txt", scenes.map(([f, , t]) => `${f}\t${t}\n`).join(""));
write("cleanyourtv/waddle/config.json", JSON.stringify({
  background_color: dark.bg.toUpperCase(),
  sky_intensity: 0,
  wallpaper: true,
  wallpaper_rotation_minutes: 60,
  wallpaper_moods: { morning: [scenes[0][0]], evening: [scenes[1][0]], night: [scenes[2][0]] },
  wallpaper_captions: true,
  wallpaper_dim: 10,
  wallpaper_true_color: true,
  dock_glass: false,
  dock_opacity: 100,
  ambient_glow: false,
  app_glow: false,
  glass_style: "rim",
  focus_overshoot: false,
  show_greeting: false,
  clock_format: "24",
  clock_wallpaper: true,
  clock_wallpaper_dim: 30,
}, null, 2) + "\n");

const levels = [0, 85, 170, 255];
const level = h => { const l = rgb(h).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0); return levels.reduce((b, v, i) => Math.abs(v - l) < Math.abs(levels[b] - l) ? i : b, 0); };
const ditherMask = h => { const l = rgb(h).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0) / 255, n = Math.round((1 - l) * 16); return BAYER4.reduce((m, b, i) => b < n ? m | (1 << i) : m, 0); };
const cName = k => k.replace(/-(.)/g, (_, c) => c.toUpperCase()).replace(/^./, c => c.toUpperCase());
const named = [...g.map((h, i) => [`Grey${i}`, h]), ["White", get("color.grey.white")], ["NebbDark", get("color.nebb.dark")], ["NebbLight", get("color.nebb.light")]];
write("waddleos/WaddleTokens.h", `#pragma once

#include <stdint.h>

namespace WaddleTokens {

constexpr uint8_t GRAY4_LEVELS[4] = {${levels.join(", ")}};

${named.map(([n, h]) => `constexpr uint32_t RGB_${n} = 0x${h.slice(1)};
constexpr uint8_t GRAY4_${n} = ${level(h)};
constexpr uint16_t DITHER_${n} = 0x${ditherMask(h).toString(16).padStart(4, "0")};`).join("\n")}

${Object.entries(light).map(([k, h]) => `constexpr uint8_t GRAY4_LIGHT_${cName(k)} = ${level(h)};`).join("\n")}

${Object.entries(dark).map(([k, h]) => `constexpr uint8_t GRAY4_DARK_${cName(k)} = ${level(h)};`).join("\n")}

constexpr uint8_t BAYER_4X4[16] = {${BAYER4.join(", ")}};

constexpr uint16_t BAYER_PATTERN[17] = {
${Array.from({ length: 17 }, (_, n) => "    0x" + BAYER4.reduce((m, b, i) => b < n ? m | (1 << i) : m, 0).toString(16).padStart(4, "0")).join(",\n")}};

inline bool ditherInk(uint16_t pattern, int x, int y) { return (pattern >> (((y & 3) << 2) | (x & 3))) & 1; }

constexpr int SPACE_1 = ${parseInt(get("space.1"))};
constexpr int SPACE_2 = ${parseInt(get("space.2"))};
constexpr int SPACE_3 = ${parseInt(get("space.3"))};
constexpr int SPACE_4 = ${parseInt(get("space.4"))};
constexpr int SPACE_6 = ${parseInt(get("space.6"))};
constexpr int SPACE_8 = ${parseInt(get("space.8"))};
constexpr int SPACE_12 = ${parseInt(get("space.12"))};
constexpr int BORDER_WIDTH = ${parseInt(get("border.width"))};
constexpr int RADIUS_SM = ${parseInt(get("radius.sm"))};

}
`);

for (const [file, scene] of scenes)
  for (const [w, h, scale] of [[1920, 1080, 6], [2560, 1440, 8], [3840, 2160, 12]])
    write(`hyprland/wallpapers/${file.replace(".png", `-${w}x${h}.png`)}`, png(wallpaper(g, get("color.nebb.dark"), scene, scale)));

const hypr = h => `rgb(${h.slice(1)})`;
const [e1, e2, e3, e4] = get("motion.easing.standard");
write("hyprland/waddle.conf", `$bg = ${hypr(dark.bg)}
$surface = ${hypr(dark.surface)}
$border = ${hypr(dark.border)}
$text = ${hypr(dark.text)}
$muted = ${hypr(dark.muted)}
$accent = ${hypr(dark.accent)}

general {
    border_size = ${parseInt(get("border.width"))}
    gaps_in = ${parseInt(get("space.1"))}
    gaps_out = ${parseInt(get("space.2"))}
    col.active_border = $accent
    col.inactive_border = $border
}

decoration {
    rounding = ${parseInt(get("radius.none"))}
    shadow {
        enabled = false
    }
    blur {
        enabled = false
    }
}

animations {
    enabled = true
    bezier = waddle, ${e1}, ${e2}, ${e3}, ${e4}
    animation = windows, 1, ${ms("motion.duration.base") / 100}, waddle, slide
    animation = border, 1, ${ms("motion.duration.fast") / 100}, waddle
    animation = fade, 1, ${ms("motion.duration.fast") / 100}, waddle
    animation = workspaces, 1, ${ms("motion.duration.base") / 100}, waddle, slide
}

misc {
    background_color = $bg
    disable_hyprland_logo = true
    disable_splash_rendering = true
}

group {
    col.border_active = $accent
    col.border_inactive = $border
}
`);

const ansi = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];
write("kitty/waddle.conf", `font_family JetBrains Mono
bold_font JetBrains Mono Bold
cursor_blink_interval 0
window_border_width ${get("border.width")}
window_padding_width ${parseInt(get("space.2"))}
tab_bar_style separator
tab_separator " "

foreground ${dark.text}
background ${dark.bg}
selection_foreground ${dark.text}
selection_background ${dark.border}
cursor ${dark.accent}
cursor_text_color ${dark.bg}
url_color ${dark.accent}
active_border_color ${dark.accent}
inactive_border_color ${dark.border}
bell_border_color ${get("color.ansi.red")}
active_tab_foreground ${dark.text}
active_tab_background ${dark.border}
inactive_tab_foreground ${dark.muted}
inactive_tab_background ${dark.bg}
tab_bar_background ${dark.bg}

${[...ansi, ...ansi.map(n => `bright-${n}`)].map((n, i) => `color${i} ${get(`color.ansi.${n}`)}`).join("\n")}
`);

write("waybar/colors.css", Object.entries(dark).map(([k, h]) => `@define-color ${k} ${h};`).join("\n") + "\n");
write("waybar/style.css", `@import "colors.css";

* {
  font-family: "JetBrains Mono", monospace;
  font-size: ${get("font.size.sm")};
  border: none;
  border-radius: ${get("radius.none")};
  min-height: 0;
}

window#waybar {
  background: @bg;
  color: @text;
  border-bottom: ${get("border.width")} solid @border;
}

#workspaces button {
  padding: 0 ${get("space.2")};
  color: @muted;
  background: transparent;
  border-bottom: ${get("border.width")} solid transparent;
  transition: all ${get("motion.duration.fast")};
}

#workspaces button.active {
  color: @text;
  border-bottom-color: @accent;
}

#workspaces button.urgent {
  color: @on-accent;
  background: @accent;
}

#workspaces button:hover {
  background: @surface;
  box-shadow: none;
}

#clock, #battery, #network, #pulseaudio, #cpu, #memory, #tray, #bluetooth {
  padding: 0 ${get("space.3")};
}

#clock {
  color: @text;
  font-weight: ${get("font.weight.bold")};
}

#battery.warning, #battery.critical, #network.disconnected, #pulseaudio.muted {
  color: @accent;
}

tooltip {
  background: @surface;
  border: ${get("border.width")} solid @border;
}
`);

const look = check(["preview", "build/web", "build/waybar", "build/kitty", "build/penguin", "skill", "README.md", "AGENTS.md"].map(p => new URL(p, root).pathname));
if (look.length) { console.error("AI look found:\n" + look.join("\n")); process.exit(1); }

console.log("build ok");
