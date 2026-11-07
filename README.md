# design

Arne's design system. One source of truth for colours, type, art and AI rules, built for every screen he uses: websites, the WaddleOS e-reader, the TV, Hyprland, Waybar and kitty.

## How it fits together

A **theme** is a look: colours, light and dark modes, and its own art. A **surface** is a place the look goes: a web page, the e-reader, the TV. The build makes every theme for every surface it asks for.

```
tokens/base.json        type, space, radius, border, motion. Shared by all themes
themes/<theme>/         one folder per theme
  tokens.json           colours, modes, overrides of base, and which surfaces and checks it wants
  art.mjs               optional: images, like the penguin and wallpapers
surfaces/<surface>.mjs  turns any theme into files for one surface
web/base.css            styles for plain HTML elements, the same for every theme
build/web/              CSS for all themes, fonts and a Tailwind preset
build/<theme>/          everything else for that theme, one folder per surface
assets/icons/           pixel icons from pixelarticons, built to build/icons/ for web, Android and WaddleOS
```

Only `waddle` exists today. A theme does not need every surface, its own art or a dark mode.

## Build

```bash
node scripts/build.mjs
```

Needs Node 18 or newer. No dependencies. The build stops if a theme fails its checks: WCAG AA contrast, the red night filter, e-ink greys, or the AI look check. `preview/index.html` shows every theme with dark, light, e-ink and red filter views.

## Web pages

There are no components to install. `base.css` styles plain HTML: text, links, buttons, inputs, tables, dialogs. A page written with normal elements looks right in any theme, in plain HTML, React or anything else. A handful of classes cover the rest: `primary`, `muted`, `box`, `row`, `stack` and `pixel`.

One theme, one file:

```html
<link rel="stylesheet" href="design/web/waddle.css">
```

Several themes, chosen on the page:

```html
<link rel="stylesheet" href="design/web/all.css">
<html data-theme="waddle" data-mode="dark">
```

`data-mode` is optional. Without it, the page follows the system setting. Use the CSS variables for anything you style yourself: `var(--accent)`, `var(--space-4)`.

## Apps and icons

`docs/apps.md` explains how to start an Android app, a web page or a WaddleOS screen: the Kotlin tokens and UI helpers, the icons, the phone's icon pack and a checklist.

## Use it

Clone once to `~/Code/design`. Desktop and TV follow `main`. Apps pin a version tag.

**Omarchy.** The install script sees Omarchy and does it Omarchy's way. It links `build/<theme>/omarchy` into `~/.config/omarchy/themes/` and runs `omarchy-theme-set`. Omarchy then colours Hyprland, the bar, the terminal, the lock screen and the rest from the theme's `colors.toml`. Your keybinds, monitors and `looknfeel.lua` stay yours. Later you can pick the theme in Omarchy's theme menu like any other. After a pull, run `omarchy-theme-set <theme>` again. `omarchy-theme-refresh` skips the wallpaper.

**Android.** With the phone on USB and USB debugging on, this puts the wallpapers in `Pictures/<theme>`, sets the system colour and dark mode, and copies Termux's colours and font to `Download/<theme>-termux`. It then prints one command to run in Termux, which puts them in place and keeps the old files as `<file>.for-design`. No root needed. With the Termux:API app from F-Droid and `pkg install termux-api`, it also switches the home and lock screen wallpaper by time of day: morning from 06, afternoon from 12, evening from 19 and night from 23. The times live in `themes/waddle/art.mjs`. Pick the wallpaper yourself in the gallery. Phones and their sizes are listed in `surfaces/android.mjs`.

```bash
~/Code/design/scripts/android.sh
```

**Android apps.** Copies the theme, the UI helpers and the icons into an app module. See `docs/apps.md`. Commit the copied files in the app.

```bash
~/Code/design/scripts/sync-app.sh ~/Code/waddleOS/phone/app
```

**Other Hyprland setups.** Links the AI skill into `~/.claude/skills`, adds the Hyprland theme to `hyprland.conf` and the kitty theme to `kitty.conf`, and writes `hyprpaper.conf` with the night wallpaper if you have none. It prints the Waybar line to add. Start hyprpaper with `exec-once = hyprpaper` in `hyprland.conf` if you do not already.

```bash
~/Code/design/scripts/install.sh
```

Pass a theme name to use another theme: `install.sh <theme>`. It swaps the old lines for the new ones. Before the first change it copies each file to `<file>.for-design`.

It only adds one line at the end of `hyprland.conf` and `kitty.conf`. Keybinds, monitors, autostart, window rules, input and kitty shortcuts stay yours. The theme overrides only what it sets: colours, borders, gaps, rounding, blur, shadows and animations in Hyprland, and colours, font, cursor, padding and tab bar in kitty. Waybar's `config.jsonc` with your modules is never touched.

**Hyprland, Waybar and kitty.** Pull and reload.

```bash
git -C ~/Code/design pull && hyprctl reload && pkill -SIGUSR2 waybar && pkill -SIGUSR1 kitty
```

**TV.** Push the theme with CleanYourTV's script.

```bash
TV_HOST=192.168.1.50 ~/src/cleanyourtv/tools/theme.sh ~/Code/design/build/waddle/cleanyourtv
```

**WaddleOS.** Copy the token and icon headers into the firmware and commit it there. The firmware builds offline, so it gets a copy, not a submodule.

```bash
~/Code/design/scripts/sync-waddleos.sh ~/src/waddleos
```

**Websites.** Add the repo as a git dependency at a tag. No CDN.

```bash
npm install github:arneeme/design#v2.7.0
```

```css
@import "@arneeme/design/waddle.css";
```

For Tailwind, `import preset from "@arneeme/design/tailwind-preset"` and add `presets: [preset]`. For a plain static site, copy `build/web` into the site. Theme art lives in `build/<theme>/`, for example `@arneeme/design/waddle/penguin/favicon.svg`.

**New app repos.** Add this line to the repo's `AGENTS.md` or `CLAUDE.md`:

```
Follow the design-arne skill (github.com/arneeme/design) for colours, type, the penguin and UI text.
```

## Versions

`package.json` holds the version and `main` is tagged `vX.Y.Z`. Bump the patch for fixes, the minor for new tokens or platforms, and the major when a token is renamed or removed.

## Add a theme

1. Make `themes/<name>/tokens.json`. Copy `themes/waddle/tokens.json` and change it.
2. Set `name`, `surfaces` and `checks` under `$extensions.design.arne`.
3. Give every mode the same names: `bg`, `surface`, `border`, `text`, `muted`, `accent`, `on-accent`. Add `color.ansi` if the theme has a kitty surface.
4. Override anything from `tokens/base.json` by repeating it, for example `radius`.
5. Add `art.mjs` only if the theme has its own images. See `themes/waddle/art.mjs`.
6. Run the build and look at the preview.

## Add a surface

1. Make `surfaces/<name>.mjs` with a default export `(theme, write)`. Read values with `theme.get()`, `theme.group()` and `theme.mode()`. Write files with `write(path, data)`. They land in `build/<theme>/<name>/`.
2. Use the semantic names, never one theme's raw colours.
3. Add the surface to the themes that want it.
4. Add a line to the README and to `skill/design-arne/SKILL.md`.

## No AI look

`docs/no-ai-look.md` lists what makes a design look AI-made and what this repo uses instead. `scripts/check-ai-look.mjs` catches the common tells, and the build runs it. Run it on other apps with `node ~/Code/design/scripts/check-ai-look.mjs src`.

## AI rules

`skill/design-arne/SKILL.md` is a skill for Claude Code and other agents. `AGENTS.md` covers work in this repo.

## Licence

MIT, including the penguin. JetBrains Mono is under the SIL Open Font License. See `CREDITS.md`.
