---
name: design-arne
description: Arne's design system. Use whenever you build or change UI, themes, icons, wallpapers or UI text for Arne, on web, CleanYourTV, WaddleOS, Hyprland, Waybar or kitty. Covers tokens, font, shape, motion, the penguin, UI voice and how to check the result.
---

# Arne's design system

Follow `arnes-stil` for code, git and prose. This skill covers how things look and read.

Source: `github.com/arneeme/design`, cloned to `~/Code/design`. Shared values live in `tokens/base.json`, each theme in `themes/<theme>/tokens.json`. Generated files live in `build/`.

## Themes and surfaces

A theme is a look. A surface is where it goes. Ask which theme a project uses. If nobody says, use `waddle`.

| Surface | File | Example |
|---|---|---|
| Web, one theme | `build/web/<theme>.css` | `var(--accent)`, `var(--space-4)` |
| Web, many themes | `build/web/all.css` with `data-theme` | `<html data-theme="waddle">` |
| Tailwind | `build/web/tailwind-preset.js` | `bg-surface text-muted p-4` |
| WaddleOS | `build/<theme>/waddleos/<Theme>Tokens.h` | `WaddleTokens::GRAY4_LIGHT_Text` |
| Hyprland | `build/<theme>/hyprland/<theme>.conf` | `$accent` |
| Waybar | `build/<theme>/waybar/colors.css` | `@accent` |
| kitty | `build/<theme>/kitty/<theme>.conf` | `color1` to `color15` |
| TV | `build/<theme>/cleanyourtv/` | pushed with CleanYourTV's `theme.sh` |

Use the semantic names: `bg`, `surface`, `border`, `text`, `muted`, `accent`, `on-accent`. Every theme has them, so code written against them works in every theme. A theme's own colours, like `grey-0` or `nebb`, are for the theme itself.

If a value you need is missing, add it to the theme or to `tokens/base.json` and rebuild. Do not invent one in place. A new theme or surface goes in the design repo, never as a local theme in an app. The README says how.

## Web pages

- Write plain, semantic HTML. `base.css` already styles text, links, buttons, inputs, tables and dialogs.
- Do not add React, a component library or a CSS framework for looks. Use the classes `primary`, `muted`, `box`, `row`, `stack` and `pixel`, and CSS variables for the rest.
- If the app already uses React or Tailwind, keep it and use the same CSS and the preset.
- Install with `npm install github:arneeme/design#<tag>` and import `@arneeme/design/<theme>.css`, or copy `build/web`.
- WaddleOS: `scripts/sync-waddleos.sh <waddleos>`. Never edit the copied header there.

## Modes

- Most themes have dark and light. `data-mode="dark"` or `"light"` on any element sets it. Without it, the page follows the system.
- Never hard-code one mode's colours. Test both.

## Theme: waddle

- Dark is the default. Light is for e-ink and paper.
- Greys are neutral, with no blue or cream tint.
- Accent is "nebb", the orange of a penguin beak. Use it for focus, links and the one thing that matters on a screen. Never for large areas or decoration.
- Orange keeps its contrast under the red night filter. Blue and cyan do not, so do not add them.
- The penguin is its signature. See below.

## Type

- JetBrains Mono for every theme so far, self-hosted from `build/web/fonts/`. Never load fonts from a CDN.
- Sizes: `sm` 12, `base` 15, `lg` 22, `xl` 32. Weights: 400 and 700. Nothing else.

## Shape and space

These come from `tokens/base.json` and hold for every theme unless it overrides them.

- Radius `none` (0) or `sm` (2px). Nothing rounder.
- Borders are 2px, `--border-width`, in `border` colour.
- Spacing steps only: 4, 8, 12, 16, 24, 32, 48 (`space-1` to `space-12`).
- No shadows. Separate things with borders and space.

## Motion

- `fast` 120ms for hover and focus, `base` 200ms for panels and moves.
- Easing `--motion-easing-standard`. No bounce or overshoot.
- Respect `prefers-reduced-motion`.

## Avoid

These are the things that make a UI look generated. Do not use them. The reasons and sources are in `docs/no-ai-look.md` in the design repo.

- Cyan, teal or ice blue on near-black. Blue-tinted "slate" greys.
- Purple, violet or blue gradients. Gradient text. Neon or glow.
- Glassmorphism, blur and frosted panels. Soft drop shadows.
- Big rounded cards, pill buttons and pill badges. Cards inside cards.
- A coloured left border on cards or callouts.
- Three feature cards in a row with an icon each. Bento grids.
- Lowercase section titles, small uppercase "eyebrow" labels and titles like `name / thing`.
- Hex codes and token names printed under every swatch, except on a reference page.
- A muted caption under every heading that explains the design.
- Emoji as icons or decoration. Sparkles. Stock illustrations.
- Copy like "Seamless", "Effortless", "Unlock", "Supercharge" or "Built for".
- Tracking, telemetry, CDNs, remote fonts and network calls.

Show real content instead: the clock, the bus, the headline. Let a plain table or a list do the work.

## The penguin

- The penguin belongs to the waddle theme. Every penguin comes from `themes/waddle/penguin.txt`. Use the files in `build/waddle/penguin/`. Never redraw it or scale it with smoothing.
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

- Run `node scripts/build.mjs`. It stops if a theme fails WCAG AA (4.5:1) or its other checks.
- In other repos, run `node ~/Code/design/scripts/check-ai-look.mjs src`. It flags gradients, shadows, blur, round corners, blue or purple colours, emoji and marketing words.
- Look at it in dark and light.
- For e-ink, view it in greyscale. Text and borders must still read with four grey levels.
- For evening use, check it with a red filter. Shapes must not depend on blue or green alone.
