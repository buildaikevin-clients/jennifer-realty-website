# Compliance record

What was built in, what was checked, and what is still open. Keep this current.
An accurate record is worth considerably more than an aspirational one if
anybody ever asks.

Last updated: 2026-07-26

---

## Florida advertising rule 61J2-10.025

The rule requires the brokerage's **licensed name** to appear adjacent to,
immediately above, or immediately below **every point of contact**. Point of
contact means any phone number, email address, or mailing address, not just the
one in the footer.

Implemented at every location where contact details appear:

| Location | Where |
|---|---|
| Nav phone CTA | Firm name renders under the number, all pages |
| Footer contact block | `.footer__firm` directly under the address |
| Home contact section | Firm block under the address |
| About contact section | Firm block under the address |
| Buyers form sidebar | Firm block under the contact details |
| Sellers form sidebar | Firm block under the contact details |
| Accessibility page | Firm block under the contact details |
| Form error messages | "at [[FIRM]]" appended to the fallback phone number |

Each pairing carries an HTML comment saying why. **Do not separate them.**

Open:

- [ ] `[[FIRM]]` replaced with the brokerage's exact registered name
- [ ] If Jennifer advertises under a personal marketing or team name, that name
      must be registered with DBPR before it is used
- [ ] The word REALTOR appears nowhere on the site. It is a registered trademark
      and may only be used by current members of a Realtor association. The site
      says "Licensed Real Estate Agent" instead, which is always safe. If she is
      a member and wants to use it, swap it deliberately

---

## Fair housing

- Equal Housing Opportunity statement and mark in the footer of **every** page,
  including the 20 generated neighborhood pages. The mark is an inline SVG CSS
  mask, so there is no image file that can go missing.
- Neighborhood pages carry an additional disclaimer that descriptions are
  general guidance about places and are not a representation about price,
  schools, or availability.
- `scripts/copy-lint.js` blocks a list of terms drawn from the protected classes
  and from HUD advertising guidance. It runs across all 28 pages and their
  JSON-LD.
- Schools are named as fact with a link to the district where relevant, and are
  never rated or characterized. School quality is the most common way fair
  housing problems enter neighborhood writing.
- No form field asks for or proxies a protected class. There is no household
  composition field, no religion field, and no "school quality" preference.

**The lint caught a live one during the build:** "traditional neighborhood," in
a sentence about street layout on the Perico Island page. The phrase is HUD
flagged coded language regardless of intent. Rewritten to "conventional street
grid."

Open:

- [ ] Re-run `node scripts/copy-lint.js` before every commit. It is the whole
      point of having it

---

## Accessibility, WCAG 2.1 Level AA

Built in:

- Skip link as the first focusable element on every page, targeting
  `<main id="main" tabindex="-1">`
- Visible focus indicators throughout, retuned per background so they stay
  visible on dark sections, the hero, and the footer
- Contrast: every color token in `css/styles.css` carries the ratio it
  satisfies as a comment. `--muted` was deliberately darkened from the design
  reference's `#8a8988`, which fails at 4.3:1 on the page background, to
  `#646260` at 5.1:1
- All images carry `alt`. Decorative layers are `aria-hidden`
- Form labels are visible and permanently associated, never placeholder only.
  Errors set `aria-invalid` alongside the visual state rather than relying on
  color
- Listing grid is `aria-live="polite"`. Filter tabs are an `aria-pressed`
  toggle group inside a labelled `role="group"`
- Photo modal traps focus on Tab and Shift Tab, closes on Escape, restores focus
  to the trigger
- Mobile menu closes on Escape and returns focus to the toggle
- Buttons, inputs and tabs have a 44px minimum height for touch
- Every animation is disabled under `prefers-reduced-motion`, in both CSS and
  JavaScript. The hero loads a poster and never initializes the scrub
- Hero video is silent with no audio track, so no captions are required
- `copy-lint` fails the build on any `<img>` without `alt`

Open:

- [ ] Run `npx --yes @axe-core/cli` against every page type once deployed
- [ ] Manual keyboard only pass through nav, carousel, modal, and all five forms
- [ ] Zoom to 200 percent, confirm no horizontal scrolling
- [ ] Test with a real screen reader. Automated tools catch roughly a third of
      issues
- [ ] Fill the `[[FILL IN]]` items in `accessibility.html`: the response time
      commitment and the last reviewed date

---

## Listing display

- Every listing modal prints the listing brokerage, "deemed reliable but not
  guaranteed," and "subject to change or prior sale"
- The listings section footer carries the same, plus "not intended to solicit
  properties already listed with another broker"
- Equal Housing Opportunity appears on the modal disclaimer as well

Open:

- [ ] Broker permission. See `BROKER-PERMISSION.md`. **This gates the feed going
      live**
- [ ] Attribution wording matched to whatever the broker requires

---

## Financial figures

Every number the site produces is an estimate and says so.

- The payment estimator prints its assumptions on screen: property tax at
  roughly 1.05 percent of price per year and insurance at roughly 1.2 percent,
  both described as Manatee County ballparks and not a quote
- Flood insurance is a separate line rather than buried, with three zone tiers
- The footer of every page states that cost figures anywhere on the site are
  estimates for planning only and are not a quote, a loan offer, or a commitment
  to lend
- Buyers, Sellers, Relocate and New Construction each carry a closing disclaimer
  directing the reader to the appropriate licensed professional
- Sellers page states plainly that an agent valuation is not an appraisal
- No neighborhood price range was invented. 17 of 20 render a visible
  `[[FILL IN]]` rather than a plausible guess

---

## Hero imagery

The hero footage is AI generated and shows a home that does not exist. It is
used purely as atmosphere, the same way agent sites use stock photography.

- Nothing on the site states or implies it is a listing, a sale, or a specific
  Bradenton property
- The watermarked export was discarded and replaced with a clean licensed one
- If any caption, alt text, or copy is ever added that could read as a claim
  about a real property, that becomes a 61J2-10.025 problem. The current alt
  text describes the scene generically and should stay that way

---

## Not legal advice

This file is a build record, not a legal opinion. Before launch, Jennifer's
broker should review the site, and anything touching disclosure obligations,
IDX rights, or advertising compliance should get a look from someone licensed to
give that advice in Florida.
