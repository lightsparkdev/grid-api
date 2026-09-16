#!/usr/bin/env python3
"""Make the share panel's hand layers from masked photographs.

Each hand is a photograph of a hand pinching a flat, matte charcoal card of
credit-card proportions, face on, in front of a light grey backdrop, and a
cutout of that photograph with the backdrop and the card removed (skin that
passes in front of the card left in). The cutout is the layer: the composite
paints the template, the real card at the hole, then the layer on top, so
everything in the cutout is either beside the card or in front of it.

    scripts/hand-assets.py --out public/assets/share/hand \\
        ID=ORIGINAL.png:CUTOUT.png [ID=ORIGINAL.png:CUTOUT.png ...]

Writes ID.webp (the cutout, square) and hands.json: for each hand the hole
(the card's rectangle, as fractions of the square; found in the original as
the largest block of dark neutral pixels, then squared up to the card's
proportions) and a swatch color (the skin's median) for the picker.
"""

import argparse
import json
import os
import sys

import numpy as np
from PIL import Image

CARD_ASPECT = 85.6 / 53.98
# Below this luminance and chroma a pixel is the charcoal card, not skin (the
# darkest skin is still warm: its chroma is well over this).
CARD_LUM = 0.42
CARD_CHROMA = 0.035
WEBP_QUALITY = 92


def card_rect(original: Image.Image) -> tuple[float, float, float, float]:
    """The card's rectangle in the original, as fractions (x, y, w, h)."""
    o = np.asarray(original.convert("RGB")).astype(np.float32) / 255
    lum = o.mean(axis=2)
    chroma = o.max(axis=2) - o.min(axis=2)
    card = (lum < CARD_LUM) & (chroma < CARD_CHROMA)
    cols = card.sum(0)
    rows = card.sum(1)
    # The card is the one wide, tall block: its rows and columns hold most of
    # the dark pixels; stray dark pixels elsewhere hold far fewer.
    x0 = int(np.argmax(cols > cols.max() * 0.6))
    x1 = int(len(cols) - np.argmax(cols[::-1] > cols.max() * 0.6))
    y0 = int(np.argmax(rows > rows.max() * 0.6))
    y1 = int(len(rows) - np.argmax(rows[::-1] > rows.max() * 0.6))
    # Square it up to the card's proportions about its center, growing the
    # short side: the detected block is the card less its rounded corners.
    w, h = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if w / h < CARD_ASPECT:
        w = h * CARD_ASPECT
    else:
        h = w / CARD_ASPECT
    W, H = original.size
    return ((cx - w / 2) / W, (cy - h / 2) / H, w / W, h / H)


def skin_swatch(cutout: Image.Image) -> str:
    """The skin's median color, for the picker's swatch."""
    m = np.asarray(cutout.convert("RGBA"))
    solid = m[..., 3] > 250
    rgb = m[..., :3][solid]
    med = np.median(rgb, axis=0)
    return "#%02x%02x%02x" % tuple(int(v) for v in med)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("hands", nargs="+", help="ID=ORIGINAL.png:CUTOUT.png")
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)
    manifest = []
    for spec in args.hands:
        hand_id, paths = spec.split("=", 1)
        original_path, cutout_path = paths.split(":", 1)
        original = Image.open(original_path)
        cutout = Image.open(cutout_path).convert("RGBA")
        if cutout.width != cutout.height:
            print(f"{hand_id}: cutout must be square, got {cutout.size}", file=sys.stderr)
            return 1
        x, y, w, h = card_rect(original)
        cutout.save(os.path.join(args.out, f"{hand_id}.webp"), "WEBP", quality=WEBP_QUALITY, method=6)
        manifest.append({"id": hand_id, "hole": {"x": x, "y": y, "w": w, "h": h}, "swatch": skin_swatch(cutout)})
        print(f"{hand_id}: hole x={x:.4f} y={y:.4f} w={w:.4f} h={h:.4f} swatch {manifest[-1]['swatch']}")
    with open(os.path.join(args.out, "hands.json"), "w") as f:
        json.dump({"size": cutout.width, "hands": manifest}, f, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
