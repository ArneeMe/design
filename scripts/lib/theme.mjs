import { readFileSync, readdirSync, existsSync } from "node:fs";

const root = new URL("../../", import.meta.url);
const read = url => JSON.parse(readFileSync(url));

const merge = (a, b) => {
  const out = { ...a };
  for (const [k, v] of Object.entries(b)) out[k] = v && typeof v === "object" && !Array.isArray(v) && !("$value" in v) && a[k] ? merge(a[k], v) : v;
  return out;
};

export async function loadThemes() {
  const base = read(new URL("tokens/base.json", root));
  const ids = readdirSync(new URL("themes/", root)).filter(id => existsSync(new URL(`themes/${id}/tokens.json`, root))).sort();
  return Promise.all(ids.map(async id => {
    const tokens = merge(base, read(new URL(`themes/${id}/tokens.json`, root)));
    const flat = {};
    (function walk(node, path) {
      if ("$value" in node) return void (flat[path.join(".")] = node.$value);
      for (const [k, v] of Object.entries(node)) if (!k.startsWith("$")) walk(v, [...path, k]);
    })(tokens, []);
    const resolve = v => typeof v === "string" && v.startsWith("{") ? resolve(flat[v.slice(1, -1)]) : v;
    const get = path => resolve(flat[path]);
    const group = prefix => Object.keys(flat).filter(k => k.startsWith(prefix + ".")).map(k => [k.slice(prefix.length + 1), get(k)]);
    const meta = tokens.$extensions["design.arne"];
    const modes = Object.keys(tokens.mode).filter(k => !k.startsWith("$"));
    const artUrl = new URL(`themes/${id}/art.mjs`, root);
    return {
      id,
      name: meta.name,
      surfaces: meta.surfaces,
      checks: meta.checks ?? ["wcag"],
      modes,
      darkest: modes.includes("dark") ? "dark" : modes[0],
      flat,
      get,
      group,
      mode: m => Object.fromEntries(group(`mode.${m}`)),
      art: existsSync(artUrl) ? await import(artUrl) : {},
    };
  }));
}
