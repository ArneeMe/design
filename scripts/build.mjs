import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { loadThemes } from "./lib/theme.mjs";
import { runChecks } from "./lib/checks.mjs";
import { check } from "./check-ai-look.mjs";
import web from "../surfaces/web.mjs";
import icons from "../surfaces/icons.mjs";

const root = new URL("../", import.meta.url);
const out = new URL("build/", root);
const themes = await loadThemes();

const failed = themes.flatMap(runChecks);
if (failed.length) { console.error("Check failed:\n" + failed.join("\n")); process.exit(1); }

const writer = dir => (path, data) => {
  const url = new URL(`${dir}/${path}`, out);
  mkdirSync(new URL("./", url), { recursive: true });
  writeFileSync(url, data);
};

rmSync(out, { recursive: true, force: true });
web(themes.filter(t => t.surfaces.includes("web")), writer("web"));
icons(writer("icons"));
for (const t of themes) {
  t.art.files?.(t, writer(t.id));
  for (const s of t.surfaces.filter(s => s !== "web")) {
    const { default: surface } = await import(new URL(`surfaces/${s}.mjs`, root));
    surface(t, writer(`${t.id}/${s}`));
  }
}

const look = check(["preview", "web", "build", "skill", "README.md", "AGENTS.md"].map(p => new URL(p, root).pathname));
if (look.length) { console.error("AI look found:\n" + look.join("\n")); process.exit(1); }

console.log(`build ok: ${themes.map(t => t.id).join(", ")}`);
