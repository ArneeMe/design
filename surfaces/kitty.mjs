const ansi = ["black", "red", "green", "yellow", "blue", "magenta", "cyan", "white"];

export default function kitty(t, write) {
  const dark = t.mode(t.darkest);
  const font = t.get("font.family.mono")[0];
  write(`${t.id}.conf`, `font_family ${font}
bold_font ${font} Bold
cursor_blink_interval 0
window_border_width ${t.get("border.width")}
window_padding_width ${parseInt(t.get("space.2"))}
tab_bar_style separator
tab_separator " "

foreground ${dark.text}
background ${dark.bg}
selection_foreground ${dark.text}
selection_background ${dark.border}
cursor ${dark.accent}
cursor_text_color ${dark.bg}
url_color ${dark.accent}
active_border_color ${dark.accent}
inactive_border_color ${dark.border}
bell_border_color ${t.get("color.ansi.red")}
active_tab_foreground ${dark.text}
active_tab_background ${dark.border}
inactive_tab_foreground ${dark.muted}
inactive_tab_background ${dark.bg}
tab_bar_background ${dark.bg}

${[...ansi, ...ansi.map(n => `bright-${n}`)].map((n, i) => `color${i} ${t.get(`color.ansi.${n}`)}`).join("\n")}
`);
}
