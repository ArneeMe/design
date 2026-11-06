import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const exts = new Set([".css", ".html", ".js", ".jsx", ".ts", ".tsx", ".svelte", ".vue", ".svg", ".md"]);
const skip = new Set(["node_modules", ".git", "dist"]);

const hue = h => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (d === 0) return [0, 0];
  const s = d / (1 - Math.abs(max + min - 1));
  const h6 = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h6 * 60 + 360) % 360, s];
};

const style = [
  [/(linear|radial|conic)-gradient\(/i, "gradient"],
  [/box-shadow:(?!\s*none)/i, "shadow"],
  [/text-shadow:(?!\s*none)/i, "text shadow"],
  [/drop-shadow\(/i, "shadow"],
  [/backdrop-filter|blur\(/i, "blur or glass"],
  [/border-radius:(?!\s*(0|var\(--radius))\s*([3-9]|\d{2,})/i, "radius over 2px"],
  [/\brounded-(md|lg|xl|2xl|3xl|full)\b/, "radius over 2px"],
  [/border-left:(?!\s*(0|none))/i, "coloured left border"],
  [/text-transform:\s*uppercase/i, "uppercase label"],
  [/\b(bg|from|to|via|text)-(indigo|violet|purple|fuchsia|cyan|sky|teal)-\d{2,3}\b/, "Tailwind purple or cyan"],
];
const words = /\b(seamless(ly)?|effortless(ly)?|unlock|supercharge|elevate|empower|revolutioni[sz]e|next-level|delve|sømløs|sømløst|uanstrengt)\b/i;
const emoji = /\p{Extended_Pictographic}/u;

function files(path) {
  if (statSync(path).isFile()) return [path];
  return readdirSync(path).filter(n => !skip.has(n)).flatMap(n => files(join(path, n)));
}

export function check(paths) {
  const found = [];
  for (const file of paths.flatMap(files).filter(f => exts.has(extname(f)))) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      const at = what => found.push(`${file}:${i + 1}: ${what}`);
      if (extname(file) !== ".md") for (const [re, what] of style) if (re.test(line)) at(what);
      if (words.test(line) && !/(no-ai-look|SKILL)\.md$/.test(file)) at(`marketing word "${line.match(words)[0]}"`);
      if (emoji.test(line)) at("emoji");
      for (const h of line.match(/#[0-9a-f]{6}\b/gi) ?? []) {
        const [deg, sat] = hue(h);
        if (sat > 0.3 && deg >= 170 && deg <= 300) at(`blue, cyan or purple colour ${h}`);
      }
    });
  }
  return found;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const found = check(process.argv.slice(2).length ? process.argv.slice(2) : ["."]);
  if (found.length) { console.error(found.join("\n")); process.exit(1); }
  console.log("no AI look found");
}
