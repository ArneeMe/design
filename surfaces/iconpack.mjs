import { readFileSync } from "node:fs";
import { loadIcons } from "./icons.mjs";

const root = new URL("../", import.meta.url);
const ident = n => n.replace(/-/g, "_");

const vector = (size, body) => `<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
    android:width="108dp"
    android:height="108dp"
    android:viewportWidth="${size}"
    android:viewportHeight="${size}">
${body}
</vector>
`;
const path = (color, d) => `    <path android:fillColor="${color}" android:pathData="${d}" />`;

const lum = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

export default function iconpack(t, write, colors) {
  const m = t.mode(t.darkest);
  const pkg = `me.arnee.design.ikoner.${t.id}${colors ? ".farge" : ""}`;
  const version = JSON.parse(readFileSync(new URL("package.json", root))).version;
  const apps = Object.entries(JSON.parse(readFileSync(new URL("assets/icon-pack.json", root))));
  const icons = new Map(loadIcons().map(i => [i.name, i.d]));
  const used = [...new Set(apps.map(([, icon]) => icon))].sort();
  const missing = used.filter(i => !icons.has(i));
  if (missing.length) throw new Error(`icon-pack.json uses missing icons: ${missing.join(", ")}`);

  const res = "app/src/main/res";
  const draw = (file, name, plate, ink, bar) => write(`${res}/drawable/${file}.xml`, vector(108, [
    path(plate, "M0 0h108v108H0z"),
    `    <group android:translateX="27" android:translateY="24" android:scaleX="2.25" android:scaleY="2.25">\n    ${path(ink, icons.get(name))}\n    </group>`,
    path(bar, "M48 86h12v4H48z"),
  ].join("\n")));
  for (const name of used) draw(`ikon_${ident(name)}`, name, m.surface, m.text, m.accent);
  const drawable = new Map(apps.map(([c, icon]) => [c, `ikon_${ident(icon)}`]));
  if (colors)
    for (const [c, icon] of apps) {
      const plate = colors[c.split("/")[0]];
      if (!plate) continue;
      const ink = contrast(plate, m.text) >= contrast(plate, m.bg) ? m.text : m.bg;
      drawable.set(c, `farge_${ident(c.split("/")[0].replaceAll(".", "_")).toLowerCase()}`);
      draw(drawable.get(c), icon, plate, ink, ink);
    }

  const b = t.art.badge?.(t);
  write(`${res}/drawable/pack_icon.xml`, b
    ? vector(b.size, [path(b.plate, `M0 0h${b.size}v${b.size}H0z`), ...b.layers.map(([c, d]) => path(c, d))].join("\n"))
    : vector(108, [path(m.surface, "M0 0h108v108H0z"), `    <group android:translateX="27" android:translateY="27" android:scaleX="2.25" android:scaleY="2.25">\n    ${path(m.accent, icons.get("grid-3x3"))}\n    </group>`].join("\n")));

  const component = c => { const [p, a] = c.split("/"); return `${p}/${a.startsWith(".") ? p + a : a}`; };
  const appfilter = `<?xml version="1.0" encoding="utf-8"?>
<resources>
${apps.map(([c]) => `    <item component="ComponentInfo{${component(c)}}" drawable="${drawable.get(c)}" />`).join("\n")}
</resources>
`;
  write(`${res}/xml/appfilter.xml`, appfilter);
  write("app/src/main/assets/appfilter.xml", appfilter);
  write(`${res}/xml/drawable.xml`, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <version>1</version>
    <category title="${t.name}" />
${[...new Set(drawable.values())].sort().map(d => `    <item drawable="${d}" />`).join("\n")}
</resources>
`);
  write(`${res}/values/strings.xml`, `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">${t.name}-ikoner${colors ? " i farger" : ""}</string>
</resources>
`);

  const themes = ["org.adw.launcher.THEMES", "com.novalauncher.THEME", "com.teslacoilsw.launcher.THEME", "com.anddoes.launcher.THEME", "com.gau.go.launcherex.theme", "app.lawnchair.icons.THEMED_ICON"];
  write("app/src/main/AndroidManifest.xml", `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:label="@string/app_name" android:icon="@drawable/pack_icon">
        <activity android:name=".Info" android:exported="true" android:theme="@android:style/Theme.Translucent.NoTitleBar">
${themes.map(a => `            <intent-filter>
                <action android:name="${a}" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>`).join("\n")}
        </activity>
    </application>
</manifest>
`);
  write(`app/src/main/java/${pkg.replaceAll(".", "/")}/Info.java`, `package ${pkg};

import android.app.Activity;
import android.os.Bundle;

public class Info extends Activity {
    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        finish();
    }
}
`);
  write("app/build.gradle.kts", `plugins {
    id("com.android.application")
}

android {
    namespace = "${pkg}"
    compileSdk = 35

    defaultConfig {
        applicationId = "${pkg}"
        minSdk = 26
        targetSdk = 35
        versionCode = ${version.split(".").reduce((n, v) => n * 100 + Number(v), 0)}
        versionName = "${version}"
    }

    signingConfigs {
        create("pack") {
            storeFile = file("iconpack.keystore")
            storePassword = "waddle-ikoner"
            keyAlias = "ikoner"
            keyPassword = "waddle-ikoner"
        }
    }

    buildTypes {
        getByName("debug") { signingConfig = signingConfigs.getByName("pack") }
    }
}
`);
  write("app/iconpack.keystore", readFileSync(new URL("assets/iconpack.keystore", root)));
  write("build.gradle.kts", `plugins {
    id("com.android.application") version "8.7.3" apply false
}
`);
  write("settings.gradle.kts", `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "${t.id}-ikoner${colors ? "-farge" : ""}"
include(":app")
`);
  write("gradle.properties", "org.gradle.jvmargs=-Xmx2g\nandroid.useAndroidX=false\n");
}
