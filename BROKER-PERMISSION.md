# Listings: where they come from and what the risk is

**Current state, updated 2026-07-27.** A scraper exists at `scraper/scrape.js`.

- **Default run pulls only Jennifer's own listings.** Zero risk. An agent may
  always advertise her own inventory.
- **`--agency` also pulls the brokerage's listings.** Kevin asked for this
  knowingly after the risk below was raised twice. It is opt in rather than
  default for that reason.
- When there is nothing to show, the site falls back to a handoff panel pointing
  at her brokerage search, which is always compliant.

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

## How the scraper works, and what it respects

One request to `jenniferbarragan.preferredshore.com/` gets everything. The page
embeds a complete `account_info` JSON blob holding `mylistings`, `soldlistings`
and `agencylistings`, so there is no need to crawl search results.

That matters, because their robots.txt **disallows** the search endpoints:

```
Disallow: /index.php?advanced=1
Disallow: /index.php?quick=1
```

The scraper never touches those. It reads the subdomain root and individual
`/property/` pages, both of which are allowed. It waits 1500ms between requests
and caps gallery fetches at 30.

Every listing that is not hers carries `listingBroker`, naming the listing agent
and the brokerage, and the modal prints it. Her own listings leave it empty
because attribution to herself would be nonsense.

## If a takedown ever arrives

Do not argue it. Run `node scraper/scrape.js` without `--agency`, which strips
the brokerage listings and leaves only hers, then redeploy. The handoff panel
takes over automatically and the site is immediately compliant. Reply to
`DMCAnotice@MLSGrid.com` confirming removal.

Keeping that path one command away is the whole reason `--agency` is a flag
rather than the default.
