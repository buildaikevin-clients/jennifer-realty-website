# The logo

**Split Initials.** Chosen 2026-07-28 from the ten directions in
`logo-concepts.html`, which is kept as the record of what was considered and
rejected. Open that file in a browser if the question "why this one" ever comes
up again.

A Cormorant Garamond `J` and `B` set large, separated by a gulf colored
hairline, with the full name in Cinzel below and the market in Montserrat below
that. Editorial rather than corporate, which is the register the rest of the
site is already written in.

---

## The files

All six live in `assets/` and all six are generated. Do not hand edit them.

| File | What it is | Where it is used |
|---|---|---|
| `logo.svg` | Full lockup, ink on light | Not yet placed. Print, email signature |
| `logo-reversed.svg` | Full lockup, bone on dark | The footer, every page |
| `logo-mark.svg` | Monogram alone, ink | Nav, once the header lands on the page |
| `logo-mark-light.svg` | Monogram alone, bone | Nav, while the header is over the hero |
| `favicon.svg` | Monogram on the deep plate | `<link rel="icon">`, every page |
| `apple-touch-icon.png` | 180x180 raster, square | iOS home screen, every page |

Colors are the tokens in `css/styles.css` and nothing else: deep `#1f2422`,
bone `#efeeec`, ink `#242424`, gulf `#6f9ea3`, gulf dark `#2c5f66`. Rebranding
the site still means editing one place.

---

## Regenerating

```bash
cd brand/build
pip install fonttools
# the three Google fonts the site already loads, as variable TTFs
curl -sLo cormorant.ttf  https://github.com/google/fonts/raw/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf
curl -sLo cinzel.ttf     https://github.com/google/fonts/raw/main/ofl/cinzel/Cinzel%5Bwght%5D.ttf
curl -sLo montserrat.ttf https://github.com/google/fonts/raw/main/ofl/montserrat/Montserrat%5Bwght%5D.ttf
python emit.py
```

The TTFs are git ignored. They are only build input, they are large, and Google
serves them at a stable URL.

`emit.py` writes `apple-touch-icon.svg` into `brand/build/`, not into `assets/`,
because Safari will not accept an SVG there. Rasterize it and move the PNG:

```bash
chrome --headless --screenshot=apple-touch-icon.png --window-size=180,180 \
       --hide-scrollbars --force-device-scale-factor=1 apple-touch-icon-source.svg
```

---

## Three things worth knowing before touching this

**The letterforms are outlines, not text.** No `<text>` element anywhere. That
is the whole point: the mark renders identically on a sign, a shirt, a PDF and a
browser with webfonts blocked. It also means a typo cannot be fixed by editing
the SVG. Change the source string in `emit.py` and regenerate.

**Centering is measured, not eyeballed.** Cormorant's `J` is far narrower than
its `B` and carries a large left side bearing, so centering on advance widths
throws the pair visibly to the right. `initials()` in `build_logo.py` centers on
inked extents instead, which is why the hairline does not sit at the arithmetic
midpoint of the group and should not be moved there.

**Do not post process the path data.** fontTools emits `H` and `V` shortcuts for
axis aligned segments, so any "shift every other number" rewrite silently
destroys the outlines. This was tried during the build and produced letters that
looked like ink blots. Position is baked into the pen transform instead. If you
need the mark somewhere else, change the arguments, do not edit the `d`
attribute.

---

## What the mark does not do

It does not satisfy Florida rule
[61J2-10.025](https://flrules.elaws.us/fac/61j2-10.025). The brokerage's
licensed name still has to appear adjacent to every point of contact, which is
why `Preferred SHORE Real Estate` remains in the nav under the phone number and
in the footer beside the address, as text, on every page. A personal logo sitting
nearby is not a substitute and swapping the one for the other is a compliance
problem rather than a design decision.

It is also not the Preferred Shore brokerage mark, which has its own usage rules
and has to be requested from the firm. Nothing here reproduces it.
