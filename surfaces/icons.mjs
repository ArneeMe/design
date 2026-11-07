import { readFileSync, readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const SIZE = 24;

function polygons(d) {
  const polys = [];
  let poly = null, x = 0, y = 0;
  for (const [, cmd, args] of d.matchAll(/([MmHhVvLlZz])([^MmHhVvLlZz]*)/g)) {
    const n = (args.match(/-?\d*\.?\d+/g) ?? []).map(Number);
    const rel = cmd === cmd.toLowerCase();
    switch (cmd.toUpperCase()) {
      case "M":
        for (let i = 0; i < n.length; i += 2) {
          x = rel ? x + n[i] : n[i]; y = rel ? y + n[i + 1] : n[i + 1];
          if (i === 0) polys.push(poly = [[x, y]]); else poly.push([x, y]);
        }
        break;
      case "L": for (let i = 0; i < n.length; i += 2) { x = rel ? x + n[i] : n[i]; y = rel ? y + n[i + 1] : n[i + 1]; poly.push([x, y]); } break;
      case "H": for (const v of n) { x = rel ? x + v : v; poly.push([x, y]); } break;
      case "V": for (const v of n) { y = rel ? y + v : v; poly.push([x, y]); } break;
      case "Z": [x, y] = poly[0]; break;
    }
  }
  return polys;
}

function raster(d) {
  const polys = polygons(d);
  return Array.from({ length: SIZE }, (_, py) => Array.from({ length: SIZE }, (_, px) => {
    const cx = px + 0.5, cy = py + 0.5;
    let wind = 0;
    for (const p of polys)
      for (let i = 0; i < p.length; i++) {
        const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length];
        if ((y1 <= cy) !== (y2 <= cy) && cx < x1 + (cy - y1) / (y2 - y1) * (x2 - x1)) wind += y2 > y1 ? 1 : -1;
      }
    return wind !== 0;
  }));
}

export function loadIcons() {
  const dir = new URL("assets/icons/", root);
  const drawn = new URL("drawn/", dir);
  const list = [
    ...readdirSync(dir).filter(f => f.endsWith(".svg")).map(f => ({
      name: f.slice(0, -4),
      d: [...readFileSync(new URL(f, dir), "utf8").matchAll(/ d="([^"]+)"/g)].map(m => m[1]).join(""),
    })),
    ...readdirSync(drawn).filter(f => f.endsWith(".txt")).map(f => ({
      name: f.slice(0, -4),
      d: readFileSync(new URL(f, drawn), "utf8").trim().split("\n").flatMap((row, y) => [...row].map((c, x) => c === "#" ? `M${x * 2} ${y * 2}h2v2h-2z` : "")).join(""),
    })),
  ].sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

export default function icons(write) {
  const list = loadIcons();
  const ident = n => n.replace(/-/g, "_");

  for (const { name, d } of list) {
    write(`svg/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" fill="currentColor" shape-rendering="crispEdges"><path d="${d}"/></svg>\n`);
    write(`android/drawable/ic_${ident(name)}.xml`, `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="${SIZE}dp"
    android:height="${SIZE}dp"
    android:viewportWidth="${SIZE}"
    android:viewportHeight="${SIZE}"
    android:tint="?android:attr/textColorPrimary">
    <path
        android:fillColor="@android:color/white"
        android:pathData="${d}" />
</vector>
`);
  }
  write("sprite.svg", `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
${list.map(({ name, d }) => `<symbol id="${name}" viewBox="0 0 ${SIZE} ${SIZE}"><path d="${d}"/></symbol>`).join("\n")}
</svg>
`);

  const bytes = d => raster(d).flatMap(row => Array.from({ length: SIZE / 8 }, (_, b) => row.slice(b * 8, b * 8 + 8).reduce((v, ink, i) => ink ? v : v | (0x80 >> i), 0)));
  write("waddleos/WaddleIcons.h", `#pragma once

#include <stdint.h>

namespace WaddleIcons {

constexpr int SIZE = ${SIZE};
constexpr int BYTES_PER_ROW = ${SIZE / 8};

${list.map(({ name, d }) => `constexpr uint8_t ${ident(name).toUpperCase()}[${SIZE * SIZE / 8}] = {${bytes(d).map(b => "0x" + b.toString(16).toUpperCase().padStart(2, "0")).join(", ")}};`).join("\n")}

}
`);
  return list;
}
