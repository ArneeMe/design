const hypr = h => `rgb(${h.slice(1)})`;

export default function hyprland(t, write) {
  const dark = t.mode(t.darkest);
  const px = p => parseInt(t.get(p));
  const speed = p => parseInt(t.get(p)) / 100;
  const [e1, e2, e3, e4] = t.get("motion.easing.standard");
  for (const w of t.art.wallpapers ?? [])
    for (const [width, height, scale] of [[1920, 1080, 6], [2560, 1440, 8], [3840, 2160, 12]])
      write(`wallpapers/${w.file.replace(".png", `-${width}x${height}.png`)}`, t.art.wallpaper(t, w.scene, scale));
  write(`${t.id}.conf`, `$bg = ${hypr(dark.bg)}
$surface = ${hypr(dark.surface)}
$border = ${hypr(dark.border)}
$text = ${hypr(dark.text)}
$muted = ${hypr(dark.muted)}
$accent = ${hypr(dark.accent)}

general {
    border_size = ${px("border.width")}
    gaps_in = ${px("space.1")}
    gaps_out = ${px("space.2")}
    col.active_border = $accent
    col.inactive_border = $border
}

decoration {
    rounding = ${px("radius.none")}
    shadow {
        enabled = false
    }
    blur {
        enabled = false
    }
}

animations {
    enabled = true
    bezier = ${t.id}, ${e1}, ${e2}, ${e3}, ${e4}
    animation = windows, 1, ${speed("motion.duration.base")}, ${t.id}, slide
    animation = border, 1, ${speed("motion.duration.fast")}, ${t.id}
    animation = fade, 1, ${speed("motion.duration.fast")}, ${t.id}
    animation = workspaces, 1, ${speed("motion.duration.base")}, ${t.id}, slide
}

misc {
    background_color = $bg
    disable_hyprland_logo = true
    disable_splash_rendering = true
}

group {
    col.border_active = $accent
    col.border_inactive = $border
}
`);
}
