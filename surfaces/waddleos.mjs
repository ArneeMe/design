import { rgb, BAYER4 } from "../scripts/lib/canvas.mjs";

const levels = [0, 85, 170, 255];
const luma = h => rgb(h).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
const level = h => levels.reduce((b, v, i) => Math.abs(v - luma(h)) < Math.abs(levels[b] - luma(h)) ? i : b, 0);
const mask = n => BAYER4.reduce((m, b, i) => b < n ? m | (1 << i) : m, 0);
const ditherMask = h => mask(Math.round((1 - luma(h) / 255) * 16));
const pascal = k => k.split(/[.-]/).map(p => p[0].toUpperCase() + p.slice(1)).join("");
const px = v => parseInt(v);

export default function waddleos(t, write) {
  const ns = `${t.name}Tokens`;
  const named = t.group("color").filter(([k]) => !k.startsWith("ansi.")).map(([k, h]) => [pascal(k), h]);
  const modes = t.modes.map(m => Object.entries(t.mode(m)).map(([k, h]) => `constexpr uint8_t GRAY4_${m.toUpperCase()}_${pascal(k)} = ${level(h)};`).join("\n"));
  write(`${ns}.h`, `#pragma once

#include <stdint.h>

namespace ${ns} {

constexpr uint8_t GRAY4_LEVELS[4] = {${levels.join(", ")}};

${named.map(([n, h]) => `constexpr uint32_t RGB_${n} = 0x${h.slice(1)};
constexpr uint8_t GRAY4_${n} = ${level(h)};
constexpr uint16_t DITHER_${n} = 0x${ditherMask(h).toString(16).padStart(4, "0")};`).join("\n")}

${modes.join("\n\n")}

constexpr uint8_t BAYER_4X4[16] = {${BAYER4.join(", ")}};

constexpr uint16_t BAYER_PATTERN[17] = {
${Array.from({ length: 17 }, (_, n) => "    0x" + mask(n).toString(16).padStart(4, "0")).join(",\n")}};

inline bool ditherInk(uint16_t pattern, int x, int y) { return (pattern >> (((y & 3) << 2) | (x & 3))) & 1; }

${t.group("space").map(([k, v]) => `constexpr int SPACE_${k} = ${px(v)};`).join("\n")}
constexpr int BORDER_WIDTH = ${px(t.get("border.width"))};
constexpr int RADIUS_SM = ${px(t.get("radius.sm"))};

}
`);
}
