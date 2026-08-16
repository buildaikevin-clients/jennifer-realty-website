# SEO and AI Visibility Checklist. Jennifer Barragan

The live status document. Update it when anything below changes state.
Modeled on kevin-vaz-realty-website/seo/SEO-CHECKLIST.md, adapted to Florida,
Preferred SHORE, and this site.

Last updated: 2026-08-16

## The one line summary

On page work is largely DONE and strong. Everything off page is NOT STARTED:
no domain pointed, no Google Business Profile, no reviews, no citations, no
Search Console, empty sameAs. Off page is where all the remaining value is.

## Done

- [x] Titles, descriptions, canonicals, OG and Twitter cards on every page
- [x] RealEstateAgent + Person + WebSite schema on the home page, with
      license SL3586445 and knowsAbout
- [x] BreadcrumbList + FAQPage on subpages, Place + GeoCoordinates + FAQPage
      on all 20 neighborhood pages
- [x] robots.txt, generated sitemap.xml, llms.txt
- [x] Four long guides with Article + FAQPage + BreadcrumbList schema, answer
      first summary paragraphs, and stable section anchors
      (guides/ directory, built 2026-08-16)
- [x] Guide hub with CollectionPage schema (guides.html)

## Blocking everything else

- [ ] **Domain.** Every canonical still reads [[DOMAIN]] until
      scripts/set-domain.js runs with a real host. Netlify subdomain first,
      real domain when bought. Nothing is indexable before this.
- [ ] **Netlify form notifications ON.** Not SEO, but it is the single
      highest value click in this whole folder. Until it is on, every lead
      is silently lost.

## Off page, in priority order

1. [ ] Google Business Profile created and verified.
       See google-business-profile-setup.md. Verification takes 3 to 7 days,
       so START THIS FIRST and do other work while it processes.
2. [ ] First reviews requested. See review-requests.md. Target 10 to 15.
       Reviews move the map pack AND the answers AI chats give. Nothing else
       on this list pays better per minute spent.
3. [ ] Google Search Console verified, sitemap submitted, indexing requested
       on / and the four guides. See search-console-setup.md.
4. [ ] Bing Webmaster Tools imported from GSC. Bing feeds Copilot and part
       of ChatGPT search.
5. [ ] Tier 1 citations: Preferred SHORE agent page (exists already, get the
       URL), Zillow, Realtor.com. See directory-citations.md.
6. [ ] sameAs populated in index.html as each profile goes live. It is []
       today, which means the site claims an identity nothing corroborates.
       Order: GBP share URL, brokerage page, Zillow, Realtor.com, socials.
7. [ ] Social profiles added to llms.txt as they are created.

## Decisions needed from Jennifer or Kevin

- [ ] Phone number: (205) 790-7560 is an Alabama area code on a Florida
      agent. Fine to keep, but if she ever wants a 941 number, switching
      BEFORE citations are built is cheap and after is expensive. Decide
      once, now.
- [ ] Domain purchase. jenniferbarragan.com preferred.
- [ ] REALTOR membership confirmed current (the mark is on every page).
- [ ] License number verified on myfloridalicense.com. The SL prefix on
      SL3586445 was inferred, and it is published in schema.

## AI visibility test panel

Run monthly, record results here with dates. Ask ChatGPT, Perplexity,
Gemini, and Google AI Overviews:

1. "who is a good realtor in Bradenton Florida"
2. "who is a good realtor in Lakewood Ranch"
3. "realtor in Bradenton who speaks Spanish"
4. "I want to relocate to the Bradenton area, who should I talk to"
5. "what is a CDD fee in Lakewood Ranch"
6. "do I need flood insurance in Bradenton"
7. "how much is homeowners insurance in Bradenton Florida"
8. "best real estate agent for investment property in Manatee County"

Record: named / cited / absent, and which URL if cited.

| Date | Engine | Query # | Result |
|---|---|---|---|
| (baseline pending domain) | | | |

## Measurement

- Search Console: impressions on /guides/ pages are the leading indicator.
  Guides rank on long tail questions for months before clicks arrive.
- The lead sheet: the guide and source columns answer which keyword and
  which platform each lead came from. That is the number that matters.
- Netlify Analytics (if enabled later): watch referrers for chatgpt.com,
  perplexity.ai, gemini.google.com, copilot.microsoft.com. Server side, so
  it sees AI referrers that client tags miss.
