# Building an app

How to start an app on top of the design system. Pick the theme first. If nobody says, it is `waddle`.

## Android

Plain Views in Kotlin, no Compose and no libraries. Copy the theme and the icons into the app module and commit them there:

```bash
~/Code/design/scripts/sync-app.sh ~/Code/<app>/app
```

You get:

- `me.arnee.design.WaddleTokens`: colours for dark and light, spacing in dp, text sizes in sp, radius, border width and motion times.
- `me.arnee.design.WaddleUi`: small helpers that read the tokens and follow the system's dark mode. `text`, `button`, `box`, `column`, `row`, `listRow`, `icon`, `divider` and `screen`.
- Resources: `R.color.waddle_accent` (light in `values`, dark in `values-night`), `R.dimen.waddle_space_4`, `R.font.waddle_mono` and `R.font.waddle_mono_bold`.
- Icons as vector drawables: `R.drawable.ic_home`, `ic_settings_cog` and the rest.

A screen looks like this:

```kotlin
class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val ui = WaddleUi
        val content = ui.column(this).apply {
            addView(ui.text(this@MainActivity, "Bokhylle", WaddleTokens.TEXT_XL, bold = true))
            addView(ui.box(this@MainActivity).apply {
                addView(ui.listRow(this@MainActivity, "Dune", "Kapittel 12", iconName = "book-open"))
                addView(ui.divider(this@MainActivity))
                addView(ui.listRow(this@MainActivity, "Synk", "Sist 07:40", iconName = "reload"))
            })
            addView(ui.row(this@MainActivity).apply {
                addView(ui.button(this@MainActivity, "Les", primary = true) { })
                addView(ui.button(this@MainActivity, "Avbryt") { })
            })
        }
        ui.screen(this, content)
    }
}
```

`screen` sets the background, pads for the status and navigation bars and picks light or dark system bar icons.

## Web

Link one theme and write plain HTML. See the README for npm and Tailwind.

```html
<link rel="stylesheet" href="design/web/waddle.css">
<svg class="icon"><use href="design/icons/sprite.svg#home"/></svg>
```

Icons take the text colour. `class="icon x2"` doubles them. Single SVG files are in `build/icons/svg/`.

## WaddleOS

`scripts/sync-waddleos.sh` copies `WaddleTokens.h` and `WaddleIcons.h`. Each icon is 24x24, three bytes per row, highest bit first, and a set bit means paper, the same layout as the existing `search24.h`.

## Icons

The icons come from [pixelarticons](https://github.com/halfmage/pixelarticons) (MIT), on a 24 pixel grid like the penguin. We use the `-sharp` variants, since corners are square.

- To add one, copy its SVG from pixelarticons into `assets/icons/`, named without `-sharp`, and rebuild.
- Do not draw icons or penguins by hand. Pick one that exists.
- Use them at 24 or 48 px so the pixels stay whole.

## Checklist

- Colours, spacing and fonts come from the tokens. No hex or raw numbers in the app.
- Works in dark and light.
- Text and buttons reach WCAG AA. Buttons are at least 48 dp tall.
- No shadows, glass, gradients or round corners over 2 px. See `docs/no-ai-look.md`.
- UI text is short and plain, in the user's language.
