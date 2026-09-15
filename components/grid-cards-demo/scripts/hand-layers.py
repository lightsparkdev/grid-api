"""The share's hand, from a photograph.

Shoot (or generate) a right hand on a white cyclorama holding a flat
chroma plate of card proportions (CR80, 370:232), face on, in the present
grip: fingertips at the left short edge, thumb along the right. Then:

    python3 scripts/hand-layers.py photo.png public/assets/share/hand 2048

keys the plate out and writes the two layers the share composites around
the real 3D card, behind.png (everything outside the card's rectangle; the
rectangle transparent) and front.png (skin inside the rectangle: what passes
in front of the card), plus hand.json with the card's rectangle as fractions
of the square. Copy that rectangle into HAND_HOLE in
src/components/CardStage/export/compose.ts. The plate's color is keyed by
its red-green gap (see `key`); a plate of another color needs that changed.
Needs Pillow and numpy.
"""
import json
import sys

import numpy as np
from PIL import Image, ImageFilter

CARD_ASPECT = 370 / 232

src, out = sys.argv[1], sys.argv[2]
side = int(sys.argv[3]) if len(sys.argv) > 3 else 2048

im = Image.open(src).convert("RGB")
if im.size[0] != side:
    im = im.resize((side, side), Image.LANCZOS)
    # A touch of sharpening back after the resample.
    im = im.filter(ImageFilter.UnsharpMask(radius=1.2, percent=60, threshold=2))


def key(im):
    rgb = np.asarray(im).astype(np.float32) / 255.0
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    # Plate-ness. The generator rendered the plate a hot pink (about 238, 18,
    # 141), not #FF00FF: red high, green near zero, blue middling. Skin has
    # green well up, so the red-green gap separates them; blue rules out reds.
    mag = np.clip(((r - g) - 0.5) * 4, 0, 1) * np.clip((b - 0.3) * 4, 0, 1)
    return r, g, b, mag


def plate_extent(mag):
    ys, xs = np.where(mag > 0.5)
    rows = np.bincount(ys, minlength=side)
    cols = np.bincount(xs, minlength=side)
    # Rows/columns where the plate is clearly present (a fifth of its widest run).
    row_on = np.where(rows > rows.max() * 0.2)[0]
    col_on = np.where(cols > cols.max() * 0.2)[0]
    return int(row_on.min()), int(row_on.max()), int(col_on.min()), int(col_on.max())


# The generator's plate is never quite a card: measure it, then squash the
# whole photograph vertically by the small factor that makes the plate's
# visible width and height a CR80. The card then covers exactly what the
# plate showed, and the fingertips and thumb sit against its edges as they
# sat against the plate's. (A couple of percent on a hand is invisible.)
_, _, _, mag0 = key(im)
top0, bottom0, left0, right0 = plate_extent(mag0)
seen_w = right0 - left0
want_h = seen_w / CARD_ASPECT
squash = want_h / (bottom0 - top0)
print(f"plate {seen_w}x{bottom0 - top0}, squash y by {squash:.4f}")
squashed = im.resize((side, int(round(side * squash))), Image.LANCZOS)
canvas = Image.new("RGB", (side, side), (255, 255, 255))
canvas.paste(squashed, (0, 0))
im = canvas
r, g, b, mag = key(im)
top, bottom, left_seen, right_seen = plate_extent(mag)
h = bottom - top
w = seen_w
x0, x1 = float(left_seen), float(right_seen)
print(f"plate rows {top}..{bottom} (h {h}), cols {left_seen}..{right_seen}; card rect x {x0:.0f}..{x1:.0f} (w {w:.0f}), aspect {w / h:.3f} vs {CARD_ASPECT:.3f}")

# Alpha of the hand: 1 - plate-ness, feathered a hair; and the white
# background keyed to transparent too (it is drawn white by the compose).
# Inside the card's rectangle the key is looser: the plate is mottled
# there, and anything pinkish is plate, not skin.
yy, xx = np.mgrid[0:side, 0:side]
# A few px past the rectangle too: the plate's anti-aliased edge sits there.
PAD = 8
in_rect = (xx >= x0 - PAD) & (xx <= x1 + PAD) & (yy >= top - PAD) & (yy <= bottom + PAD)
mag_loose = np.clip(((r - g) - 0.3) * 5, 0, 1) * np.clip((b - 0.2) * 5, 0, 1)
mag = np.where(in_rect, np.maximum(mag, mag_loose), mag)
white = np.clip((np.minimum(np.minimum(r, g), b) - 0.93) / 0.06, 0, 1)
hand_alpha = (1 - mag) * (1 - white)
hand_alpha = np.asarray(Image.fromarray((hand_alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6))).astype(np.float32) / 255.0

# Spill: pixels at the plate's edge carry a magenta cast; pull green up to
# the mean of red and blue where the cast shows.
# A pink cast at the edge shows as blue lifted over green more than skin
# ever has; bring blue down to the green and lift green a little there.
cast = np.clip((b - g - 0.05) * 4, 0, 1) * (hand_alpha > 0.05) * (r > 0.5)
b2 = b - (b - g) * cast
g2 = g + (r - g) * 0.15 * cast
out_rgb = np.stack([r, g2, b2], axis=-1)

# The card's rectangle as a mask, with the card's corner radius.
radius = h * 0.045  # ~3.2 mm on a 54 mm card, about the mesh's corner
inside_x = np.clip(np.maximum(x0 + radius - xx, xx - (x1 - radius)), 0, None)
inside_y = np.clip(np.maximum(top + radius - yy, yy - (bottom - radius)), 0, None)
rect = np.sqrt(inside_x**2 + inside_y**2) <= radius

alpha8 = lambda a: (np.clip(a, 0, 1) * 255).astype(np.uint8)
rgb8 = (np.clip(out_rgb, 0, 1) * 255).astype(np.uint8)

behind = np.dstack([rgb8, alpha8(hand_alpha * (~rect))])
front = np.dstack([rgb8, alpha8(hand_alpha * rect)])
Image.fromarray(behind, "RGBA").save(f"{out}/behind.png", optimize=True)
Image.fromarray(front, "RGBA").save(f"{out}/front.png", optimize=True)

hole = {"x": x0 / side, "y": top / side, "w": w / side, "h": h / side}
json.dump({"side": side, "hole": hole, "source": "generated hand, present grip, keyed from a magenta plate"}, open(f"{out}/hand.json", "w"), indent=2)
print(json.dumps(hole))
# A check image: the layers over white with the hole outlined.
check = Image.new("RGBA", (side, side), (255, 255, 255, 255))
check.alpha_composite(Image.fromarray(behind, "RGBA"))
hole_img = Image.new("RGBA", (side, side), (0, 0, 0, 0))
hole_px = np.zeros((side, side, 4), np.uint8)
hole_px[rect] = (40, 120, 255, 90)
check.alpha_composite(Image.fromarray(hole_px, "RGBA"))
check.alpha_composite(Image.fromarray(front, "RGBA"))
check.convert("RGB").resize((1024, 1024)).save(f"{out}/check.png")
