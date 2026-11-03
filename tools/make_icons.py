# Draws the home-screen icons (no external assets): a 3x3 grid of coloured rounded tiles.
from PIL import Image, ImageDraw
import sys, os
root = os.path.join(os.path.dirname(__file__), '..')
cols = ['#ff5d6c', '#ffcc4d', '#4cd986', '#4c9bff', '#b26bff', '#ff8f3d', '#3de0e0', '#ff7ac8', '#ffffff']
for size in (180, 192, 512):
    s = size * 4
    im = Image.new('RGB', (s, s), '#1b1f3b')
    d = ImageDraw.Draw(im)
    pad, gap = s * 0.14, s * 0.05
    cell = (s - 2 * pad - 2 * gap) / 3
    for i, c in enumerate(cols):
        x = pad + (i % 3) * (cell + gap); y = pad + (i // 3) * (cell + gap)
        d.rounded_rectangle([x, y + cell * 0.06, x + cell, y + cell * 1.06], radius=cell * 0.28, fill='#0d1026')
        d.rounded_rectangle([x, y, x + cell, y + cell], radius=cell * 0.28, fill=c)
        d.ellipse([x + cell * 0.18, y + cell * 0.14, x + cell * 0.42, y + cell * 0.32], fill=(255, 255, 255))
    im.resize((size, size), Image.LANCZOS).save(os.path.join(root, 'icon-%d.png' % size))
print('ok')
