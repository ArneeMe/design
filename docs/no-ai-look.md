# No AI look

Everything made from this design system should look like Arne made it, not like the average of every site a model has seen. This file says what that average looks like, why we avoid it and how the repo keeps it out.

## Why it happens

A model with no design decisions falls back on the statistical middle of its training data. The result is a handful of looks that people now recognise on sight. The fix is to make decisions and write them down, which is what this repo is for.

## The tells

Colour
- Cyan, teal or ice blue on near-black. This is the most cited tell, along with purple gradients.
- Purple, violet or blue-to-purple gradients. Tailwind's indigo and violet.
- Blue-tinted "slate" greys.
- Neon, glow and gradient text.

Shape
- Big rounded cards with soft drop shadows. Pill buttons and pill badges.
- Glassmorphism, blur and frosted panels.
- A coloured left border on cards or callouts.
- Cards inside cards.

Layout
- A centred hero, then three feature cards in a row with an icon each.
- Bento grids.
- Small uppercase "eyebrow" labels over headings. Lowercase titles like `name / thing`.
- A muted caption under every heading that explains the design.
- Hex codes and token names printed under every swatch.

Type and copy
- Inter by default, with no reason.
- Emoji as icons. Sparkles.
- "Seamless", "effortless", "unlock", "supercharge", "elevate", "empower", "built for".
- Stock illustrations.

## What we do instead

| Instead of | We use |
|---|---|
| Ice blue accent | `nebb`, the orange of a penguin beak. It also keeps its contrast under the red night filter |
| Blue-tinted greys | Neutral greys with no tint |
| Rounded cards and shadows | 2px borders, 0 or 2px corners, no shadows |
| Glass and blur | Solid colour |
| Feature cards and bento | Real content: the clock, the bus, the headline. Plain tables and lists |
| Inter | JetBrains Mono, chosen and self-hosted |
| Emoji and illustrations | The pixel penguin from `penguin.txt`, once per screen |
| Marketing copy | Short, plain, a little dry |

## How the repo holds the line

- `scripts/check-ai-look.mjs` scans CSS, HTML, JS, SVG and Markdown for gradients, shadows, blur, radius over 2px, coloured left borders, uppercase labels, blue, cyan or purple colours, Tailwind purple and cyan, emoji and marketing words.
- `node scripts/build.mjs` runs it on everything this repo ships and stops if it finds anything.
- The build also stops if a theme pair fails WCAG AA, if light colours land on the same e-ink grey, or if text or accent drops below 3:1 under the red filter.
- `skill/design-arne/SKILL.md` gives the same list to every agent.

Run it on any other app:

```bash
node ~/Code/design/scripts/check-ai-look.mjs src
```

The check is a tripwire, not a judge. It cannot see layout, so a page can pass and still look generated. Look at the result in dark, light, e-ink and red filter before you call it done.

## Decisions

- 2026-11-06: The accent was "isbre" ice blue (`#5fb0dc`, `#1b6390`) with blue-tinted greys. It was the cyan-on-dark look and it vanished under the red filter. Replaced by `nebb` orange and neutral greys.

## Sources

- [7 Signs a UI Has Been Vibe Coded](https://www.thefountaininstitute.com/blog/signs-vibe-coded-ui)
- [The visible tells of AI design](https://impeccable.style/slop)
- [Dark mode design that doesn't look AI](https://dev.to/raxxostudios/dark-mode-design-that-doesnt-look-ai-2cn3)
- [AI design slop: overused UI patterns](https://noqta.tn/en/blog/ai-design-slop-overused-ui-patterns-fix-2026)
- [AI slop fonts and gradients](https://www.925studios.co/blog/ai-slop-design-tells)
- [Why your AI keeps building the same purple gradient website](https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website)
- [Why every AI-built website looks the same](https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p)
- [AI UI design statistics](https://superdesign.dev/blog/ai-ui-design-statistics)
