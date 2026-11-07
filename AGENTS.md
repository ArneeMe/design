# AGENTS.md

This repo is Arne's design system. Follow the `arnes-stil` skill for code, git and prose. Follow `skill/design-arne/SKILL.md` for how things look.

## Layout

- `tokens/base.json`: type, space, radius, border and motion, shared by every theme. W3C DTCG format.
- `themes/<theme>/tokens.json`: a theme's colours and modes, overrides of base, and the surfaces and checks it wants.
- `themes/<theme>/art.mjs`: optional images for a theme. Waddle has the penguin (`penguin.txt`) and wallpapers.
- `surfaces/<surface>.mjs`: turns a theme into files for one surface. `web.mjs` handles all themes at once.
- `web/base.css`: styles for plain HTML, the same for every theme.
- `assets/icons/`: pixel icons from pixelarticons. `surfaces/icons.mjs` builds them to `build/icons/` for every platform.
- `docs/apps.md`: how to build an app on top of the design system.
- `assets/icon-pack.json`: which icon each app on Arne's phone gets. `surfaces/iconpack.mjs` builds an Android icon pack from it. `assets/icon-colors.json` has each app's own colour for the pack in colour, `surfaces/iconpack-farge.mjs`.
- `assets/fonts/`: fonts as woff2 for the web and TTF for Termux, with `font.json` and the licence.
- `scripts/build.mjs`: the build. `scripts/lib/` has the theme loader, checks, canvas and PNG encoder. Node only, no dependencies.
- `build/`: generated output. Committed. Never edit by hand.
- `preview/index.html`: preview of every theme from `build/`, with dark, light, e-ink and red filter views.
- `scripts/install.sh`, `scripts/sync-waddleos.sh`, `scripts/android.sh`, `scripts/sync-app.sh`, `scripts/iconpack.sh`: hook this machine, WaddleOS, the phone and Android apps up to `build/`.

## Rules

- Change tokens, a theme, a surface or a script, then run `node scripts/build.mjs` and commit `build/` with it.
- Never add npm dependencies, CDNs, remote fonts or network calls.
- Read `docs/no-ai-look.md` before changing how anything looks. The build fails on what it lists.
- Never draw the penguin or other figures by hand. The penguin comes from `themes/waddle/penguin.txt`.
- Icons come from pixelarticons. Only when one is missing, draw it in `assets/icons/drawn/<name>.txt` on a 12x12 grid, where each cell becomes 2x2 pixels, and look at it next to the set before you keep it.
- Surfaces use semantic names only, never one theme's raw colours, so they work for every theme.
- Keep `build/` byte-stable: the same input must give the same output.
- When `build/` changes, bump `version` in `package.json` and tag the merge on `main` as `vX.Y.Z`. See Versions in the README.

## Check

- `node scripts/build.mjs` must pass. It fails on WCAG AA contrast.
- Open `preview/index.html` and look at dark and light.
- Look at new images. A screenshot with Playwright is enough.
