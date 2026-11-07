import { readFileSync } from "node:fs";

const rows = readFileSync(new URL("./penguin.txt", import.meta.url), "utf8").split("\n").slice(0, 30).map(r => r.padEnd(30));
const filled = rows.flatMap((r, y) => [...r].map((c, x) => c === " " ? null : [x, y])).filter(Boolean);
const [x0, y0] = [Math.min(...filled.map(p => p[0])), Math.min(...filled.map(p => p[1]))];
const [x1, y1] = [Math.max(...filled.map(p => p[0])), Math.max(...filled.map(p => p[1]))];

export const SIZE = 30;
export const width = x1 - x0 + 1;
export const height = y1 - y0 + 1;
export const cells = rows.slice(y0, y1 + 1).map(r => r.slice(x0, x1 + 1));

export function drawPenguin(canvas, ox, oy, scale, { ink, paper }) {
  cells.forEach((row, cy) => [...row].forEach((c, cx) => {
    if (c === " ") return;
    for (let j = 0; j < scale; j++)
      for (let i = 0; i < scale; i++) {
        const x = ox + cx * scale + i, y = oy + cy * scale + j;
        canvas.set(x, y, c === "#" || (c === ":" && (x + y) % 2 === 0) ? ink : paper);
      }
  }));
}

export function penguinSvg({ ink, paper, plate }) {
  const ox = (SIZE - width) / 2, oy = (SIZE - height) / 2;
  const runs = { "#": [], ".": [], ":": [] };
  cells.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const c = row[x];
      let n = 1;
      while (row[x + n] === c) n++;
      if (c !== " ") runs[c].push(`M${(x + ox) * 2} ${(y + oy) * 2}h${n * 2}v2h${-n * 2}z`);
      x += n;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE * 2} ${SIZE * 2}" shape-rendering="crispEdges">
<defs><pattern id="d" width="2" height="2" patternUnits="userSpaceOnUse"><rect width="2" height="2" fill="${paper}"/><path d="M0 0h1v1H0zM1 1h1v1H1z" fill="${ink}"/></pattern></defs>
${plate ? `<rect width="${SIZE * 2}" height="${SIZE * 2}" fill="${plate}"/>\n` : ""}<path fill="${ink}" d="${runs["#"].join("")}"/>
<path fill="${paper}" d="${runs["."].join("")}"/>
<path fill="url(#d)" d="${runs[":"].join("")}"/>
</svg>
`;
}
