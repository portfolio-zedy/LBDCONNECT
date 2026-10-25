#!/usr/bin/env python3
"""Generate PWA/app icons from the LBD crest logo (public/images/logo.png)."""
from PIL import Image

SRC = "/home/z/my-project/public/images/logo.png"
OUT = "/home/z/my-project/public/images"
BG = (251, 249, 244, 255)  # cream white, matches the crest's own background

logo = Image.open(SRC).convert("RGBA")


def make_square(size: int, logo_scale: float, path: str) -> None:
    canvas = Image.new("RGBA", (size, size), BG)
    # contain-fit the portrait logo into (scale*size) box, centered
    box = int(size * logo_scale)
    ratio = min(box / logo.width, box / logo.height)
    w, h = int(logo.width * ratio), int(logo.height * ratio)
    resized = logo.resize((w, h), Image.LANCZOS)
    canvas.paste(
        resized, ((size - w) // 2, (size - h) // 2), resized
    )
    canvas.convert("RGB").save(path, "PNG", optimize=True)
    print(f"wrote {path} ({size}x{size})")


make_square(192, 0.84, f"{OUT}/icon-192.png")
make_square(512, 0.84, f"{OUT}/icon-512.png")
make_square(512, 0.62, f"{OUT}/maskable-512.png")  # safe-zone padding
make_square(180, 0.84, f"{OUT}/apple-touch-icon.png")
