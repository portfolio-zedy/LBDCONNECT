#!/usr/bin/env python3
"""Final asset extraction: card photos (2x upscale), feathered logo, precise colors."""
from PIL import Image, ImageFilter, ImageDraw
import os

SRC = '/home/z/my-project/upload/WhatsApp Image 2026-10-24 at 18.40.44.jpeg'
OUT = '/home/z/my-project/public/images'
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert('RGB')
px = im.load()

# ---------- precise color samples ----------
def hexat(x, y):
    return '#%02x%02x%02x' % px[x, y]

colors = {
    'header_left':  hexat(30, 45),   'header_mid':  hexat(300, 70),
    'header_right': hexat(760, 45),  'header_deep': hexat(426, 12),
    'pill_left':    hexat(150, 487), 'pill_mid':    hexat(250, 470),
    'connect_script': hexat(475, 250),
    'banner_icon_circle': hexat(95, 1100), 'banner_bg1': hexat(500, 1045),
    'banner_bg2': hexat(760, 1160),  'gods_design_orange': hexat(655, 1130),
    'nav_home_icon': hexat(63, 1208), 'nav_home_bar': hexat(63, 1258),
    'card_bottom_left': hexat(60, 785), 'card_bottom_right': hexat(270, 790),
    'hero_bg_corner': hexat(20, 560), 'bell_badge': hexat(825, 32),
}
for k, v in colors.items():
    print(f'{k}: {v}')

# ---------- card photo crops (photo portion only, 2x lanczos upscale) ----------
COLS = [(40, 286), (305, 551), (568, 813)]
ROWS = [(597, 795), (812, 1010)]   # row2 estimated: row1 + 215
PHOTO_BOTTOM = 742                  # dark text-section begins ~745
names = [
    ['card-prayers', 'card-programmes', 'card-word'],
    ['card-testimonies', 'card-register', 'card-leader'],
]
for r, (y0, y1) in enumerate(ROWS):
    pb = PHOTO_BOTTOM if r == 0 else PHOTO_BOTTOM + 215
    for c, (x0, x1) in enumerate(COLS):
        crop = im.crop((x0, y0 + 1, x1, pb))
        crop = crop.resize((crop.width * 2, crop.height * 2), Image.LANCZOS)
        crop = crop.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=3))
        crop.save(f'{OUT}/{names[r][c]}.jpg', quality=90)
        print('saved', names[r][c], crop.size)

# ---------- logo: tight crop + feathered alpha ----------
# tight visual bounds (figure + globe), avoids the stray mark at (285+, 350+)
lx0, ly0, lx1, ly1 = 98, 103, 292, 358
logo = im.crop((lx0, ly0, lx1, ly1)).convert('RGBA')
w, h = logo.size
# feathered alpha mask: fade out 14px at every edge
mask = Image.new('L', (w, h), 0)
d = ImageDraw.Draw(mask)
d.rectangle((14, 14, w - 14, h - 14), fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(9))
logo.putalpha(mask)
logo = logo.resize((w * 3, h * 3), Image.LANCZOS)  # 3x for crisp display
logo.save(f'{OUT}/logo.png')
print('saved logo', logo.size)

