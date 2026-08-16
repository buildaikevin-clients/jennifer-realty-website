# Jennifer Barragan — Bradenton, Florida Real Estate

A static website for a licensed Florida real estate agent working Manatee County
and the barrier islands. Hand written HTML, one stylesheet, three JavaScript
files, no build step, no npm dependencies, deployed on Netlify.

**Just want to see it?** Open `index.html` in a browser. Everything works with no
server. For the nicer version with correct absolute paths, run
`npx --yes serve .` and open the port it prints.

Built 2026-07-26. Modeled on the architecture of `kevin-vaz-realty-website`,
with the visual direction taken from [schranerrealty.com](https://www.schranerrealty.com/).

---

## Her details

Filled in 2026-07-26 and verified against Preferred Shore's own agent record
rather than retyped:

| | |
|---|---|
| Name | Jennifer Barragan |
| Brokerage | Preferred SHORE Real Estate (SHORE capitalised, as they render it) |
| Office | 50 S. Lemon Ave. Ste 302, **Sarasota**, FL 34236 |
| Phone | (205) 790-7560 |
| Email | jenniferbarragan.re@gmail.com (supplied 2026-07-27) |
| License | **SL3586445** |
| Lives in | Lakewood Ranch |
| Languages | English and Spanish |
| Brokerage subdomain | `jenniferbarragan.preferredshore.com` |

### Still outstanding

The `[[DOMAIN]]` token was resolved on 2026-08-16: the site's host is
**jenniferbarragan.com** (GoDaddy), written into every canonical, OG URL,
`sitemap.xml`, and `robots.txt` by `scripts/set-domain.js`. If the host ever
changes, run that script again with the new host and regenerate; never edit
the URLs by hand. The current host is recorded in `.domain`.

`[[STAT_CLOSED]]` is gone. The stats band it fed was removed on 2026-07-29,
because an unfilled counter was rendering a literal **0 homes closed** on the
home page, which is worse than showing nothing. The band also claimed twenty
years on the Gulf Coast, which her own record does not support: she has been
licensed since 2006, but in Georgia, then Alabama, and only recently Florida.
If a stats band is ever wanted again, take the numbers from her actual
production and label the tenure honestly.

**No `[[FILL IN]]` token reaches a rendered page any more**, verified
2026-08-16 across all 37 pages. Thirty of them were still shipping on that
date, and they are worth knowing about because of how they hid:

- **The social links** in the footer of `index`, `buyers` and `sellers` were
  `href="[[FILL IN: instagram url]]"`. They rendered as ordinary working links
  that navigated to a 404. Removed until Jennifer supplies real URLs.
- **`accessibility.html`** printed three developer instructions as body copy,
  on a page that is legally sensitive and set to `index, follow`.
- **All twenty neighborhood pages** printed
  `[[FILL IN: pull from Stellar MLS]]` as the Typical Range figure, in display
  type. The generator now omits that stat instead.

The trap: a search for `[[FILL IN]]` finds none of these, because every one of
them carries an explanatory note before the closing brackets. **Search for
`[[` alone.** `node scripts/check-links.js` also skipped them by design, since
line 69 deliberately ignores any href beginning with `[[`.

### Two things to verify before launch

**The license prefix.** DBPR issues Florida licenses with a class prefix: `SL`
for a sales associate, `BK` for a broker or broker associate. Her brokerage
stores the number bare as `3586445`, so `SL` is inferred from the fact that she
works under Preferred Shore rather than being its broker of record. After twenty
years she could hold a broker associate license, in which case it is
`BK3586445`. Check at myfloridalicense.com under Verify a License. It is one find
and replace either way.

**REALTOR® membership.** The site uses REALTOR® throughout. It is a registered
trademark restricted to current members of a Realtor association. Preferred Shore
advertises Realtors on staff, which is good evidence but is not confirmation of
Jennifer's own dues paying membership. Worth a one line check with her.

### The brokerage name is not cosmetic

Florida rule [61J2-10.025](https://flrules.elaws.us/fac/61j2-10.025) requires the
brokerage's licensed name to appear adjacent to, immediately above, or
immediately below **every point of contact**, meaning every phone number, email
address and mailing address. That is why the firm sits directly under the phone
number in the nav, under the address block in the footer, and beside the contact
details on Home, Buyers, Sellers and Accessibility. Those pairings are marked
with comments in the markup. **Do not separate them.**

Note the office is in **Sarasota**, not Bradenton. The site covers the Bradenton
market, but the address that appears next to her contact details is her
brokerage's, and getting that wrong is a 61J2-10.025 problem rather than a typo.

---

## Layout

```
index.html               home: scrub hero, listings, Start Here, about, guide, contact
buyers.html              payment estimator, 3 step buyer form, 5 FAQs
sellers.html             3 step valuation form, process, 5 FAQs
relocate.html            for out of state buyers, gated guide, 4 FAQs
neighborhoods.html       generated hub
neighborhoods/           20 generated area pages
accessibility.html       WCAG statement and barrier reporting route
404.html                 not found. THE ONE PAGE USING ROOT RELATIVE PATHS
css/styles.css           the entire site. tokens at :root
js/reveal.js             scroll animation system, exposes window.JR.observeReveals
js/hero-scrub.js         canvas frame scrub on desktop, video on mobile
js/main.js               nav, forms, listings, modal, calculator
data/listings.seed.js    hand maintained fallback. edit this one
scripts/                 the four build and check scripts
assets/hero-frames/      145 WebP frames. generated, but committed
brand/                   the logo: concepts, generator, and why. see its README
```

---

## The logo

**Split Initials**, chosen 2026-07-28. A Cormorant Garamond `J` and `B` split by
a gulf colored hairline. It appears as the monogram in the nav, as the full
lockup reversed in the footer, and as the favicon and touch icon on every page.

The six files in `assets/` are all generated by `brand/build/emit.py` from
outlined letterforms. **Do not hand edit them**, and read
[brand/README.md](brand/README.md) before changing anything about the mark. The
ten directions that were considered are preserved in `brand/logo-concepts.html`.

---

## Scripts

Plain Node, no dependencies, run from the repo root.

```bash
node scripts/copy-lint.js            # the guardrail. run before every commit
node scripts/build-neighborhoods.js  # regenerate the 20 area pages + hub
node scripts/build-sitemap.js        # regenerate sitemap.xml. run after the above
node scripts/build-hero-frames.js    # regenerate hero frames from the source video
```

### copy-lint is the important one

It enforces the three rules the site was built under and exits nonzero on any
finding:

1. **No hyphens and no dashes.** Jennifer asked for this literally. No em dash,
   no en dash, and no hyphen joining two words. Write "mid century" not
   "mid-century", "Interstate 75" not "I-75". Two narrow carve outs: digit to
   digit passes so a phone number keeps its normal `(941) 555-0142` format, and
   URLs plus language tags are stripped from JSON-LD before the check, since
   that block legitimately holds page slugs and `en-US`.
2. **No AI tells.** A vocabulary list of words that cluster in machine writing.
3. **No fair housing violations.** Phrases that describe who lives somewhere
   rather than the place. This is the one that matters.

The rule only ever sees visible text. Class names, element IDs, CSS properties
and file paths are code rather than writing and never reach it. URL slugs keep
their hyphens on purpose: Google treats a hyphen in a URL as a word separator
and recommends it, so `anna-maria-island.html` earns search visibility that
`annamariaisland.html` would throw away.

It also flags images with no `alt` and more than one exclamation point per page.

It already caught a real one during the build: "traditional neighborhood," which
is HUD flagged coded language, in a sentence that was actually about street
layout. The phrase was the problem, not the intent. That is exactly what the
script is for.

Escape hatch, to be used rarely and with a reason next to it:

```html
<!-- copy-lint-allow: some term -->
```

---

## The hero

`assets/hero-source.mp4` is the master, 1920x1080, 12 seconds, silent, no
watermark. `scripts/build-hero-frames.js` turns it into three things:

- `assets/hero-frames/` — 145 WebP frames at 12fps, about 7 MB total. Desktop.
- `assets/hero-mobile.mp4` — a 1.1 MB loop. Phones.
- `assets/hero-poster.webp` — first frame. Poster and social preview.

The frames are **committed on purpose**. There is no build step on Netlify, so
generated output is the deployed asset. Regenerating requires ffmpeg
(`winget install Gyan.FFmpeg`).

Below 900px wide the canvas never initializes and the looping video plays
instead, because iOS Safari cannot reliably seek a video or hold 145 decoded
images. Under `prefers-reduced-motion` neither runs and the poster stays.

The hero footage is illustrative. Nothing on the site claims it is a listing, a
sale, or a specific property, and it should stay that way.

---

## Listings

**Default: her own listings only. Brokerage listings are opt in.**

`node scraper/scrape.js` pulls her listings. Add `--agency` to include the
brokerage feed. Read `BROKER-PERMISSION.md` before using that flag: dropping it
and redeploying is the one command rollback if a takedown notice ever arrives.

Preferred Shore's site runs on MLS Grid carrying Stellar MLS data and publishes
an active takedown address. Republishing that here would not have been fixable
with broker permission, because the brokerage does not hold the redistribution
right either. On top of which her own listing array is empty, so a scraper would
have filled her personal site with colleagues' inventory.

When there is nothing to show, the listings section falls back to a handoff
panel pointing at
`jenniferbarragan.preferredshore.com`, her own brokerage subdomain. It is a
licensed IDX search, it is live rather than a stale copy, it is complete, and
searches there are attributed to her. `BROKER_SEARCH` and `handoffHTML()` in
`js/main.js` are the whole implementation.

Full reasoning, and what the scraper respects in their robots.txt, is in
`BROKER-PERMISSION.md`.

**Her own listings are a different matter** and she can advertise those freely.
Add them by hand to `data/listings.seed.js`, following the shape documented in
that file, and the carousel returns automatically with the handoff stepping
aside. The seed ships empty on purpose: a real estate site showing properties
that do not exist is a compliance problem, not a placeholder.

---

## Deploying

1. Push to GitHub, connect the repo in Netlify.
2. Publish directory `.`, no build command. `netlify.toml` already sets this
   along with cache and security headers including a CSP.
3. Point the domain, let Netlify issue the certificate.
4. **Turn on form notifications.** Netlify captures submissions with no
   configuration, but it will not email anyone until you enable it in
   Forms > Settings > Form notifications. This is the single easiest thing to
   forget and it silently loses every lead.

Forms wired: `contact`, `buyer-search`, `home-valuation`, and `guide-request`
(the guide gate, shared by relocate.html and every `g/` landing page; hidden
`guide` and `source` fields say which guide and which entry point). Each uses
a honeypot rather than a captcha. Both wizard forms compose a readable
`summary` field so the notification email is legible instead of a wall of
field names. Guide forms also POST to `/.netlify/functions/lead`, which
emails the guide to the lead and forwards the lead to the CRM; see
`seo/funnel-runbook.md` for the whole funnel.

The listing modal uses a prefilled `mailto:` CTA rather than a fifth form,
because putting a form inside an already focus trapped dialog complicates the
keyboard handling for little gain. If a showing request form is wanted later,
`initSimpleForm` in `js/main.js` takes it with almost no new code.

---

## Still needed

**Blocking launch:**

- Hosting: connect the repo to Netlify and point the GoDaddy DNS at it.
  `jenniferbarragan.com` is registered and its nameservers are GoDaddy's
  (`ns17`/`ns18.domaincontrol.com`), currently serving a parking page
- Netlify form notifications enabled. Off by default, and off means every
  lead is captured silently and nobody is ever told

That is the whole blocking list. Both photographs arrived, and the funnel
does not need Resend to work; see below.

**Not blocking, despite how the funnel reads:**

The delivery function degrades safely with **no environment variables set at
all**. It fails every email leg, logs, and still returns ok, because the
visitor's redirect to the guide rides on Netlify's capture and never on this
function. So the site can go live and gain email later:

| Leg | Without any env vars | Needs |
|---|---|---|
| Lead captured | Works, Netlify Forms | nothing |
| Jennifer notified | Works, form notification | notifications on |
| Visitor gets the guide | Works, browser redirect | nothing |
| Emailed copy to the lead | Skipped | Resend |
| Lead into the brokerage CRM | Skipped | Resend and the intake address |
| Row in the lead sheet | Skipped | Apps Script deploy |

Setting `JENNIFER_EMAIL` or `SITE_URL` without `RESEND_API_KEY` accomplishes
nothing, because every send throws without the key. Set all of them or none.

**Should have, not blocking:**

- Broker's written permission for listing display. Only needed before the
  scraper's `--agency` flag is ever used. Her own listing array is empty and
  the page falls back to the brokerage search handoff, so nothing today
  depends on it. Read `BROKER-PERMISSION.md` first
- **Her social profile URLs.** This moved up: the footer links were removed
  2026-08-16 because they were unresolved tokens pointing at a 404. Real URLs
  restore the links and fill the `sameAs` array, which is the strongest signal
  tying this site to her presence elsewhere for both Google and answer
  engines. Do not leave it empty forever
- Price ranges for all 20 neighborhood pages, pulled from Stellar MLS, plus
  `PRICES_AS_OF` in the generator. The Typical Range stat is omitted entirely
  until a confirmed figure exists, so nothing broken shows in the meantime
- An accessibility pass over the eight pages added 2026-08-16, the four guides
  and four landing pages. `accessibility.html` states its last review as
  2026-07-26 on purpose, because that is the last one that actually happened.
  Do the pass, then move the date

The gated PDF (`assets/guides/moving-to-bradenton.pdf`) is no longer needed:
the relocation guide is a real page now, `guides/relocating-to-bradenton.html`,
generated with three siblings by `scripts/build-guides.js`.

---

## Conventions worth keeping

- Everything visual reads from the tokens in `:root`. Rebranding is a values
  change in one place. Each color carries the contrast ratio it satisfies as a
  comment, which is what keeps the palette honest when someone nudges it.
- One accent color, used in one region. It never appears on nav or buttons.
- Serif when Jennifer is speaking, sans for data and navigation.
- Adding a scroll motion is a CSS class, not new JavaScript. See the scroll
  animation block in `styles.css`.
- Never invent a number. A visible `[[FILL IN]]` is always better than a
  plausible guess on a licensed agent's website.
