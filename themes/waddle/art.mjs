import { Canvas } from "../../scripts/lib/canvas.mjs";
import { encodePng, encodeIco } from "../../scripts/lib/png.mjs";
import { drawPenguin, penguinSvg, SIZE, width as pw, height as ph } from "./penguin.mjs";
import { wallpaper as draw } from "./wallpapers.mjs";

const png = c => encodePng(c.w, c.h, c.data);

export const wallpapers = [
  { file: "01-morgen.png", scene: "morning", caption: "Morgen på isbreen" },
  { file: "02-kveld.png", scene: "evening", caption: "Kveld på isbreen" },
  { file: "03-natt.png", scene: "night", caption: "Natt på isbreen" },
];

const places = { tv: [96, 320, 180], desktop: [118, 320, 180], phone: [260, 186, 414] };

export const wallpaper = (t, scene, scale, place = "tv") => png(draw(Array.from({ length: 10 }, (_, i) => t.get(`color.grey.${i}`)), t.get("color.nebb.dark"), scene, scale, ...places[place]));

export function files(t, write) {
  const dark = t.mode("dark"), light = t.mode("light");
  const ink = { ink: dark["penguin-ink"], paper: dark["penguin-paper"] };
  const icon = (size, plate) => {
    if (size < SIZE) return icon(size * 2, plate).halved();
    const s = Math.floor(size / SIZE), c = new Canvas(size, size);
    if (plate) c.rect(0, 0, size, size, plate);
    drawPenguin(c, Math.floor((size - pw * s) / 2), Math.floor((size - ph * s) / 2), s, ink);
    return c;
  };
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
}
