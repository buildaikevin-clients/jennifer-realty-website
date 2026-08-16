# Google Business Profile Setup. Jennifer Barragan

Ported from kevin-vaz-realty-website/seo/google-business-profile-setup.md and
rewritten for Jennifer. For a local agent this profile is the single biggest
driver of Google visibility (map pack, knowledge panel) AND of AI chat
citations: when ChatGPT or Perplexity answer "who is a good realtor in
Bradenton", they lean on profile data and reviews.

I cannot create this. It needs Jennifer's Google account and identity
verification, which runs 3 to 7 days by video. Everything below is prepared
so she can click through it in one sitting.

## Before starting

- Use her real Google account, the one she will keep forever. The profile
  lives and dies with it.
- Have ready: a headshot, 10 to 15 photos (see photo list below), and her
  license details.

## The address decision, already made. Read this before the form.

**Set it up as a service area business with the address HIDDEN.**

The same decision was settled for Kevin on 2026-08-13, and Jennifer's case
is stronger:

1. The brokerage office is at 50 S. Lemon Ave. Ste 302, **Sarasota**. Her
   market is **Bradenton, Lakewood Ranch, and Manatee County**. A Sarasota
   pin aims her map visibility at the wrong city.
2. It is not her address to claim. Preferred SHORE has or will have its own
   profile at that suite, and duplicate pins at one address invite
   suspension review.
3. Google requires a verification address but never has to display it. Use
   her home address in Lakewood Ranch for verification and hide it. Privacy
   note for Jennifer: the address is never shown publicly, but it does sit
   in Google's records. Her call, and the alternative (the office address)
   is worse for ranking and not hers to use.

The Sarasota office address stays in the site footer and schema. No
conflict: the public NAP identifies the brokerage as 61J2-10.025 requires,
while the hidden verification address is only plumbing.

## Field values, verbatim

| Field | Value |
|---|---|
| Business name | Jennifer Barragan, REALTOR® |
| Primary category | Real estate agent |
| Additional category | Real estate consultant |
| Business type | Service area business, address hidden |
| Phone | (205) 790-7560 (or the 941 number if that decision changes, decide BEFORE creating) |
| Website | the live site URL (after set-domain.js has run) |
| Hours | By appointment, or her real working hours |
| Opening date | The year her FLORIDA license was issued (verify on DBPR), not 2006 |
| Languages | English, Spanish |

Do NOT put keywords or the brokerage in the name field. "Jennifer Barragan
Bradenton Realtor Preferred SHORE" style names risk suspension and compete
with the brokerage's own profile. The name is her name.

Service areas (Google allows up to 20, use the real ones): Bradenton,
Lakewood Ranch, Anna Maria Island, Holmes Beach, Bradenton Beach, Longboat
Key, Cortez, Palmetto, Parrish, Ellenton, Sarasota, Manatee County,
Sarasota County.

## The description (749 characters, counted; paste as one block)

> Jennifer Barragan is a licensed Florida REALTOR® with Preferred SHORE Real
> Estate, working across Bradenton, Lakewood Ranch, Anna Maria Island and
> Manatee County. Licensed since 2006 in Georgia, Alabama and now Florida,
> her background spans residential sales, property management, new
> construction and relocation. She invests in real estate herself, so she
> reads a home for value and potential rather than only for the sale, and
> she works in English and Spanish. Buyers get straight guidance on flood
> zones, what a Florida homeowners policy costs, condominium reserve and
> milestone inspection rules, and CDD assessments. Sellers get a price built
> from closed comparable sales and an estimated net sheet before anything is
> signed.

## Photos, 10 to 15

- The professional headshot (also needed for the site: assets/jennifer-headshot.jpg)
- Her working: with clients, at closings (with permission), at properties
- The areas she serves: Bradenton riverfront, Lakewood Ranch, the beaches
- NO stock photography. Google can and does remove it, and it reads false.

## Verification

Google will almost certainly require video verification for a service area
agent profile: a live video showing her license, her workspace, and proof of
the address. It takes 3 to 7 days to clear. Start it and do other work.

## The minute it goes live

1. Grab the short share URL (Profile > Share). 
2. Add it to `sameAs` in index.html (first entry) and to llms.txt.
3. Start review requests the same week: see review-requests.md.
4. Post a Google Update weekly. A new guide, a closed sale (no address
   without client permission), a market note. Active profiles rank higher,
   and the guides give her a post every week for a month with zero new
   writing.

## Ongoing, monthly

- Answer every question in the Q&A tab (she can seed it with real questions
  buyers ask, and answer them herself).
- Reply to every review within a day or two.
- Keep hours and phone current. Any NAP change here must also change on the
  site, Zillow, Realtor.com, and Bing the same week. Identical everywhere is
  the whole game. See directory-citations.md.
