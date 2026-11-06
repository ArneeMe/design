#!/usr/bin/env bash
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
target="${1:?bruk: scripts/sync-waddleos.sh <sti til waddleos>}"

cp "$repo/build/waddleos/WaddleTokens.h" "$target/src/core/waddle/WaddleTokens.h"
echo "kopierte WaddleTokens.h fra design $(git -C "$repo" describe --tags --always)"
