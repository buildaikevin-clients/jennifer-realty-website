# Broker permission for listing display

**Status: NOT YET REQUESTED.** The scraper is built but will not run until
configured, and the feed should not go live publicly until this is answered in
writing.

---

## Why this exists

The site displays listings pulled from the brokerage's public website. That is
a different thing from an authorized IDX feed, and it matters here more than it
would in most markets.

Bradenton sits in [Stellar MLS](https://www.stellarmls.com/distribution)
territory. Stellar's Article 19 governs IDX display and it is stricter than many
MLSs: consent, attribution, refresh frequency, and honoring listing level opt
outs are all specified. Scraped data does not satisfy those rules regardless of
where the HTML was fetched from, and the exposure lands on Jennifer's license
and on her broker, not on the website.

Two acceptable outcomes:

1. **The broker authorizes it in writing** and confirms what attribution and
   refresh cadence they require. Record the answer below.
2. **A proper IDX feed is set up** through the broker, usually via a vendor such
   as IDX Broker, Showcase IDX or Realtyna. Slower and it costs a monthly fee,
   but it is the clean path and it removes the question permanently.

Until one of those happens, the site runs on `data/listings.seed.js`, which
Jennifer can maintain by hand for her own listings. That is fully compliant,
because they are her listings.

---

## Draft request

Send from Jennifer, not from Kevin. Fill the brackets first.

> Subject: Permission to display brokerage listings on my agent website
>
> Hi [[broker name]],
>
> I am putting up a personal agent website and I would like to display our
> brokerage's active listings on it, in addition to my own.
>
> Before I turn that on I want to make sure I am doing it the way you want it
> done. Three questions:
>
> 1. Do I have your permission to display our brokerage's listings on my site?
> 2. Do we have an IDX feed through Stellar MLS I should be using instead? If
>    we do, who administers it and how do I get access?
> 3. What attribution and disclaimer language do you want on each listing?
>
> The site already shows the listing brokerage on every property, states that
> information is deemed reliable but not guaranteed and subject to change or
> prior sale, and carries the Equal Housing Opportunity statement. I would
> rather match your preferred wording exactly than guess at it.
>
> Happy to hold off entirely until you have had a chance to look.
>
> Thank you,
> Jennifer

---

## Answer

Record the response here. Date it. If permission comes verbally, follow up with
an email confirming it and paste that thread in, because "he said it was fine"
is not a defense.

- **Date asked:**
- **Date answered:**
- **Answered by:**
- **Permission granted:** yes / no / use IDX instead
- **Required attribution wording:**
- **Required refresh cadence:**
- **Notes:**

---

## Checklist before turning the feed on

- [ ] Written permission recorded above, or an authorized IDX feed in place
- [ ] `scraper/scrape.js` CONFIG.broker filled in
- [ ] Attribution wording on the listing modal matches what the broker requires
      (it is set in `js/main.js`, in the `#modal-disclaimer` block)
- [ ] Refresh cadence matches what was agreed. The scheduled task currently runs
      weekly, which is slower than most IDX rules allow
- [ ] A route exists for removing a listing quickly if a seller opts out
