# Directory Citations. Jennifer Barragan

Ported from kevin-vaz-realty-website/seo/directory-citations.md. Citations
are the corroboration layer: Google and every AI engine decide whether
"Jennifer Barragan, Bradenton realtor" is a real entity by checking that the
same name, phone, and brokerage appear independently in many places.

## THE golden rule: identical NAP everywhere, character for character.

The canonical block. Copy from here, never retype:

```
Jennifer Barragan, REALTOR®
Preferred SHORE Real Estate
(205) 790-7560
jenniferbarragan.re@gmail.com
[site URL once live]
Florida Real Estate License SL3586445
Service area: Bradenton, Lakewood Ranch, Anna Maria Island, Manatee County, Florida
```

If the phone number decision (205 vs a new 941 number) is still open, DO NOT
BUILD ANY CITATION until it closes. Changing a phone number after citations
exist invalidates all of them and is the classic cause of local ranking
decay. See SEO-CHECKLIST.md.

## Short bio (for directory profiles with a small field)

> Florida REALTOR® with Preferred SHORE Real Estate serving Bradenton,
> Lakewood Ranch, Anna Maria Island and Manatee County. Licensed since 2006.
> Buyer, seller, relocation and investment work, in English and Spanish.

## Long bio (for profiles with room)

Use the Google Business Profile description from
google-business-profile-setup.md so the two never drift.

## Tier 1: do these first, they feed everything

| Directory | Why | URL when done |
|---|---|---|
| Google Business Profile | The anchor. Everything matches against it | |
| Preferred SHORE agent page | Already exists at jenniferbarragan.preferredshore.com. Verify the NAP on it matches the block above and get the canonical URL | |
| Zillow agent profile | Largest consumer surface, has reviews | |
| Realtor.com agent profile | Auto seeded from NAR membership, claim it | |

## Tier 2: the profiles she already needs for the video funnel

The video content plan creates these anyway. Each one is also a citation and
a sameAs entry. Use the canonical NAP in every bio field.

| Platform | Note | URL when done |
|---|---|---|
| Instagram | Business account, category Real Estate Agent | |
| Facebook business page | Not her personal profile | |
| YouTube | Channel about section carries the NAP | |
| TikTok | Business account | |
| LinkedIn | | |

## Tier 3: worth an hour once Tiers 1 and 2 exist

| Directory | Why | URL when done |
|---|---|---|
| Bing Places | Feeds Bing, Copilot, and partly ChatGPT search | |
| Apple Business Connect | Apple Maps | |
| Yelp | Low real estate value, high entity value | |
| Nextdoor business page | Local presence | |

## The wire back step, after each profile goes live

1. Paste its URL into the table above.
2. Add it to `sameAs` in index.html.
3. Add it to llms.txt under her links.

An empty sameAs means the site asserts an identity nothing corroborates.
Every row completed here makes every other row worth more.

## Consistency checklist before saving any profile

- [ ] Name exactly: Jennifer Barragan (profile name), REALTOR® where a
      title field exists. Never "Jenny", never with the brokerage in the
      name field.
- [ ] Phone exactly as the canonical block.
- [ ] Brokerage exactly: Preferred SHORE Real Estate (SHORE capitalized).
- [ ] Service area listed, not a street address, except where a form
      demands one (use the Sarasota office and mark it as the broker
      address if the field allows).
- [ ] License: SL3586445 (verify on myfloridalicense.com first, the prefix
      was inferred).
- [ ] Photo: the same professional headshot everywhere.
