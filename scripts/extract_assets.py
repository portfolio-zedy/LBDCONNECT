#!/usr/bin/env python3
"""Extract design assets (logo, hero art, card photos) from the LBD Nation Connect mockup."""
from PIL import Image, ImageDraw, ImageFilter
import os

SRC = '/home/z/my-project/upload/WhatsApp Image 2026-10-24 at 18.40.44.jpeg'
OUT = '/home/z/my-project/scripts/crops_preview'
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert('RGB')
W, H = im.size
print('source:', im.size)

# ---------- rough crops for coordinate verification ----------
rough = {
    'logo':        (95, 100, 300, 360),
    'hero_right':  (595, 95, 853, 572),
    'card1_full':  (35, 580, 290, 800),
    'card2_full':  (300, 580, 555, 800),
    'card3_full':  (563, 580, 818, 800),
    'card4_full':  (35, 800, 290, 1020),
    'card5_full':  (300, 800, 555, 1020),
    'card6_full':  (563, 800, 818, 1020),
    'banner':      (35, 1020, 818, 1180),
    'nav':         (0, 1180, 853, 1280),
}
for name, box in rough.items():
    im.crop(box).save(f'{OUT}/{name}.png')
    print('saved', name, box)
