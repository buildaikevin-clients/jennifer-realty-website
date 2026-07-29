"""Warp the branded panel onto the real sign in the photograph.

Only the printed area is replaced. The white frame, the timber stake and the
lighting all stay as photographed, which is what keeps it reading as a real
sign rather than a graphic pasted on grass.
"""
from PIL import Image
import numpy as np

SRC = "8469940.jpg"
OUT = "sign-mockup.png"

photo = Image.open(SRC).convert("RGB")
panel = Image.open("panel.png").convert("RGB")
W, H = photo.size

# Printed area of the sign, read off a coordinate grid at 1000px wide, then
# scaled by 6.72. Clockwise from top left.
# Detected from the photograph rather than eyeballed: the printed area is the
# connected red region, and these are its extreme corners, grown two pixels so
# no rim of the original colour survives at the edges.
quad = [(665, 2014), (2711, 2010), (2717, 3289), (654, 3308)]


def coeffs(dst, src):
    """Perspective coefficients mapping dst quad back into the src rectangle."""
    A, b = [], []
    for (x, y), (u, v) in zip(dst, src):
        A.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.append(u)
        A.append([0, 0, 0, x, y, 1, -v * x, -v * y]); b.append(v)
    return np.linalg.solve(np.array(A, float), np.array(b, float))


pw, ph = panel.size
c = coeffs(quad, [(0, 0), (pw, 0), (pw, ph), (0, ph)])

warped = panel.transform((W, H), Image.PERSPECTIVE, c, Image.BICUBIC)
mask = Image.new("L", (pw, ph), 255).transform(
    (W, H), Image.PERSPECTIVE, c, Image.BICUBIC)

# Carry the photograph's own light onto the flat artwork. The original panel is
# lit from the left, so its luminance, flattened around its mean, becomes a
# gentle multiply. Without this the panel reads as a sticker.
# Blur hard before using the photograph's luminance as a multiply. The old
# sign carried large white lettering, and unblurred it ghosted straight through
# the new artwork. Blurring leaves the broad light falloff and destroys the text.
from PIL import ImageFilter
orig = np.asarray(photo.convert("L").filter(ImageFilter.GaussianBlur(90)), float)
m = np.asarray(mask, float) / 255.0
inside = orig[m > 0.5]
shade = np.clip(orig / max(inside.mean(), 1e-6), 0.86, 1.14)
shade = 1.0 + (shade - 1.0) * 0.55            # keep it subtle

out = np.asarray(warped, float) * shade[..., None]
out = np.clip(out, 0, 255).astype(np.uint8)

res = Image.composite(Image.fromarray(out), photo, mask)
res.save(OUT)
print("composited", res.size)

# 4:5 crop for the journey figure, centred on the sign
cx = sum(p[0] for p in quad) / 4
cy = sum(p[1] for p in quad) / 4
ch = int(H * 0.92); cw = int(ch * 0.8)
x0 = int(min(max(cx - cw / 2, 0), W - cw))
y0 = int(min(max(cy - ch * 0.46, 0), H - ch))
res.crop((x0, y0, x0 + cw, y0 + ch)).resize((800, 1000), Image.LANCZOS).save("sign-4x5.webp", quality=82, method=6)
import os
print("4:5 asset", os.path.getsize("sign-4x5.webp"), "bytes")
