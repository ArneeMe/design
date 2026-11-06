import { Canvas, dither, mix } from "./canvas.mjs";
import { drawPenguin, width as pw, height as ph } from "./penguin.mjs";

const W = 320, H = 180, SCALE = 6, SHELF = 118, PX = 214;

const shelfTop = x => SHELF + Math.round(2 * Math.sin(x / 23) + Math.sin(x / 7));

function gradient(c, x, y, a, b, t) {
  c.set(x, y, dither(x, y, Math.min(1, Math.max(0, t))) ? b : a);
}

export function wallpaper(g, accent, scene) {
  const c = new Canvas(W, H);
  const s = {
    morning: { top: g[2], horizon: mix(g[3], accent, 0.45), ice: g[6], face: g[4], deep: g[3], sea: g[1], glint: mix(g[2], accent, 0.5), ink: g[0], paper: g[9] },
    evening: { top: g[1], horizon: g[4], ice: g[5], face: g[3], deep: g[2], sea: g[1], glint: mix(g[1], accent, 0.35), ink: g[0], paper: g[8] },
    night: { top: g[0], horizon: g[3], ice: g[4], face: g[2], deep: g[1], sea: g[0], glint: g[2], ink: g[0], paper: g[7] },
  }[scene];

  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const top = shelfTop(x);
      if (y < top) {
        const t = (y / top) ** 1.6;
        gradient(c, x, y, t < 0.5 ? s.top : mix(s.top, s.horizon, 0.5), t < 0.5 ? mix(s.top, s.horizon, 0.5) : s.horizon, t < 0.5 ? t * 2 : t * 2 - 1);
      } else if (y < top + 3) c.set(x, y, s.ice);
      else if (y < top + 22) gradient(c, x, y, s.face, s.deep, (y - top - 3) / 19);
      else c.set(x, y, (y % 6 === 0 && (x * 7 + y * 13) % 29 < 6) ? s.glint : s.sea);
    }

  if (scene === "morning") disc(c, 72, SHELF - 30, 9, g[8], s.horizon);
  if (scene === "evening") for (let x = 0; x < W; x++) for (let y = SHELF - 14; y < SHELF; y++) if (y < shelfTop(x) && dither(x, y, (y - SHELF + 14) / 14 * 0.6)) c.set(x, y, mix(s.horizon, accent, 0.4));
  if (scene === "night") {
    for (let i = 0; i < 70; i++) {
      const x = (i * 97 + 31) % W, y = (i * 53 + 7) % (SHELF - 40);
      c.set(x, y, i % 5 ? g[5] : g[7]);
    }
    disc(c, 250, 34, 7, g[6], s.top);
    disc(c, 253, 32, 6, s.top, s.top);
  }

  const py = Math.min(...Array.from({ length: pw }, (_, i) => shelfTop(PX + i))) - ph + 1;
  drawPenguin(c, PX, py, 1, s);
  return c.scaled(SCALE);
}

function disc(c, cx, cy, r, color, halo) {
  for (let y = cy - r - 3; y <= cy + r + 3; y++)
    for (let x = cx - r - 3; x <= cx + r + 3; x++) {
      const d = Math.hypot(x - cx, y - cy);
      if (d <= r) c.set(x, y, color);
      else if (halo !== color && d <= r + 3 && dither(x, y, 0.5 - (d - r) / 6)) c.set(x, y, mix(color, halo, 0.5));
    }
}
