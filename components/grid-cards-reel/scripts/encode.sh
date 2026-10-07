#!/usr/bin/env bash
# Encode a rendered take: npm run encode -- <take> [--webm]
#   out/<take>/card-reel.mov          ProRes 4444 with alpha, for compositing
#   out/<take>/card-reel-preview.mp4  H.264 on black, for review and sharing
#   out/<take>/card-reel.webm         VP9 with alpha (with --webm)
set -euo pipefail

take="${1:?usage: npm run encode -- <take> [--webm]}"
root="$(cd "$(dirname "$0")/.." && pwd)"
dir="$root/out/$take"
[[ -d "$dir/frames" ]] || { echo "no frames in $dir/frames" >&2; exit 1; }

fps="$(node -p "require('$dir/track.json').meta.fps")"
size="$(node -p "require('$dir/track.json').meta.size")"
frames="$dir/frames/frame_%05d.png"

ffmpeg -y -loglevel warning -stats -framerate "$fps" -i "$frames" \
  -c:v prores_ks -profile:v 4444 -pix_fmt yuva444p10le -alpha_bits 16 -vendor apl0 \
  "$dir/card-reel.mov"

ffmpeg -y -loglevel warning -stats -framerate "$fps" -i "$frames" \
  -f lavfi -i "color=c=black:s=${size}x${size}:r=${fps}" \
  -filter_complex "[1:v][0:v]overlay=shortest=1,format=yuv420p" \
  -c:v libx264 -preset slow -crf 14 -movflags +faststart \
  "$dir/card-reel-preview.mp4"

if [[ "${2:-}" == "--webm" ]]; then
  ffmpeg -y -loglevel warning -stats -framerate "$fps" -i "$frames" \
    -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 18 -row-mt 1 \
    "$dir/card-reel.webm"
fi

echo "Encoded $dir"
