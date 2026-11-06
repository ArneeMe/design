---
name: design-arne
description: Arne's design system. Use whenever you build or change UI, themes, icons, wallpapers or UI text for Arne, on web, CleanYourTV, WaddleOS, Hyprland or Waybar. Covers tokens, font, shape, motion, the penguin, UI voice and how to check the result.
---

# Arne's design system

Follow `arnes-stil` for code, git and prose. This skill covers how things look and read.

Source: `github.com/arneeme/design`. Tokens live in `tokens.json`. Generated files live in `build/`.

## Tokens

Use token names, never raw hex or pixel values.

| Platform | File | Example |
|---|---|---|
| Web | `build/web/tokens.css`, `fonts.css` | `var(--accent)`, `var(--space-4)` |
| Tailwind | `build/web/tailwind-preset.js` | `bg-surface text-muted p-4` |
| WaddleOS | `build/waddleos/WaddleTokens.h` | `WaddleTokens::GRAY4_LIGHT_Text` |
| Hyprland | `build/hyprland/waddle.conf` | `$accent` |
| Waybar | `build/waybar/colors.css` | `@accent` |

Use the semantic names in UI: `bg`, `surface`, `border`, `text`, `muted`, `accent`, `on-accent`. The grey scale `g0` to `g9` and `isbre` are for the theme itself, not for components.

If a value you need is missing, add it to `tokens.json` and rebuild. Do not invent one in place.

## Theme

- Dark is the default. Light is for e-ink and paper.
- Support both through `data-theme` or `prefers-color-scheme`. `tokens.css` already does this.
- Accent is "isbre" ice blue. Use it for focus, links and the one thing that matters on a screen. Not for large areas.

## Type

- JetBrains Mono, self-hosted from `build/web/fonts/`. Never load fonts from a CDN.
- Sizes: `sm` 12, `base` 15, `lg` 22, `xl` 32. Weights: 400 and 700. Nothing else.

## Shape and space

- Radius `none` (0) or `sm` (2px). Nothing rounder.
- Borders are 2px, `--border-width`, in `border` colour.
- Spacing steps only: 4, 8, 12, 16, 24, 32, 48 (`space-1` to `space-12`).
- No shadows. Separate things with borders and space.

## Motion

- `fast` 120ms for hover and focus, `base` 200ms for panels and moves.
- Easing `--motion-easing-standard`. No bounce or overshoot.
- Respect `prefers-reduced-motion`.

## Avoid

- Purple-to-blue gradients.
- Glassmorphism, blur and frosted panels.
- Stock illustrations.
- Emoji as decoration.
- Tracking, telemetry, CDNs, remote fonts and network calls.

## The penguin

- Every penguin comes from `assets/src/penguin.txt`. Use the files in `build/penguin/`. Never redraw it or scale it with smoothing.
- Dark mode: `penguin-dark.svg` or `penguin-dark-*.png`, a black penguin on a `penguin-plate` square.
- Light mode: `penguin-light.svg` or `penguin-light-*.png`, black ink on `penguin-paper`.
- Favicon: `favicon.svg` with `favicon.ico` as fallback.
- Scale PNGs by whole numbers and set `image-rendering: pixelated`. SVGs have `crispEdges`.
- One penguin per screen. Give it space. It is a signature, not a mascot that talks.

## UI voice

- Short, plain and a little dry. Say what happens.
- No marketing, no exclamation marks, no "Oops!".
- Labels are verbs or nouns: "Lagre", "Innstillinger". Errors say what went wrong and what to do.
- Match the user's language. Norwegian or English.

## Check your work

- Run `node scripts/build.mjs`. It stops if a theme pair fails WCAG AA (4.5:1).
- Look at it in dark and light.
- For e-ink, view it in greyscale. Text and borders must still read with four grey levels.
- For evening use, check it with a red filter. Shapes must not depend on blue or green alone.
