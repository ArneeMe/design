# AGENTS.md

This repo is Arne's design system. Follow the `arnes-stil` skill for code, git and prose. Follow `skill/design-arne/SKILL.md` for how things look.

## Layout

- `tokens.json`: the only source of colours, type, space, radius, border and motion. W3C DTCG format.
- `assets/src/penguin.txt`: the 30x30 penguin grid. `#` black, `:` dithered grey, `.` white, space transparent.
- `assets/fonts/`: JetBrains Mono woff2 and its licence.
- `scripts/build.mjs`: the build. Node only, no dependencies.
- `scripts/png.mjs`, `canvas.mjs`, `penguin.mjs`, `wallpapers.mjs`: helpers for the build.
- `build/`: generated output. Committed. Never edit by hand.
- `preview/index.html`: preview built from `build/`, with dark, light, e-ink and red filter views.
- `scripts/install.sh`, `scripts/sync-waddleos.sh`: hook this machine and WaddleOS up to `build/`.

## Rules

- Change `tokens.json` or a script, then run `node scripts/build.mjs` and commit `build/` with it.
- Never add npm dependencies, CDNs, remote fonts or network calls.
- Never draw the penguin by hand. Change `penguin.txt` and rebuild.
- Keep `build/` byte-stable: the same input must give the same output.
- When `build/` changes, bump `version` in `package.json` and tag the merge on `main` as `vX.Y.Z`. See Versions in the README.

## Check

- `node scripts/build.mjs` must pass. It fails on WCAG AA contrast.
- Open `preview/index.html` and look at dark and light.
- Look at new images. A screenshot with Playwright is enough.
