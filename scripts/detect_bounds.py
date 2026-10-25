#!/usr/bin/env python3
"""Detect precise asset boundaries + sample theme colors from the mockup."""
from PIL import Image

SRC = '/home/z/my-project/upload/WhatsApp Image 2026-10-24 at 18.40.44.jpeg'
im = Image.open(SRC).convert('RGB')
px = im.load()
W, H = im.size

def bright(x, y):
    r, g, b = px[x, y]
    return (r + g + b) / 3

# ---- card column edges: scan brightness along a horizontal line through row-1 photos
def scan_x(y, thresh=200):
    runs, start = [], None
    for x in range(W):
        dark = bright(x, y) < thresh
        if dark and start is None:
            start = x
        elif not dark and start is not None:
            if x - start > 50:
                runs.append((start, x))
            start = None
    if start is not None and W - start > 50:
        runs.append((start, W))
    return runs

print('row1 photo dark runs at y=650:', scan_x(650))
print('row2 photo dark runs at y=870:', scan_x(870))

# ---- card vertical edges: scan brightness along vertical line through card1 center
def scan_y(x, y0, y1, thresh=200):
    runs, start = [], None
    for y in range(y0, y1):
        dark = bright(x, y) < thresh
        if dark and start is None:
            start = y
        elif not dark and start is not None:
            if y - start > 30:
                runs.append((start, y))
            start = None
    if start is not None:
        runs.append((start, y1))
    return runs

print('card1 vertical runs x=160, y 560-1030:', scan_y(160, 560, 1030))
print('banner vertical runs x=426, y 1010-1200:', scan_y(426, 1010, 1200))

# ---- where does card1 dark text-section start? scan brightness down card1 center
prev = None
for y in range(700, 800):
    b = bright(100, y)
    if prev is not None and abs(b - prev) > 25:
        print(f'card1 strong brightness jump at y={y}: {prev:.0f} -> {b:.0f}')
    prev = b

# ---- logo tight bbox in region
minx, miny, maxx, maxy = 9999, 9999, 0, 0
for y in range(90, 380):
    for x in range(60, 330):
        if bright(x, y) < 175:
            minx, miny = min(minx, x), min(miny, y)
            maxx, maxy = max(maxx, x), max(maxy, y)
print('logo tight bbox:', (minx, miny, maxx, maxy))

# ---- theme color samples
samples = {
    'header_bg_left': (60, 45), 'header_bg_mid': (426, 45), 'header_bg_right': (800, 45),
    'pill_orange': (360, 487), 'hero_bg_left': (60, 400), 'hero_bg_top': (426, 110),
    'page_bg_cards': (15, 700), 'card_dark_bottom': (160, 775),
    'banner_bg': (600, 1060), 'banner_orange_text': (200, 1057),
    'nav_active': (63, 1225), 'nav_inactive_text': (205, 1246),
    'bell_badge': (823, 30),
}
for name, (x, y) in samples.items():
    print(f'{name}: rgb{px[x, y]} #%02x%02x%02x' % px[x, y])
