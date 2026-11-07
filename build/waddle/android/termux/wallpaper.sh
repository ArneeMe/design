h=$(date +%-H)
f=04-natt-fairphone-6.png
[ "$h" -ge 6 ] && f=01-morgen-fairphone-6.png
[ "$h" -ge 12 ] && f=02-ettermiddag-fairphone-6.png
[ "$h" -ge 19 ] && f=03-kveld-fairphone-6.png
[ "$h" -ge 23 ] && f=04-natt-fairphone-6.png
[ "$(cat ~/.termux/wallpaper.last 2>/dev/null)" = "$f" ] && exit 0
termux-wallpaper -f "/sdcard/Pictures/waddle/$f" && termux-wallpaper -l -f "/sdcard/Pictures/waddle/$f" && echo "$f" > ~/.termux/wallpaper.last
