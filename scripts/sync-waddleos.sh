#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
target="${1:?bruk: scripts/sync-waddleos.sh <sti til waddleos> [tema]}"
theme="${2:-waddle}"

for h in "$repo/build/$theme/waddleos/"*.h; do
  cp "$h" "$target/src/core/waddle/"
  echo "kopierte $(basename "$h") fra design $(git -C "$repo" describe --tags --always)"
done
