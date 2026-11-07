import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const constName = k => k.replace(/[.-]/g, "_").toUpperCase();
const argb = h => `0xFF${h.slice(1).toUpperCase()}.toInt()`;
const num = v => parseFloat(v);

export default function appAndroid(t, write) {
  const name = t.name;
  const modes = t.modes.map(m => `    object ${m[0].toUpperCase() + m.slice(1)} {
${Object.entries(t.mode(m)).map(([k, h]) => `        const val ${constName(k)} = ${argb(h)}`).join("\n")}
    }`).join("\n\n");
  write(`java/me/arnee/design/${name}Tokens.kt`, `package me.arnee.design

object ${name}Tokens {
${modes}

${t.group("space").map(([k, v]) => `    const val SPACE_${k} = ${num(v)}`).join("\n")}

${t.group("font.size").map(([k, v]) => `    const val TEXT_${constName(k)} = ${num(v)}f`).join("\n")}
${t.group("font.weight").map(([k, v]) => `    const val WEIGHT_${constName(k)} = ${v}`).join("\n")}

${t.group("radius").map(([k, v]) => `    const val RADIUS_${constName(k)} = ${num(v)}`).join("\n")}
    const val BORDER_WIDTH = ${num(t.get("border.width"))}

${t.group("motion.duration").map(([k, v]) => `    const val MOTION_${constName(k)} = ${num(v)}L`).join("\n")}
}
`);

  const colors = m => `<?xml version="1.0" encoding="utf-8"?>
<resources>
${Object.entries(t.mode(m)).map(([k, h]) => `    <color name="${t.id}_${k.replace(/-/g, "_")}">${h}</color>`).join("\n")}
</resources>
`;
  const light = t.modes.includes("light") ? "light" : t.modes[0];
  write("res/values/design_colors.xml", colors(light));
  if (t.modes.includes("dark") && light !== "dark") write("res/values-night/design_colors.xml", colors("dark"));
  write("res/values/design_dimens.xml", `<?xml version="1.0" encoding="utf-8"?>
<resources>
${t.group("space").map(([k, v]) => `    <dimen name="${t.id}_space_${k}">${num(v)}dp</dimen>`).join("\n")}
${t.group("font.size").map(([k, v]) => `    <dimen name="${t.id}_text_${k}">${num(v)}sp</dimen>`).join("\n")}
${t.group("radius").map(([k, v]) => `    <dimen name="${t.id}_radius_${k}">${num(v)}dp</dimen>`).join("\n")}
    <dimen name="${t.id}_border_width">${num(t.get("border.width"))}dp</dimen>
</resources>
`);
  write(`res/font/${t.id}_mono.ttf`, readFileSync(new URL("assets/fonts/jetbrains-mono/ttf/JetBrainsMono-Regular.ttf", root)));
}
