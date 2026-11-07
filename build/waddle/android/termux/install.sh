dir="$(cd "$(dirname "$0")" && pwd)"
mkdir -p ~/.termux
for f in colors.properties font.ttf; do
  [ -f ~/.termux/$f ] && [ ! -f ~/.termux/$f.for-design ] && cp ~/.termux/$f ~/.termux/$f.for-design
  cp "$dir/$f" ~/.termux/
done
if command -v termux-job-scheduler >/dev/null && command -v termux-wallpaper >/dev/null; then
  cp "$dir/wallpaper.sh" ~/.termux/wallpaper.sh
  termux-job-scheduler --job-id 4242 --period-ms 900000 --persisted true --script ~/.termux/wallpaper.sh >/dev/null
  sh ~/.termux/wallpaper.sh
  echo "bakgrunn: bytter etter tid på døgnet"
else
  echo "bakgrunn: installer Termux:API fra F-Droid og kjør pkg install termux-api for å bytte etter tid på døgnet"
fi
termux-reload-settings
echo "termux: bruker waddle"
