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

## The yard sign

`sign-panel.png` is the artwork, 2280x1390. `sign-mockup.jpg` is that artwork
composited onto a real photograph of a sign so it can be seen in place. Both
are rebuilt by `build/build_sign.py` and `build/composite.py`.

**None of it is AI generated, and that is the point.** An image model renders
text unreliably, and one line on this sign is a legal requirement rather than
decoration: under 61J2-10.025 the brokerage name has to appear next to the
point of contact, which on a yard sign is the phone number. A generated
approximation of `Preferred SHORE Real Estate` with a letter wrong would be
worse than no sign at all. So the monogram is her actual `logo-mark-light.svg`
rasterized, and every line of type is set from the three fonts the site already
loads. The spelling is exact because it was never guessed.

The composite replaces only the printed area of the sign in the photograph. The
white frame, the timber stake and the light are all as photographed. Two things
that took a second pass and are worth keeping:

- The printed area is **detected**, not eyeballed. It is the connected red
  region of the original sign, taken to its extreme corners. A hand read
  coordinate left a rim of the old red along the bottom edge.
- The photograph's luminance is **blurred hard** before being used as a
  multiply. Unblurred it carried the old sign's large white lettering, and
  `HOME FOR SALE` ghosted straight through the new artwork.

### Before this goes anywhere public

**The brokerage is named in type only. Its logo is deliberately not
reproduced.** Preferred Shore's mark is a third party trademark with its own
usage rules, and imitating it would misrepresent them. Ask the firm for the
real asset and their sign specification.

**Brokerages control sign design.** Agents order signs to a house standard from
approved vendors, so treat this as a proposal to show Jennifer and her broker
rather than something to send to a sign shop. Her broker signs off, not us.

**The photograph is not Florida.** The house behind the sign has a brown
veranda and no palms. It is fine as a brand mockup and wrong as a page hero,
which is why it lives here and not in `assets/`. The right image for the site
is a photograph of her own real sign in a Manatee County yard.

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
