#!/usr/bin/env bash
# Builds the shipped interaction sounds in public/assets/sounds/ from the
# reference audio in components/grid-wallet-demo/refs/sounds/. That folder is
# gitignored (licensed source material, kept locally); the built files are
# what the repo carries. refs/sounds/apple/README.txt records where the Apple
# clips came from.
#
# Each source is trimmed to the sound, downmixed to mono, peak-normalized to
# -3 dBFS, faded out over its last 20 ms, and encoded twice: AAC in .m4a
# (Chrome, Safari, Firefox on macOS and Windows) and MP3 as the fallback
# (Firefox on Linux without system AAC). src/lib/sounds.ts loads the .m4a and
# falls back to the .mp3 when the browser cannot decode it.
#
# Requires ffmpeg (brew install ffmpeg). Run from anywhere:
#   bash components/grid-cards-demo/scripts/build-sounds.sh
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
refs="$here/../../grid-wallet-demo/refs/sounds"
out="$here/../public/assets/sounds"
mkdir -p "$out"

# name | source | start (s) | end (s) | fade-out (s, optional; 0.02 default)
clips=(
  "approval|$refs/epidemic/approval_success.caf|0|1.09"
  "issued|$refs/studies/payment-panel/03_access-granted-muted.wav|0|0.62|0.08"
  "applepay|$refs/processed/applepay-success.caf|0.05|1.0"
  "lock|$refs/apple/lock.wav|0|0.35"
  "notify|$refs/apple/notification-rebound.wav|0|1.45"
)

for clip in "${clips[@]}"; do
  IFS='|' read -r name src start end fade <<<"$clip"
  fade=${fade:-0.02}
  len=$(python3 -c "print(round($end - $start, 4))")
  fade_at=$(python3 -c "print(max(0, round($len - $fade, 4)))")
  # Input-side seeking (-ss before -i) restarts timestamps at 0, so the fade's
  # start is measured from the clip, not from the source file.
  # Pass 1: measure the peak of the trimmed, mono clip.
  peak=$(ffmpeg -hide_banner -nostats -ss "$start" -t "$len" -i "$src" -ac 1 -af volumedetect -f null - 2>&1 |
    sed -n 's/.*max_volume: \(-\{0,1\}[0-9.]*\) dB.*/\1/p')
  gain=$(python3 -c "print(round(-3 - ($peak), 2))")
  filters="volume=${gain}dB,afade=t=out:st=${fade_at}:d=${fade}"
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$len" -i "$src" -ac 1 -ar 48000 -af "$filters" \
    -c:a aac_at -b:a 64k -movflags +faststart "$out/$name.m4a"
  ffmpeg -hide_banner -loglevel error -y -ss "$start" -t "$len" -i "$src" -ac 1 -ar 48000 -af "$filters" \
    -c:a libmp3lame -b:a 64k "$out/$name.mp3"
  printf '%-10s %5ss  peak %6s dB -> %s.m4a %s.mp3\n' "$name" "$len" "$peak" "$name" "$name"
done

du -ch "$out"/*.m4a "$out"/*.mp3 | tail -1
