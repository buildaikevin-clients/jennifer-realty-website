"""Composite Jennifer's real branding onto a real photograph of a yard sign.

The branding is NOT generated. The monogram is her actual logo file rasterized
from assets/logo-mark-light.svg, and every line of type is set from the same
three fonts the website loads, so the spelling is exact. That matters more than
usual here: the brokerage name is a Florida 61J2-10.025 requirement rather than
decoration, and an image model would have produced an approximation of it.

The brokerage is named in type only. Its actual logo is a third party mark with
its own usage rules and is deliberately not reproduced or imitated.
"""
from PIL import Image, ImageDraw, ImageFont
import os

S = r"C:\Users\kevco\AppData\Local\Temp\claude\c--Claude\cf76c8e5-d2d8-4292-9ae1-69ae049e9626\scratchpad"
DEEP, BONE, GULF, SAND = (31, 36, 34), (239, 238, 236), (111, 158, 163), (188, 188, 186)

PW, PH = 2280, 1390                      # panel pixels, matches the photo's panel
panel = Image.new("RGB", (PW, PH), DEEP)
d = ImageDraw.Draw(panel)

cin = lambda s: ImageFont.truetype(os.path.join(S, "cinzel.ttf"), s)
mon = lambda s: ImageFont.truetype(os.path.join(S, "montserrat.ttf"), s)

# hairline keyline just inside the edge
d.rectangle([26, 26, PW - 27, PH - 27], outline=GULF, width=4)


def track(draw, xy, text, font, fill, sp, anchor_mid=False):
    """Letterspaced text. PIL has no tracking, so glyphs are placed one by one."""
    w = sum(draw.textlength(c, font=font) + sp for c in text) - sp
    x, y = xy
    if anchor_mid:
        x -= w / 2
    for c in text:
        draw.text((x, y), c, font=font, fill=fill)
        x += draw.textlength(c, font=font) + sp
    return w


# --- her real monogram, left panel -----------------------------------------
logo = Image.open(os.path.join(S, "logo-bone.png")).convert("RGBA")
lh = 470
logo = logo.resize((int(logo.width * lh / logo.height), lh), Image.LANCZOS)
lx, ly = 190, (PH - lh) // 2 - 40
panel.paste(logo, (lx, ly), logo)

# vertical rule, the same device the logo itself uses
rx = lx + logo.width + 150
d.line([(rx, 250), (rx, PH - 250)], fill=GULF, width=4)

# --- type block, right ------------------------------------------------------
tx = rx + 150
track(d, (tx, 330), "JENNIFER", cin(150), BONE, 16)
track(d, (tx, 500), "BARRAGAN", cin(150), BONE, 16)
track(d, (tx, 700), "REALTOR\u00ae", mon(52), GULF, 12)

# Phone and firm sit together on purpose. Under Florida 61J2-10.025 the
# brokerage name has to appear adjacent to the point of contact, and on a yard
# sign the phone number is the point of contact. Do not separate these two.
track(d, (tx, 880), "(205) 790-7560", mon(112), BONE, 4)
track(d, (tx, 1045), "PREFERRED SHORE REAL ESTATE", mon(58), BONE, 9)

panel.save(os.path.join(S, "sign", "panel.png"))
print("panel built", panel.size)
