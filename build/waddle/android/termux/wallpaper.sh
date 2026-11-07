h=$(date +%-H)
if [ "$h" -ge 6 ] && [ "$h" -lt 12 ]; then f=01-morgen-fairphone-6.png
elif [ "$h" -ge 12 ] && [ "$h" -lt 19 ]; then f=02-kveld-fairphone-6.png
else f=03-natt-fairphone-6.png
fi
[ "$(cat ~/.termux/wallpaper.last 2>/dev/null)" = "$f" ] && exit 0
termux-wallpaper -f "/sdcard/Pictures/waddle/$f" && termux-wallpaper -l -f "/sdcard/Pictures/waddle/$f" && echo "$f" > ~/.termux/wallpaper.last
