import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const constName = k => k.replace(/[.-]/g, "_").toUpperCase();
const argb = h => `0xFF${h.slice(1).toUpperCase()}.toInt()`;
const num = v => parseFloat(v);

export default function appAndroid(t, write) {
  const name = t.name;
  const modes = t.modes.map(m => `    object ${m[0].toUpperCase() + m.slice(1)} {
${Object.entries(t.mode(m)).map(([k, h]) => `        const val ${constName(k)} = ${argb(h)}`).join("\n")}
    }`).join("\n\n");
  write(`java/me/arnee/design/${name}Tokens.kt`, `package me.arnee.design

object ${name}Tokens {
${modes}

${t.group("space").map(([k, v]) => `    const val SPACE_${k} = ${num(v)}`).join("\n")}

${t.group("font.size").map(([k, v]) => `    const val TEXT_${constName(k)} = ${num(v)}f`).join("\n")}
${t.group("font.weight").map(([k, v]) => `    const val WEIGHT_${constName(k)} = ${v}`).join("\n")}

${t.group("radius").map(([k, v]) => `    const val RADIUS_${constName(k)} = ${num(v)}`).join("\n")}
    const val BORDER_WIDTH = ${num(t.get("border.width"))}

${t.group("motion.duration").map(([k, v]) => `    const val MOTION_${constName(k)} = ${num(v)}L`).join("\n")}
}
`);

  const colors = m => `<?xml version="1.0" encoding="utf-8"?>
<resources>
${Object.entries(t.mode(m)).map(([k, h]) => `    <color name="${t.id}_${k.replace(/-/g, "_")}">${h}</color>`).join("\n")}
</resources>
`;
  const light = t.modes.includes("light") ? "light" : t.modes[0];
  write("res/values/design_colors.xml", colors(light));
  if (t.modes.includes("dark") && light !== "dark") write("res/values-night/design_colors.xml", colors("dark"));
  write("res/values/design_dimens.xml", `<?xml version="1.0" encoding="utf-8"?>
<resources>
${t.group("space").map(([k, v]) => `    <dimen name="${t.id}_space_${k}">${num(v)}dp</dimen>`).join("\n")}
${t.group("font.size").map(([k, v]) => `    <dimen name="${t.id}_text_${k}">${num(v)}sp</dimen>`).join("\n")}
${t.group("radius").map(([k, v]) => `    <dimen name="${t.id}_radius_${k}">${num(v)}dp</dimen>`).join("\n")}
    <dimen name="${t.id}_border_width">${num(t.get("border.width"))}dp</dimen>
</resources>
`);
  write(`res/font/${t.id}_mono.ttf`, readFileSync(new URL("assets/fonts/jetbrains-mono/ttf/JetBrainsMono-Regular.ttf", root)));
  write(`res/font/${t.id}_mono_bold.ttf`, readFileSync(new URL("assets/fonts/jetbrains-mono/ttf/JetBrainsMono-Bold.ttf", root)));

  const keys = ["bg", "surface", "border", "text", "muted", "accent", "on-accent"];
  const camel = k => k.replace(/-(.)/g, (_, c) => c.toUpperCase());
  const obj = m => `${name}Tokens.${m[0].toUpperCase() + m.slice(1)}`;
  const palette = m => `Palette(${keys.map(k => `${obj(m)}.${constName(k)}`).join(", ")})`;
  const dark = t.modes.includes("dark") ? "dark" : t.modes[0];
  const T = `${name}Tokens`;
  write(`java/me/arnee/design/${name}Ui.kt`, `package me.arnee.design

import android.app.Activity
import android.content.Context
import android.content.res.ColorStateList
import android.content.res.Configuration
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.view.Gravity
import android.view.View
import android.view.WindowInsets
import android.view.WindowInsetsController
import android.widget.Button
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView

object ${name}Ui {
    class Palette(${keys.map(k => `val ${camel(k)}: Int`).join(", ")})

    fun isDark(context: Context): Boolean =
        (context.resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES

    fun palette(context: Context): Palette =
        if (isDark(context)) ${palette(dark)} else ${palette(light)}

    fun dp(context: Context, value: Int): Int = (value * context.resources.displayMetrics.density).toInt()

    fun font(context: Context, bold: Boolean = false): Typeface {
        val id = context.resources.getIdentifier(if (bold) "${t.id}_mono_bold" else "${t.id}_mono", "font", context.packageName)
        return if (id != 0) context.resources.getFont(id) else Typeface.MONOSPACE
    }

    fun text(context: Context, value: CharSequence, size: Float = ${T}.TEXT_BASE, bold: Boolean = false, muted: Boolean = false) =
        TextView(context).apply {
            text = value
            textSize = size
            typeface = font(context, bold)
            setTextColor(if (muted) palette(context).muted else palette(context).text)
        }

    private fun gap(context: Context, value: Int, vertical: Boolean) = GradientDrawable().apply {
        if (vertical) setSize(0, dp(context, value)) else setSize(dp(context, value), 0)
    }

    fun column(context: Context, spacing: Int = ${T}.SPACE_3) = LinearLayout(context).apply {
        orientation = LinearLayout.VERTICAL
        dividerDrawable = gap(context, spacing, true)
        showDividers = LinearLayout.SHOW_DIVIDER_MIDDLE
    }

    fun row(context: Context, spacing: Int = ${T}.SPACE_2) = LinearLayout(context).apply {
        orientation = LinearLayout.HORIZONTAL
        gravity = Gravity.CENTER_VERTICAL
        dividerDrawable = gap(context, spacing, false)
        showDividers = LinearLayout.SHOW_DIVIDER_MIDDLE
    }

    fun outline(context: Context, fill: Int, stroke: Int) = GradientDrawable().apply {
        setColor(fill)
        setStroke(dp(context, ${T}.BORDER_WIDTH), stroke)
        cornerRadius = dp(context, ${T}.RADIUS_SM).toFloat()
    }

    fun box(context: Context) = column(context).apply {
        val p = palette(context)
        val pad = dp(context, ${T}.SPACE_4)
        background = outline(context, p.surface, p.border)
        setPadding(pad, pad, pad, pad)
    }

    fun button(context: Context, label: String, primary: Boolean = false, onClick: (View) -> Unit) =
        Button(context).apply {
            val p = palette(context)
            text = label
            isAllCaps = false
            stateListAnimator = null
            textSize = ${T}.TEXT_BASE
            typeface = font(context, primary)
            minHeight = dp(context, 48)
            minimumHeight = dp(context, 48)
            setPadding(dp(context, ${T}.SPACE_4), 0, dp(context, ${T}.SPACE_4), 0)
            setTextColor(if (primary) p.onAccent else p.text)
            background = outline(context, if (primary) p.accent else p.bg, if (primary) p.accent else p.border)
            setOnClickListener(onClick)
        }

    fun icon(context: Context, name: String, size: Int = 24, color: Int = palette(context).text) =
        ImageView(context).apply {
            val id = context.resources.getIdentifier("ic_" + name.replace('-', '_'), "drawable", context.packageName)
            if (id != 0) setImageResource(id)
            imageTintList = ColorStateList.valueOf(color)
            layoutParams = LinearLayout.LayoutParams(dp(context, size), dp(context, size))
        }

    fun divider(context: Context) = View(context).apply {
        setBackgroundColor(palette(context).border)
        layoutParams = LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(context, ${T}.BORDER_WIDTH))
    }

    fun listRow(context: Context, title: CharSequence, detail: CharSequence? = null, iconName: String? = null) =
        row(context, ${T}.SPACE_3).apply {
            val pad = dp(context, ${T}.SPACE_3)
            setPadding(0, pad, 0, pad)
            if (iconName != null) addView(icon(context, iconName))
            val lines = column(context, ${T}.SPACE_1)
            lines.addView(text(context, title))
            if (detail != null) lines.addView(text(context, detail, ${T}.TEXT_SM, muted = true))
            addView(lines, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f))
        }

    fun screen(activity: Activity, content: View) {
        val p = palette(activity)
        val pad = dp(activity, ${T}.SPACE_4)
        val scroll = ScrollView(activity).apply {
            setBackgroundColor(p.bg)
            addView(content)
            setOnApplyWindowInsetsListener { view, insets ->
                if (Build.VERSION.SDK_INT >= 30) {
                    val bars = insets.getInsets(WindowInsets.Type.systemBars())
                    view.setPadding(pad + bars.left, pad + bars.top, pad + bars.right, pad + bars.bottom)
                } else {
                    @Suppress("DEPRECATION")
                    view.setPadding(pad + insets.systemWindowInsetLeft, pad + insets.systemWindowInsetTop, pad + insets.systemWindowInsetRight, pad + insets.systemWindowInsetBottom)
                }
                insets
            }
        }
        activity.setContentView(scroll)
        activity.window.decorView.setBackgroundColor(p.bg)
        if (Build.VERSION.SDK_INT >= 30) {
            val light = WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS
            activity.window.insetsController?.setSystemBarsAppearance(if (isDark(activity)) 0 else light, light)
        }
    }
}
`);
}
