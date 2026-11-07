export default function waybar(t, write) {
  const get = p => t.get(p);
  write("colors.css", Object.entries(t.mode(t.darkest)).map(([k, h]) => `@define-color ${k} ${h};`).join("\n") + "\n");
  write("style.css", `@import "colors.css";

* {
  font-family: "${get("font.family.mono")[0]}", monospace;
  font-size: ${get("font.size.sm")};
  border: none;
  border-radius: ${get("radius.none")};
  min-height: 0;
}

window#waybar {
  background: @bg;
  color: @text;
  border-bottom: ${get("border.width")} solid @border;
}

#workspaces button {
  padding: 0 ${get("space.2")};
  color: @muted;
  background: transparent;
  border-bottom: ${get("border.width")} solid transparent;
  transition: all ${get("motion.duration.fast")};
}

#workspaces button.active {
  color: @text;
  border-bottom-color: @accent;
}

#workspaces button.urgent {
  color: @on-accent;
  background: @accent;
}

#workspaces button:hover {
  background: @surface;
  box-shadow: none;
}

#clock, #battery, #network, #pulseaudio, #cpu, #memory, #tray, #bluetooth {
  padding: 0 ${get("space.3")};
}

#clock {
  color: @text;
  font-weight: ${get("font.weight.bold")};
}

#battery.warning, #battery.critical, #network.disconnected, #pulseaudio.muted {
  color: @accent;
}

tooltip {
  background: @surface;
  border: ${get("border.width")} solid @border;
}
`);
}
