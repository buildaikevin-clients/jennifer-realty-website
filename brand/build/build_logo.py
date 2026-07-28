"""Geometry for concept 09, Split Initials, as outlined vector paths.

Everything ships as outlines rather than live text so the mark never depends on
Cormorant Garamond, Cinzel or Montserrat being available at render time.

Placement is baked into the pen transform rather than patched into the path
string afterwards. That matters: fontTools emits H and V shortcuts for axis
aligned lines, so a naive "shift every other number" rewrite silently mangles
the outlines. Offsets are found by measuring at the origin first, then
re-rendering at the position those measurements imply.
"""
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.misc.transform import Transform

PREC = 2


def load(path, wght):
    f = TTFont(path)
    if "fvar" in f:
        f = instancer.instantiateVariableFont(f, {"wght": wght}, inplace=False)
    return f


def _draw(font, text, size, tracking, dx, dy, pen):
    """Draw `text` into `pen`, origin at (dx, dy) on the baseline."""
    upem = font["head"].unitsPerEm
    s = size / upem
    cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font["hmtx"]
    x = dx
    for i, ch in enumerate(text):
        g = cmap[ord(ch)]
        # Font space is y up, SVG is y down, hence the negative y scale.
        gs[g].draw(TransformPen(pen, Transform(s, 0, 0, -s, x, dy)))
        x += hmtx[g][0] * s
        if i != len(text) - 1:
            x += tracking
    return x - dx


def bounds(font, text, size, tracking=0.0):
    """Inked bounds at the origin: (x0, y0, x1, y1) plus the advance width."""
    bp = BoundsPen(font.getGlyphSet())
    adv = _draw(font, text, size, tracking, 0, 0, bp)
    return bp.bounds, adv


def path(font, text, size, tracking, dx, dy):
    pen = SVGPathPen(font.getGlyphSet(), ntos=lambda v: f"{round(v, PREC):g}")
    _draw(font, text, size, tracking, dx, dy, pen)
    return pen.getCommands()


CORM = load("cormorant.ttf", 400)
CINZ = load("cinzel.ttf", 500)
MONT = load("montserrat.ttf", 400)


def initials(size, gap, cx, baseline):
    """J and B flanking a hairline rule, optically centered on cx.

    Centering uses inked extents, not advance widths. Cormorant's J is both
    much narrower than its B and carries a large left side bearing, so
    centering on advances would visibly throw the pair to the right.
    """
    (jx0, jy0, jx1, jy1), _ = bounds(CORM, "J", size)
    (bx0, by0, bx1, by1), _ = bounds(CORM, "B", size)
    ink_j, ink_b = jx1 - jx0, bx1 - bx0
    total = ink_j + gap * 2 + ink_b
    left = cx - total / 2
    rule = left + ink_j + gap
    return {
        "J": path(CORM, "J", size, 0, left - jx0, baseline),
        "B": path(CORM, "B", size, 0, rule + gap - bx0, baseline),
        "rule": round(rule, PREC),
        "top": round(baseline + min(jy0, by0), PREC),
        "bottom": round(baseline + max(jy1, by1), PREC),
        "left": round(left, PREC),
        "right": round(left + total, PREC),
    }


def centered(font, text, size, tracking, cx, baseline):
    """A line of type centered on cx by its inked width."""
    (x0, y0, x1, y1), _ = bounds(font, text, size, tracking)
    ink = x1 - x0
    return path(font, text, size, tracking, cx - ink / 2 - x0, baseline), round(ink, PREC)
