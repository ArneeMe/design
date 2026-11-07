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
- If pixelarticons has nothing that fits, draw it in `assets/icons/drawn/<name>.txt`: 12 lines of 12 characters, `#` for ink. Each cell becomes 2x2 pixels, so lines are 2 px like the rest. Train, plane, bike, scooter and ticket are drawn this way.
- Never draw penguins or other figures.
- Use them at 24 or 48 px so the pixels stay whole.

## Checklist

- Colours, spacing and fonts come from the tokens. No hex or raw numbers in the app.
- Works in dark and light.
- Text and buttons reach WCAG AA. Buttons are at least 48 dp tall.
- No shadows, glass, gradients or round corners over 2 px. See `docs/no-ai-look.md`.
- UI text is short and plain, in the user's language.

## Icon pack for the phone

`assets/icon-pack.json` maps each app on the phone to an icon: `"package/activity": "icon"`. The build turns it into an Android project in `build/<theme>/iconpack/` with a dark plate, a light symbol and an orange bar for each app.

GitHub builds the pack every time it changes on `main` and puts it on the release `ikoner`. To install it from Termux on the phone, allow Termux to hand files to other apps once:

```bash
echo "allow-external-apps = true" >> ~/.termux/termux.properties && termux-reload-settings
```

Then download and open it. Android asks whether to install, and the first time, whether Termux may install apps:

```bash
curl -L -o waddle-ikoner.apk https://github.com/arneeme/design/releases/download/ikoner/waddle-ikoner.apk && termux-open waddle-ikoner.apk
```

Every build is signed with `assets/iconpack.keystore`, so a new version installs over the old one. The key is only for the icon pack and is public on purpose.

To build and install it from a PC instead, with the phone connected:

```bash
ANDROID_SERIAL=<serial> ~/Code/design/scripts/iconpack.sh
```

It borrows the Gradle wrapper from `~/Code/waddleOS/phone`. Then pick the pack in the launcher's settings. The launcher has to support icon packs, like Lawnchair or Kvaesitso.

To add a new app, find its component in Termux and add a line to `assets/icon-pack.json`:

```bash
cmd package query-activities --brief --user 0 -a android.intent.action.MAIN -c android.intent.category.LAUNCHER | grep /
```
