# design

Arne's design system. One source of truth for colours, type, the penguin and AI rules across web, CleanYourTV, WaddleOS, Hyprland and Waybar.

## Build

```bash
node scripts/build.mjs
```

Needs Node 18 or newer. No dependencies. The build checks WCAG AA contrast and stops if a theme pair fails.

## Output

| Folder | What |
|---|---|
| `build/web` | `tokens.css`, `fonts.css`, fonts and a Tailwind preset |
| `build/penguin` | Penguin SVG and PNG from 16 to 512 px, `favicon.svg`, `favicon.ico` |
| `build/cleanyourtv/waddle` | Launcher theme with morning, evening and night wallpapers |
| `build/waddleos` | `WaddleTokens.h` with four-level greys and 4x4 Bayer patterns |
| `build/hyprland` | `waddle.conf`, to `source` from `hyprland.conf` |
| `build/waybar` | `style.css` and `colors.css` |

## Add a platform

1. Add a section to `scripts/build.mjs` that reads tokens with `get()` or `group()` and writes to `build/<platform>/`.
2. Use the semantic theme names, not raw greys.
3. Run the build and commit the output.
4. Add a line to the table above and to `skill/design-arne/SKILL.md`.

## AI rules

`skill/design-arne/SKILL.md` is a skill for Claude Code and other agents. `AGENTS.md` covers work in this repo.

## Licence

MIT, including the penguin. JetBrains Mono is under the SIL Open Font License. See `CREDITS.md`.
