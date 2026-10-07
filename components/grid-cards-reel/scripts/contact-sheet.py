"""Tile out/sheet/<id>-front.png (and -back.png) into review sheets:
python3 scripts/contact-sheet.py [ids...]  ->  out/sheet-<n>.png, 12 cards a sheet."""
import os
import sys
from PIL import Image, ImageDraw

root = os.path.join(os.path.dirname(__file__), "..", "out")
src = os.path.join(root, "sheet")
ids = sys.argv[1:] or [f[: -len("-front.png")] for f in sorted(os.listdir(src), key=lambda f: os.path.getmtime(os.path.join(src, f))) if f.endswith("-front.png")]
tile = 360
cols = 4
per = 12
for n in range(0, len(ids), per):
    batch = ids[n : n + per]
    rows = (len(batch) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * tile * 2, rows * (tile + 28)), (24, 24, 26))
    d = ImageDraw.Draw(sheet)
    for i, cid in enumerate(batch):
        x = (i % cols) * tile * 2
        y = (i // cols) * (tile + 28)
        for k, side in enumerate(("front", "back")):
            im = Image.open(os.path.join(src, f"{cid}-{side}.png")).convert("RGBA").resize((tile, tile), Image.LANCZOS)
            bg = Image.new("RGBA", im.size, (40, 40, 44, 255))
            sheet.paste(Image.alpha_composite(bg, im).convert("RGB"), (x + k * tile, y))
        d.text((x + 8, y + tile + 6), cid, fill=(200, 200, 200))
    out = os.path.join(root, f"sheet-{n // per + 1}.png")
    sheet.save(out)
    print(out)
