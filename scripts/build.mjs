import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from "node:fs";

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
if (failed.length) { console.error("WCAG AA failed:\n" + failed.join("\n")); process.exit(1); }

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
      isbre: vars("color.isbre"),
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

console.log("build/web ok");
