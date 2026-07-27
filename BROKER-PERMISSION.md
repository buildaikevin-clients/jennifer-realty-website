# Listings: why this site does not host them

**Decision: the site links to Jennifer's brokerage search rather than
republishing listing data. No permission request is needed, and no scraper
exists.** Recorded 2026-07-26.

---

## What the research found

The original plan was to scrape Preferred Shore's public site the way
`kevin-vaz-realty-website` scrapes HomeSmart. Looking at the actual site changed
that. Three findings, in order of how much they matter:

**1. The data is licensed IDX, not public listings.**
Preferred Shore's site is fed by **MLS Grid**, carrying Stellar MLS data, which
their pages identify by its former name, MFR MLS. Their own footer says the
listings come through "the Internet Data Exchange program of MFR MLS".

**2. It is actively policed.**
The site publishes a DMCA takedown procedure and a contact address,
`DMCAnotice@MLSGrid.com`. That is not boilerplate. It is an enforcement channel
for exactly the thing scraping would have done, and the exposure would land on
Jennifer's license and on her broker, not on the website.

Broker permission would not have solved this. Preferred Shore does not own the
redistribution right either. Stellar MLS does, and MLS Grid administers it, so
the brokerage cannot grant what it does not hold.

**3. There was nothing of hers to show anyway.**
Her agent record on their system lists `mylistings: []`. Every one of the 25
listings on that site belongs to another Preferred Shore agent. A scraper would
have filled her personal site with colleagues' inventory, which is a marketing
problem before it is a legal one.

---

## What the site does instead

The listings section is a handoff panel pointing at
**`jenniferbarragan.preferredshore.com`**, her own brokerage subdomain.

This is better than scraping on every axis that matters:

- **Compliant.** It is a licensed IDX search, operated by the brokerage that
  holds the license.
- **Current.** A live feed rather than a weekly copy that goes stale.
- **Complete.** Every listing in the MLS, not a sample of whatever parsed.
- **Hers.** It is her subdomain, so searches there are attributed to her. A
  scraped grid on this site would have sent her nothing.
- **Free.** No IDX vendor fee, no maintenance, nothing to break.

Implementation lives in `js/main.js`: `BROKER_SEARCH` holds the URL and
`handoffHTML()` renders the panel. It appears whenever there is nothing of her
own to display, which is the normal state.

---

## When she takes her own listings

Her own listings are hers to advertise. No permission, no IDX feed, no question.

Add them by hand to `data/listings.seed.js`, following the documented shape in
that file. The carousel returns automatically and the handoff panel steps aside.
`listingBroker` should be left out for her own listings and filled in for
anyone else's.

---

## If a full search on this domain is ever wanted

The only legitimate route is a proper IDX feed licensed to this domain:

1. Jennifer's broker applies to Stellar MLS for IDX access for the new site.
2. A vendor delivers it. IDX Broker, Showcase IDX and Realtyna are the usual
   options, and each carries a monthly fee.
3. Display then has to follow Stellar's Article 19: attribution on every
   listing, a refresh cadence, and honoring listing level opt outs.

Weeks of lead time and an ongoing cost, for something the handoff already
achieves. Worth revisiting only if she wants search traffic landing on her own
domain rather than the brokerage's.

---

## Do not

- Scrape `preferredshore.com` or any of its agent subdomains.
- Copy listing photos from `d36xftgacqn2p.cloudfront.net`, which is their
  MLS photo CDN.
- Reintroduce `scraper/`. It was written, then deleted once these findings came
  in. It is in git history at `7833163` if anyone needs to see what it did.
