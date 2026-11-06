# design

Arne's design system. One source of truth for colours, type, the penguin and AI rules across web, CleanYourTV, WaddleOS, Hyprland and Waybar.

## Build

```bash
node scripts/build.mjs
```

Needs Node 18 or newer. No dependencies. `preview/index.html` shows the result, with dark, light, e-ink and red filter views. The build checks WCAG AA contrast and stops if a theme pair fails.

## Output

| Folder | What |
|---|---|
| `build/web` | `tokens.css`, `fonts.css`, fonts and a Tailwind preset |
| `build/penguin` | Penguin SVG and PNG from 16 to 512 px, `favicon.svg`, `favicon.ico` |
| `build/cleanyourtv/waddle` | Launcher theme with morning, evening and night wallpapers |
| `build/waddleos` | `WaddleTokens.h` with four-level greys and 4x4 Bayer patterns |
| `build/hyprland` | `waddle.conf`, to `source` from `hyprland.conf` |
| `build/waybar` | `style.css` and `colors.css` |

## Use it

Clone once to `~/src/design`. Desktop and TV follow `main`. Apps pin a version tag.

**This machine.** Links the AI skill into `~/.claude/skills` and adds the Hyprland theme to `hyprland.conf`. It prints the Waybar line to add.

```bash
~/src/design/scripts/install.sh
```

**Hyprland and Waybar.** Pull and reload.

```bash
git -C ~/src/design pull && hyprctl reload && pkill -SIGUSR2 waybar
```

**TV.** Push the theme with CleanYourTV's script.

```bash
TV_HOST=192.168.1.50 ~/src/cleanyourtv/tools/theme.sh ~/src/design/build/cleanyourtv/waddle
```

**WaddleOS.** Copy the header into the firmware and commit it there. The firmware builds offline, so it gets a copy, not a submodule.

```bash
~/src/design/scripts/sync-waddleos.sh ~/src/waddleos
```

**Websites.** Add the repo as a git dependency at a tag. No CDN.

```bash
npm install github:arneeme/design#v1.0.0
```

```css
@import "@arneeme/design/fonts.css";
@import "@arneeme/design/tokens.css";
```

For Tailwind, `import preset from "@arneeme/design/tailwind-preset"` and add `presets: [preset]`. For a plain static site, copy `build/web` into the site.

**New app repos.** Add this line to the repo's `AGENTS.md` or `CLAUDE.md`:

```
Follow the design-arne skill (github.com/arneeme/design) for colours, type, the penguin and UI text.
```

## Versions

`package.json` holds the version and `main` is tagged `vX.Y.Z`. Bump the patch for fixes, the minor for new tokens or platforms, and the major when a token is renamed or removed.

## Add a platform

1. Add a section to `scripts/build.mjs` that reads tokens with `get()` or `group()` and writes to `build/<platform>/`.
2. Use the semantic theme names, not raw greys.
3. Run the build and commit the output.
4. Add a line to the table above and to `skill/design-arne/SKILL.md`.

## No AI look

`docs/no-ai-look.md` lists what makes a design look AI-made and what this repo uses instead. `scripts/check-ai-look.mjs` catches the common tells, and the build runs it. Run it on other apps with `node ~/src/design/scripts/check-ai-look.mjs src`.

## AI rules

`skill/design-arne/SKILL.md` is a skill for Claude Code and other agents. `AGENTS.md` covers work in this repo.

## Licence

MIT, including the penguin. JetBrains Mono is under the SIL Open Font License. See `CREDITS.md`.
