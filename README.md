# Jennifer Barragan, Lakewood Ranch Florida Real Estate

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

Note the office address is her brokerage's, not a place she is marketed from.
Getting that wrong is a 61J2-10.025 problem rather than a typo.

**Market order, set 2026-08-19.** Lakewood Ranch first, then Sarasota, then
Bradenton, then the barrier islands. That order drives the logo's second line,
the footer tagline, every page title and meta description, and the JSON-LD
areaServed. It replaced a Bradenton first site. Two things did not move with it
and are still Manatee County specific: the payment estimator on Buyers, which
uses Manatee tax and insurance ballparks, and the relocation guide, whose body
is written around Manatee County. The twenty neighborhood pages are Manatee
areas too. Anything claiming Sarasota depth needs that content written first.

---

## Layout

```
index.html               home: scrub hero, listings, Start Here, about, guide, contact
buyers.html              payment estimator, 3 step buyer form, 5 FAQs
sellers.html             3 step valuation form, process, 5 FAQs
relocate.html            for out of state buyers, gated guide, 4 FAQs
neighborhoods.html       generated hub
neighborhoods/           20 generated area pages
es/                      the Spanish site. five pages, hand written, see below
accessibility.html       WCAG statement and barrier reporting route
404.html                 not found. THE ONE PAGE USING ROOT RELATIVE PATHS
css/styles.css           the entire site. tokens at :root
js/reveal.js             scroll animation system, exposes window.JR.observeReveals
js/hero-scrub.js         canvas frame scrub on desktop, video on mobile
js/main.js               nav, forms, listings, modal, calculator. holds the STR table
js/lang.js               the Spanish offer bar. head, not deferred
data/listings.seed.js    hand maintained fallback. edit this one
scripts/                 the build and check scripts
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
node scripts/check-i18n.js           # the other guardrail. English and Spanish in step
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

## Spanish, and the switch that leads to it

Added 2026-08-19. Jennifer is fully bilingual and the site never said so, which
was the actual gap. A translated page proves the PAGE is translated. What a
Spanish speaking client is deciding is whether the AGENT can take them through
an inspection and a closing in Spanish, so the site now answers that first and
switches language second.

### What exists

Five pages, at real URLs, indexable, working with JavaScript switched off:

| English | Spanish |
|---|---|
| `/` | `/es/` |
| `buyers.html` | `es/comprar.html` |
| `sellers.html` | `es/vender.html` |
| `relocate.html` | `es/mudarse.html` |
| `neighborhoods.html` | `es/vecindarios.html` |

Not yet translated: the 20 neighborhood detail pages, the 4 guides, and the
`g/` landing pages. `es/vecindarios.html` says so in Spanish, on the page,
rather than letting a reader discover it by clicking into English.

### The three parts

**The switch** is `.nav__lang` in every page's nav. It is a plain link, because
the two languages are separate files rather than one page that swaps text. Three
rules it follows, all deliberate:

- **It is labelled in the language it leads to.** `Español` on the English side,
  `English` on the Spanish side. Someone who reads little English still
  recognises the word `Español`. `Spanish` would be useless to them.
- **No flags, ever.** A flag names a country, not a language. Mexico, Colombia,
  Spain, Puerto Rico: any single choice excludes most of the people this is for.
- **It sits in the bar, not in the burger panel.** Below 1040px `.nav__links`
  collapses and `.nav__cta` is hidden entirely, so a switch inside either would
  be invisible on a phone. Below 380px the word drops and the globe carries it,
  with the `aria-label` keeping it announced.

**The offer bar** is `js/lang.js`. If `navigator.languages[0]` starts with `es`
and the visitor is on an English page, a slim bar offers the Spanish version in
Spanish. It **offers and never redirects**: a forced language redirect traps
every bilingual reader who wanted the English page, and hands a borrowed or
shared computer the wrong language. It asks once, stores the answer, and never
raises it again. It is loaded **in the head and not deferred**, so it settles
before the header paints instead of shoving the nav down under the reader.

**The trust signal** is the `.hablo` block: `Hablo español` beside her
photograph in the About band and again beside the contact form, written in
Spanish on the English page. That is the part the switch cannot do.

### Rules for editing

1. **`js/main.js` injects text, and all of it lives in the `STR` table** at the
   top of the file, keyed off the page's `lang` attribute. Listing cards, the
   modal, tab labels, form step titles, the Sending button. A string written
   inline anywhere below that table is a bug: it renders English on a Spanish
   page. Money is deliberately NOT localised, because these are US dollar
   prices on US listings and they keep US grouping.

2. **Translate the label, never the `id`.** `js/main.js` finds the payment
   estimator and both multi step forms by literal id. Translating one returns
   null from `querySelector` and the feature silently stops, with no error.
   `check-i18n.js` catches this.

3. **Legal text is not free translation.** `Igualdad de Oportunidad en la
   Vivienda` and `Ley de Vivienda Justa` are HUD's own Spanish terms and are
   not paraphrased. The brokerage name, the REALTOR mark and licence SL3586445
   stay exactly as they are, in both languages, adjacent to every point of
   contact, per 61J2-10.025.

4. **Every form is tagged with its language.** `postForm` in `js/main.js` sets a
   `lang` field on every submission and `netlify/functions/lead.mjs` prints it
   in the CRM email. Answering a Spanish lead in English on the first reply
   undoes the whole exercise.

5. **`copy-lint.js` now has Spanish word lists** and picks them from the page's
   `lang` attribute. Fair housing law does not care what language the ad was
   written in, and `zona tranquila` and `buenas escuelas` are the same coded
   language as `quiet neighborhood` and `good schools`. They are ADDITIONAL to
   the English lists, so stray English on a Spanish page is still caught. The
   Spanish terms are written without accents and the page text is folded to
   match, because a hurried writer drops accents first and a rule that only
   fires on perfect Spanish would miss exactly the copy it exists to catch.

### The register, and the one open question

Neutral Latin American Spanish, warm rather than notarial. Explicitly not
Spain: no *vosotros*, no *piso*, no *vale*. `Bienes raíces`, not `sector
inmobiliario`. `HOA`, `CDD`, `MLS` and `escrow` stay in English with a gloss,
because every Spanish speaker who has closed in Florida already uses them that
way and translating them reads as someone who has never done a deal here.

The copy **writes around the tú and usted choice** wherever a sentence allows
it. This audience spans countries that disagree about which a professional
should use on first contact: *usted* reads cold to a Venezuelan or Argentine
reader, *tú* reads too casual to a Mexican or Guatemalan one on a first
approach. Spanish drops subject pronouns freely, so most marketing copy never
has to choose. Where the copy has to be direct, the calls to action and the
forms, it uses *tú*.

**Open question for Jennifer: where is her own Spanish from?** Her clients hear
her on the phone right after reading this copy and the two should match. The
neutral register above is the safe default until she says otherwise, and it was
written without guessing.

### Phase 2 and 3

- **Phase 2, the 20 neighborhood pages.** These are generated from the `DATA`
  array in `scripts/build-neighborhoods.js`, so translating them is a data edit
  rather than 20 new files: add an `es` field beside each existing text field.
  This is where the local search value is (`casas en venta en Bradenton`).
  `chrome.js` `head()` already takes an `altEs` option for the hreflang.
- **Phase 3, the guides.** Same mechanism in `scripts/build-guides.js`. Until
  then `es/mudarse.html` deliberately asks for a conversation instead of gating
  an English PDF behind a Spanish form, and `check-i18n.js` records that
  exception by name.

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
emails the guide to the lead and forwards the lead to the CRM. The funnel
runbook and the rest of the strategy docs moved out of this repository on
2026-08-19 (the repo went public for Netlify hosting, and those are internal
working files); they live in the workspace at
`shared/clients/jennifer-realty-website-internal/seo/`.

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
the relocation guide is a real page now, `guides/relocating-to-lakewood-ranch.html`,
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
