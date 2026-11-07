const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const lum = h => [1, 3, 5].map(i => lin(parseInt(h.slice(i, i + 2), 16) / 255)).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const redOnly = h => "#" + h.slice(1, 3) + "0000";
const gray4 = h => Math.round([1, 3, 5].reduce((s, i, k) => s + parseInt(h.slice(i, i + 2), 16) * [0.2126, 0.7152, 0.0722][k], 0) / 85);

const checks = {
  wcag(t) {
    const pairs = [["text", "bg"], ["text", "surface"], ["muted", "bg"], ["muted", "surface"], ["accent", "bg"], ["accent", "surface"], ["on-accent", "accent"]];
    return t.modes.flatMap(m => pairs.map(([fg, bg]) => [m, fg, bg, ratio(t.mode(m)[fg], t.mode(m)[bg])]))
      .filter(([, , , r]) => r < 4.5).map(([m, fg, bg, r]) => `${m}: ${fg} on ${bg} is ${r.toFixed(2)}`);
  },
  "red-filter"(t) {
    const mode = t.mode(t.darkest);
    return [["text", "bg"], ["text", "surface"], ["accent", "bg"], ["on-accent", "accent"]]
      .map(([fg, bg]) => [fg, bg, ratio(redOnly(mode[fg]), redOnly(mode[bg]))])
      .filter(([, , r]) => r < 3).map(([fg, bg, r]) => `red filter: ${fg} on ${bg} is ${r.toFixed(2)}`);
  },
  "e-ink"(t) {
    const mode = t.mode(t.modes.includes("light") ? "light" : t.modes[0]);
    return ["border", "text", "muted", "accent"].flatMap(fg => ["bg", "surface"].filter(bg => gray4(mode[fg]) === gray4(mode[bg])).map(bg => `e-ink: ${fg} on ${bg} lands on the same grey`));
  },
};

export const runChecks = t => t.checks.flatMap(c => checks[c](t).map(f => `${t.id}: ${f}`));
