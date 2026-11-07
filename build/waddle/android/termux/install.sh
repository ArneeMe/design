dir="$(cd "$(dirname "$0")" && pwd)"
mkdir -p ~/.termux
for f in colors.properties font.ttf; do
  [ -f ~/.termux/$f ] && [ ! -f ~/.termux/$f.for-design ] && cp ~/.termux/$f ~/.termux/$f.for-design
  cp "$dir/$f" ~/.termux/
done
termux-reload-settings
echo "termux: bruker waddle"
