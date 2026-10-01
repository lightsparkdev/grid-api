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

Writes, per hand:

- ID.webp: the cutout, its edge decontaminated. A cutout's outermost pixels
  are blends with the backdrop they were photographed on (the photograph's
  anti-aliasing, the mask's feather): a pale fringe, invisible on a light
  surface, a halo on a dark one. The backdrop's share is unmixed out of each
  partial-alpha pixel, and the outer few pixels take the skin's color from
  just inside. Alpha is untouched, so the edge stays as cut.
- ID-rim.webp: the rim's shading for a dark surface, as a layer to draw over
  the cutout. The photograph's white backdrop wrapped light around the hand
  (a bright rim on the silhouette) that a dark surface would not; within a
  few pixels of the edge, a pixel brighter than the skin beside it is taken
  down by its excess. The layer is black with alpha the amount to take down
  at full strength; drawn at an opacity of the surface's darkness it takes
  down that fraction (the shading is linear in strength).

And hands.json: for each hand the hole (the card's rectangle, as fractions
of the square; found in the original as the largest block of dark neutral
pixels, then squared up to the card's proportions), a swatch color (the
skin's median) for the picker, and the backdrop's color.
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

# The edge: how deep the fringe runs and from how far inside the skin's color
# is drawn to replace it (fractions of the width; about 5 and 12 px at 2048),
# and the alpha below which an unmixed color is too noisy to trust.
FRINGE = 0.0025
FRINGE_FROM = 0.006
UNMIX_FLOOR = 0.35
# The rim: its reach into the hand (about 8 px), the neighborhood a pixel's
# brightness is judged over (about 24 px), and how far a highlight is taken
# down at full strength.
RIM_DEPTH = 0.004
RIM_LOCAL = 0.012
RIM_SHADE = 0.85


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


def backdrop_color(original: Image.Image) -> np.ndarray:
    """The backdrop's color: the median of the original's outer ring."""
    o = np.asarray(original.convert("RGB"))
    ring = np.concatenate([o[:12].reshape(-1, 3), o[-12:].reshape(-1, 3), o[:, :12].reshape(-1, 3), o[:, -12:].reshape(-1, 3)])
    return np.median(ring, axis=0)


def box_blur(a: np.ndarray, r: int) -> np.ndarray:
    """A box blur of radius r (edges replicated), by running sums."""
    r = max(1, int(r))
    p = np.pad(a, r, mode="edge").astype(np.float64)
    c = np.cumsum(p, axis=0)
    c = np.vstack([np.zeros((1, c.shape[1])), c])
    v = (c[2 * r + 1 :] - c[: -2 * r - 1]) / (2 * r + 1)
    c = np.cumsum(v, axis=1)
    c = np.hstack([np.zeros((c.shape[0], 1)), c])
    h = (c[:, 2 * r + 1 :] - c[:, : -2 * r - 1]) / (2 * r + 1)
    return h.astype(np.float32)


def luminance(rgb: np.ndarray) -> np.ndarray:
    return 0.2126 * rgb[..., 0] + 0.7152 * rgb[..., 1] + 0.0722 * rgb[..., 2]


def decontaminate(rgba: np.ndarray, backdrop: np.ndarray) -> np.ndarray:
    """The cutout with the backdrop unmixed from its edge and the outer
    fringe filled with the skin's color from inside. Colors 0..1."""
    W = rgba.shape[1]
    rgb = rgba[..., :3].copy()
    a = rgba[..., 3]
    bg = backdrop / 255
    # Unmix: a pixel of alpha a is the skin blended with the backdrop by 1 - a.
    partial = (a > 0) & (a < 1)
    k = np.maximum(a, UNMIX_FLOOR)[..., None]
    unmixed = np.clip((rgb - (1 - k) * bg) / k, 0, 1)
    rgb = np.where(partial[..., None], unmixed, rgb)
    # Fill: inside is 1 past the fringe's depth (its alpha, blurred by that
    # depth, still whole), 0 within it; the skin's color is drawn outward
    # from inside over the fringe.
    near = box_blur(a, round(W * FRINGE))
    inside = np.clip((near - 0.94) / 0.06, 0, 1)
    rf = round(W * FRINGE_FROM)
    wsum = box_blur(inside, rf)
    filled = np.stack([box_blur(rgb[..., c] * inside, rf) for c in range(3)], axis=-1) / np.maximum(wsum, 1e-6)[..., None]
    w = (1 - inside)[..., None]
    use = ((a > 0) & (wsum > 0.02))[..., None]
    rgb = np.where(use, rgb + (filled - rgb) * w, rgb)
    return np.concatenate([rgb, a[..., None]], axis=-1)


def rim_layer(rgba: np.ndarray) -> np.ndarray:
    """The rim's shading at full strength, as the alpha of a black layer
    (0..1): drawn over the cutout it takes each edge highlight down by its
    excess over the skin beside it."""
    W = rgba.shape[1]
    a = rgba[..., 3]
    lum = luminance(rgba[..., :3]) * a
    near = box_blur(a, round(W * RIM_DEPTH))
    rl = round(W * RIM_LOCAL)
    local_l = box_blur(lum, rl)
    local_a = box_blur(a, rl)
    rim = np.clip((1 - near) * 1.6, 0, 1)
    L = np.where(a > 0, lum / np.maximum(a, 1e-6), 0)
    around = np.where(local_a > 0.02, local_l / np.maximum(local_a, 1e-6), L)
    excess = np.maximum(0, L - around)
    take = RIM_SHADE * rim * np.minimum(1, excess * 5)
    # Only where the hand is, by its alpha: the layer must not darken what
    # shows through the cutout's edge.
    return np.where(a > 0, take * a, 0)


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
        backdrop = backdrop_color(original)
        rgba = np.asarray(cutout).astype(np.float32) / 255
        clean = decontaminate(rgba, backdrop)
        Image.fromarray((clean * 255 + 0.5).astype(np.uint8), "RGBA").save(
            os.path.join(args.out, f"{hand_id}.webp"), "WEBP", quality=WEBP_QUALITY, method=6
        )
        rim = rim_layer(clean)
        rim_rgba = np.zeros(clean.shape, np.uint8)
        rim_rgba[..., 3] = (rim * 255 + 0.5).astype(np.uint8)
        Image.fromarray(rim_rgba, "RGBA").save(os.path.join(args.out, f"{hand_id}-rim.webp"), "WEBP", quality=WEBP_QUALITY, method=6)
        manifest.append(
            {
                "id": hand_id,
                "hole": {"x": x, "y": y, "w": w, "h": h},
                "swatch": skin_swatch(cutout),
                "backdrop": "#%02x%02x%02x" % tuple(int(v) for v in backdrop),
            }
        )
        print(
            f"{hand_id}: hole x={x:.4f} y={y:.4f} w={w:.4f} h={h:.4f} swatch {manifest[-1]['swatch']} "
            f"backdrop {manifest[-1]['backdrop']} rim px {(rim > 0.02).sum()}"
        )
    with open(os.path.join(args.out, "hands.json"), "w") as f:
        json.dump({"size": cutout.width, "hands": manifest}, f, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
