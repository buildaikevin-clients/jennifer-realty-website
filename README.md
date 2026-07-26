# Jennifer [[LAST]] — Bradenton, Florida Real Estate

A static website for a licensed Florida real estate agent working Manatee County
and the barrier islands. Hand written HTML, one stylesheet, three JavaScript
files, no build step, no npm dependencies, deployed on Netlify.

**Just want to see it?** Open `index.html` in a browser. Everything works with no
server. For the nicer version with correct absolute paths, run
`npx --yes serve .` and open the port it prints.

Built 2026-07-26. Modeled on the architecture of `kevin-vaz-realty-website`,
with the visual direction taken from [schranerrealty.com](https://www.schranerrealty.com/).

---

## Fill these in first

Every piece of real information is a bracketed token. Search the repo for `[[`
and you will find all of them. These nine appear across every page and should be
replaced with a global find and replace before anything goes live.

| Token | Replace with | Example |
|---|---|---|
| `[[LAST]]` | Jennifer's last name | `Vaz` |
| `[[FIRM]]` | Brokerage's **licensed** name, exactly as registered with DBPR | `Coastal Gulf Realty LLC` |
| `[[LICENSE]]` | Her Florida real estate license number | `SL3xxxxxx` |
| `[[PHONE]]` | Display phone | `(941) 555-0142` |
| `[[TEL]]` | Same number, `tel:` format | `+19415550142` |
| `[[EMAIL]]` | Her email | `jennifer@example.com` |
| `[[OFFICE]]` | Brokerage street address | `1234 Manatee Ave W` |
| `[[DOMAIN]]` | Domain, no protocol, no trailing slash | `www.example.com` |
| `[[STAT_CLOSED]]` `[[STAT_YEARS]]` `[[STAT_AREAS]]` | Numbers for the counter band on the home page | `140` `12` `20` |

Longer `[[FILL IN: ...]]` blocks are prose Jennifer has to write herself: her
bio, her opening line, her credentials. They say what is needed and why.

**`[[FIRM]]` is not cosmetic.** Florida rule
[61J2-10.025](https://flrules.elaws.us/fac/61j2-10.025) requires the brokerage's
licensed name to appear adjacent to, immediately above, or immediately below
every point of contact, meaning every phone number, email address and mailing
address. That is why the firm sits directly under the phone number in the nav,
under the address block in the footer, and beside the contact details on About,
Buyers, Sellers and Accessibility. Those pairings are marked with comments in the
markup. **Do not separate them.**

One more: only use the word REALTOR if she is a current member of a Realtor
association. It is a registered trademark. The site currently says "Licensed Real
Estate Agent" everywhere, which is always safe.

---

## Layout

```
index.html               home: scrub hero, Start Here, listings, about, guide, contact
buyers.html              payment estimator, 3 step buyer form, 5 FAQs
sellers.html             3 step valuation form, process, 5 FAQs
relocate.html            for out of state buyers, gated guide, 4 FAQs
neighborhoods.html       generated hub
neighborhoods/           20 generated area pages
about.html               bio, headshots, credentials
accessibility.html       WCAG statement and barrier reporting route
css/styles.css           the entire site. tokens at :root
js/reveal.js             scroll animation system, exposes window.JR.observeReveals
js/hero-scrub.js         canvas frame scrub on desktop, video on mobile
js/main.js               nav, forms, listings, modal, calculator
data/listings.js         written by the scraper. do not edit
data/listings.seed.js    hand maintained fallback. edit this one
scripts/                 the four build and check scripts
scraper/                 the listings bot
assets/hero-frames/      145 WebP frames. generated, but committed
```

---

## Scripts

Plain Node, no dependencies, run from the repo root.

```bash
node scripts/copy-lint.js            # the guardrail. run before every commit
node scripts/build-neighborhoods.js  # regenerate the 20 area pages + hub
node scripts/build-sitemap.js        # regenerate sitemap.xml. run after the above
node scripts/build-hero-frames.js    # regenerate hero frames from the source video
node scraper/scrape.js               # pull listings. needs config, see below
```

### copy-lint is the important one

It enforces the three rules the site was built under and exits nonzero on any
finding:

1. **No em dashes or en dashes.** Jennifer asked for no dashes. Ordinary hyphens
   inside words are fine.
2. **No AI tells.** A vocabulary list of words that cluster in machine writing.
3. **No fair housing violations.** Phrases that describe who lives somewhere
   rather than the place. This is the one that matters.

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

Three tiers of fallback so the grid is never broken:

1. `window.LISTINGS` from `data/listings.js`, written by the scraper
2. `window.LISTINGS_SEED` from `data/listings.seed.js`, hand maintained
3. An honest empty state

The seed ships **empty**, which is deliberate. It is not filled with invented
sample homes, because a real estate site displaying properties that do not exist
is a compliance problem rather than a placeholder. To add listings by hand, copy
the documented shape in `listings.seed.js`.

### Before the scraper can run

`scraper/scrape.js` refuses to run until `CONFIG.broker` is filled in. It needs
the brokerage site URL, Jennifer's agent profile URL on it, and the search path
pattern.

**And it needs the broker's written permission before the feed goes public.**
Bradenton is [Stellar MLS](https://www.stellarmls.com/distribution) territory,
whose Article 19 IDX rules are stricter than most. Scraped data does not satisfy
them regardless of where the HTML came from. See `BROKER-PERMISSION.md`.

Note: the scraper shells out to system `curl` rather than using Node's `fetch`,
because brokerage sites sit behind Cloudflare which 403s `fetch` on sight. That
is deliberate. Do not "fix" it.

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

Four forms are wired: `contact`, `buyer-search`, `home-valuation`, and
`relocation-guide`. Each uses a honeypot rather than a captcha. Both wizard
forms compose a readable `summary` field so the notification email is legible
instead of a wall of field names.

The listing modal uses a prefilled `mailto:` CTA rather than a fifth form,
because putting a form inside an already focus trapped dialog complicates the
keyboard handling for little gain. If a showing request form is wanted later,
`initSimpleForm` in `js/main.js` takes it with almost no new code.

---

## Still needed

**Blocking launch:**

- The nine tokens above
- Broker's written permission for listing display
- `assets/jennifer-headshot.jpg`, 4:5, about 1600x2000
- `assets/guides/moving-to-bradenton.pdf`, the gated lead magnet
- Netlify form notifications enabled

**Should have, not blocking:**

- `assets/jennifer-working.jpg` for the second About photo, 4:3
- A real logo to replace `assets/favicon.svg`
- Price ranges for the 17 neighborhood pages currently showing `[[FILL IN]]`,
  pulled from Stellar MLS, plus `PRICES_AS_OF` in the generator
- Her social profile URLs, for the `sameAs` array in the JSON-LD and the footer
- The `sameAs` array is the strongest signal tying this site to her presence
  elsewhere for both Google and answer engines. Do not leave it empty forever.

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
