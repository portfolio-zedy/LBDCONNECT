#!/usr/bin/env python3
"""Detect exact white-text rows in cards, then re-crop photo portions cleanly."""
from PIL import Image, ImageFilter

SRC = '/home/z/my-project/upload/WhatsApp Image 2026-10-24 at 18.40.44.jpeg'
OUT = '/home/z/my-project/public/images'
im = Image.open(SRC).convert('RGB')
px = im.load()

def white_rows(x0, x1, y0, y1):
    """rows containing many near-white pixels (title text)"""
    rows = []
    for y in range(y0, y1):
        cnt = sum(1 for x in range(x0, x1, 2) if min(px[x, y]) > 215)
        if cnt > 6:
            rows.append(y)
    return rows

# scan card1 and card4 title zones
print('card1 white-text rows 700-800:', white_rows(50, 275, 700, 800)[:5], '...')
r1 = white_rows(50, 275, 700, 800)
r2 = white_rows(50, 275, 915, 1015)
print('card1 first text row:', r1[0] if r1 else None)
print('card4 first text row:', r2[0] if r2 else None)

# re-crop with safe bottoms
COLS = [(40, 286), (305, 551), (568, 813)]
rows_meta = [
    (597, r1[0] - 4 if r1 else 733, ['card-prayers', 'card-programmes', 'card-word']),
    (812, r2[0] - 4 if r2 else 948, ['card-testimonies', 'card-register', 'card-leader']),
]
for top, bottom, names in rows_meta:
    print(f'row: top={top} photo_bottom={bottom} height={bottom-top}')
    for (x0, x1), name in zip(COLS, names):
        crop = im.crop((x0, top + 1, x1, bottom))
        crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
        crop = crop.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=3))
        crop.save(f'{OUT}/{name}.jpg', quality=90)
        print('saved', name, crop.size)
