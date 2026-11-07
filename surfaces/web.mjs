import { readFileSync, readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const cssName = path => "--" + path.replaceAll(".", "-");
const cssValue = v => Array.isArray(v) ? (typeof v[0] === "number" ? `cubic-bezier(${v.join(", ")})` : v.map(f => f.includes(" ") ? `"${f}"` : f).join(", ")) : v;
const weights = { Regular: 400, Bold: 700 };

function themeCss(t, scope) {
  const at = (sel, body) => `${sel} {\n${body}\n}`;
  const modeVars = m => [["dark", "light"].includes(m) ? `  color-scheme: ${m};` : null, ...Object.entries(t.mode(m)).map(([k, v]) => `  --${k}: ${v};`)].filter(Boolean).join("\n");
  const sel = m => scope === ":root" ? `[data-mode="${m}"]` : `${scope}[data-mode="${m}"]`;
  const [first, ...rest] = t.modes;
  const base = Object.keys(t.flat).filter(k => !k.startsWith("mode.")).map(k => `  ${cssName(k)}: ${cssValue(t.get(k))};`).join("\n");
  const blocks = [at(scope, base), at(`${scope}, ${sel(first)}`, modeVars(first))];
  if (rest.includes("light") && first === "dark")
    blocks.push(`@media (prefers-color-scheme: light) {\n${at(`${scope}:not([data-mode="dark"])`, modeVars("light")).replace(/^/gm, "  ")}\n}`);
  for (const m of rest) blocks.push(at(sel(m), modeVars(m)));
  return blocks.join("\n\n") + "\n";
}

export default function web(themes, write) {
  const fonts = readdirSync(new URL("assets/fonts/", root)).map(dir => {
    const { family } = JSON.parse(readFileSync(new URL(`assets/fonts/${dir}/font.json`, root)));
    const weight = f => weights[f.replace(/.*-|\.woff2/g, "")] ?? 0;
    const files = readdirSync(new URL(`assets/fonts/${dir}/`, root)).sort((a, b) => weight(a) - weight(b) || a.localeCompare(b));
    for (const f of files.filter(f => !f.endsWith(".json"))) write(`fonts/${f}`, readFileSync(new URL(`assets/fonts/${dir}/${f}`, root)));
    return files.filter(f => f.endsWith(".woff2")).map(f => `@font-face {
  font-family: "${family}";
  src: url("fonts/${f}") format("woff2");
  font-weight: ${weight(f)};
  font-display: swap;
}
`).join("\n");
  }).join("\n");
  const base = readFileSync(new URL("web/base.css", root), "utf8");
  write("fonts.css", fonts);
  write("base.css", base);
  const scoped = `:root {\n  --themes: "${themes.map(t => t.id).join(" ")}";\n}\n\n` + themes.map(t => themeCss(t, `[data-theme="${t.id}"]`)).join("\n");
  write("themes.css", scoped);
  write("all.css", [fonts, scoped, base].join("\n"));
  for (const t of themes) {
    write(`themes/${t.id}.css`, themeCss(t, ":root"));
    write(`${t.id}.css`, [fonts, themeCss(t, ":root"), base].join("\n"));
  }

  const t = themes[0];
  const vars = prefix => Object.fromEntries(t.group(prefix).map(([k]) => [k, `var(${cssName(`${prefix}.${k}`)})`]));
  const preset = {
    theme: {
      colors: { transparent: "transparent", current: "currentColor", ...Object.fromEntries(Object.keys(t.mode(t.modes[0])).map(k => [k, `var(--${k})`])) },
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
  write("tailwind-preset.js", `export default ${JSON.stringify(preset, null, 2)};\n`);
}
