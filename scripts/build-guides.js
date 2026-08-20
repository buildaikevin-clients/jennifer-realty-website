#!/usr/bin/env node
/* =============================================================================
   build-guides.js — the guide system and the video funnel behind it.

   Ported from kevin-vaz-realty-website/scripts/build-guides.js and adapted to
   this site's rules. One file, three outputs, all committed:

     guides/<slug>.html   The guides themselves. Public, indexable, first
                          person, full schema. These earn search and answer
                          engine visibility and every one ends in a call to
                          action.
     guides.html          The hub. CollectionPage schema, one card per guide.
     g/<keyword>.html     The gated landing pages Jennifer sends in a DM after
                          someone comments a keyword on a video. noindex, not
                          in the sitemap, one form: name, phone, email, all
                          required. The form posts to Netlify Forms as
                          "guide-request" and to /.netlify/functions/lead for
                          delivery. netlify.toml maps /g/<keyword> to each.

   Also rewrites a marked region on index.html, buyers.html, sellers.html and
   relocate.html with generated guide cards, between:
     <!-- guide-cards:start ... -->  and  <!-- guide-cards:end -->
   Edit the GUIDES data, not the cards.

   Kevin's script carries its own dash check. This one does NOT: copy-lint.js
   is stricter (dashes plus AI tells plus fair housing) and check-links.js
   already verifies every relative reference. Both are run at the end and a
   failure in either fails this build. That means preexisting lint debt
   anywhere in the repo blocks a guide build. That is intended.

   Chrome (head, nav, footer) is shared with build-neighborhoods.js via
   lib/chrome.js. Landing pages use their own slim chrome on purpose: no nav,
   noindex robots, and the firm name adjacent to every contact point, which
   61J2-10.025 requires.

   Run:  node scripts/build-guides.js
   Then: node scripts/build-sitemap.js   (guides enter the sitemap, g/ stays out)
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');

const DOMAIN = 'jenniferbarragan.com';
const SITE = `https://${DOMAIN}`;

const { esc, jsonEsc, head, nav, footer } = require('./lib/chrome')({ DOMAIN });

const UPDATED = 'August 2026';
const PUBLISHED = '2026-08-16';

/* ========================================================================= */
/* DATA — the four guides. One DM keyword each.                              */
/*                                                                           */
/* Copy rules apply to every string here: first person, no hyphens or        */
/* dashes, no AI tells, no fair housing coded language. copy-lint.js is the  */
/* referee and it runs at the end of this build.                             */
/*                                                                           */
/* faq entries: q and a are Jennifer speaking on the page. schemaA is the    */
/* same answer rewritten in third person for the JSON-LD, because a search   */
/* result quotes it away from the page where first person reads oddly.       */
/* ========================================================================= */

const GUIDES = [

  /* ----------------------------------------------------- RELOCATE ------- */
  {
    slug: 'relocating-to-lakewood-ranch',
    keyword: 'relocate',
    title: 'Relocating to Lakewood Ranch, Sarasota and Bradenton | The Full Guide | Jennifer Barragan',
    desc: 'How to move to Lakewood Ranch, Sarasota, Bradenton, or the islands from out of state: choosing an area, what ownership really costs, and the order to do everything in.',
    h1: 'Relocating to Lakewood Ranch, Sarasota and Bradenton',
    lede: 'Everything I explain on relocation calls, written down. Where to look, what it costs to own here, and the order to do things in so nothing expensive surprises you.',
    crumbLast: 'Relocating',
    headline: 'Relocating to Lakewood Ranch, Sarasota and the Florida Gulf Coast',
    schemaDesc: 'A relocation guide to Lakewood Ranch, Sarasota, Bradenton, and the Gulf Coast: choosing an area, insurance and flood costs, CDD fees, and the sequence of a move from out of state.',
    areaServed: 'Lakewood Ranch, Sarasota, Bradenton, Anna Maria Island, Manatee County, Sarasota County, Florida',
    cardKicker: 'For people moving here',
    cardBlurb: 'Where to look, what owning here really costs, and the order to do everything in when you are moving from out of state.',
    promoteOn: 'relocate.html',
    parent: { label: 'Relocating', href: '../relocate.html' },
    landingH1: 'The Lakewood Ranch and Sarasota Relocation Guide',
    landingLede: 'You asked for it, here it is. Tell me where to send it and it is yours. You will land on the full guide the moment you hit the button, and a copy arrives by email so you can find it again later.',
    landingBullets: [
      'Every area from Lakewood Ranch to the barrier islands and what homes run in each',
      'What insurance, flood zones, and CDD fees really add to a monthly payment',
      'The exact order to do things in so you never fall in love with a house you cannot insure',
      'The paperwork side: driver license, registration, and the homestead exemption',
    ],
    summary: '**The short version:** This stretch of the Gulf Coast is a couple of dozen different markets sharing a handful of names, and the right one for you depends on how you actually live. Ownership costs more than the mortgage here, because insurance, flood risk, and CDD fees ride along with it. Do things in this order: talk to a lender, get an insurance quote on any serious candidate, then buy the house. This guide covers all of it.',
    sections: [
      { id: 'areas', toc: 'Choosing an area',
        h2: 'Two counties, a couple of dozen different markets',
        blocks: [
          { p: 'People tell me they are moving to the Sarasota area, and my first question is always the same: which part of it? Lakewood Ranch and Anna Maria Island sit forty minutes apart and behave like different states. One is master planned villages east of the interstate, builder contracts, and CDD assessments on the tax bill. The other is coastal flood zones, older cottages beside elevated new builds, and rental rules that change block by block. Picking between them is most of the work, and it is the part a listing site cannot do for you.' },
          { p: 'The broad strokes, in the order people usually ask me about them. **Lakewood Ranch** is where most relocations land: master planned villages straddling the Manatee and Sarasota county line, newer homes, amenities built in, and a CDD line on almost every tax bill. **Sarasota** is the cultural end of the market, downtown and the arts, with the shortest reach to Siesta Key and Longboat Key and prices that climb sharply as you approach the water. **Bradenton** is older mainland Florida housing between the city and the bridges, the closest you get to the sand without paying island prices. The **barrier islands**, Anna Maria, Holmes Beach, Bradenton Beach and Longboat Key, carry the highest prices and the highest carrying costs of anywhere on this list. North of the river, Palmetto, Parrish, and Ellenton hold the most house per dollar and the longest drives to a beach.' },
          { p: 'I keep a full page on most of these areas on this site, with what was built there, what it runs, and what to check before buying. Start with [the neighborhoods hub](../neighborhoods.html) once you have read this, and ask me directly about anything it does not cover yet.' },
        ] },
      { id: 'costs', toc: 'The real cost of owning',
        h2: 'What owning here actually costs',
        blocks: [
          { p: 'The sticker price is the beginning of the math, not the end of it. A Florida monthly payment has parts that surprise people from other states, and I would rather you meet them on this page than at a closing table.' },
          { list: [
            '**Homeowners insurance.** Priced per address, mostly on the roof: its age, its shape, and its wind rating. A house with a roof past fifteen years can be hard to insure at any price. Quote insurance on any house you get serious about, before the offer.',
            '**Flood insurance.** Separate from homeowners and driven by the flood zone. Zone X is optional coverage and usually costs a few hundred dollars a year. Zones AE and VE are lender required and the elevation certificate decides the number.',
            '**CDD assessments.** Many newer communities, Lakewood Ranch included, carry a Community Development District fee on the tax bill. It funded the roads and amenities and it can run from a few hundred to several thousand dollars a year.',
            '**HOA dues.** On top of a CDD, not instead of it, in many planned communities. Read what they cover, because sometimes that includes cable and lawn care and sometimes it covers almost nothing.',
            '**Property taxes.** Reassessed at purchase, so the seller’s current tax bill is not your future tax bill. Budget from the sale price, not from the listing history.',
          ] },
        ] },
      { id: 'order', toc: 'The right order',
        h2: 'The order to do things in',
        blocks: [
          { p: 'Lender first. Insurance second. House third. Every expensive relocation mistake I have watched happened because someone ran that sequence backward, fell for a house, and then found out what it would cost to insure or that the flood zone killed the loan math.' },
          { p: 'Talking to a lender first tells you your real budget, including taxes and insurance, not the one a national listing site guessed at. Getting an insurance quote on a serious candidate takes a day and can move the monthly cost by hundreds. Only then does an offer make sense. I can connect you with local lenders and insurance agents who do this every day, and none of them charge for the conversation.' },
        ] },
      { id: 'remote', toc: 'Buying from a distance',
        h2: 'How buying from out of state works',
        blocks: [
          { p: 'Most of my relocation clients buy their home before they live here, and the process is built for it now. I preview homes on video call and I am honest about what the camera flatters. Photographs hide road noise, slopes, and the neighbor’s boat. I point those out, because you finding out at the moving truck helps nobody, least of all me.' },
          { p: 'Florida closings do not require you in the room. Documents can be signed remotely or with a mobile notary in your state. Plan one trip for a short list showing weekend if you can. If you cannot, we make it work anyway.' },
          { p: 'One honest option worth naming: renting for six months first. It costs money and moves twice, but if you genuinely do not know which area fits, it is cheaper than buying in the wrong one. I will tell you if I think you are in that situation.' },
        ] },
      { id: 'admin', toc: 'The paperwork side',
        h2: 'Licenses, registration, and homestead',
        blocks: [
          { p: 'Once you are here, Florida gives you 30 days to get a Florida driver license and register your vehicles. Bring more identification than you think you need, and check the current list before you go.' },
          { p: 'The one with real money attached is the homestead exemption. If the home is your permanent residence on January 1, you can apply for an exemption that reduces the assessed value and caps how fast it can rise. File with the property appraiser for the county the home sits in, Manatee or Sarasota, by March 1. Lakewood Ranch spans the line between the two, so check which side your address falls on rather than assuming. It is one form, it is free, and skipping it costs you every year until you notice.' },
        ] },
      { id: 'timing', toc: 'Timing the move',
        h2: 'When to move, and what season changes',
        blocks: [
          { p: 'Inventory and buyer traffic here swell in winter and thin out in late summer. Neither season is wrong to buy in. Winter gives you the most choice and the most competition. Late summer gives you fewer options and more negotiating room, plus an honest look at the weather you are signing up for.' },
          { p: 'If school calendars drive your timing, most buyers aim to close in early summer. That is also when relocation demand peaks, so line up your lender and your search early in spring rather than starting in June.' },
        ] },
    ],
    faqTitle: 'What people moving here ask me',
    faq: [
      { q: 'Do I have to be in Florida to close on a house?',
        a: 'No. Florida closings can be done with remote notarization or a mobile notary in your state. Plenty of my clients get their keys the day they first walk into the house they own.',
        schemaA: 'No. Florida closings can be completed with remote online notarization or a mobile notary in the buyer’s home state, so buyers regularly close before they arrive.' },
      { q: 'How much does homeowners insurance really cost here?',
        a: 'It is priced per address, so honest answers are quotes, not averages. The roof drives most of it: age, shape, and wind rating. I have seen two houses on the same street differ by thousands a year. Quote any serious candidate before you offer, and I can point you to agents who turn quotes around in a day.',
        schemaA: 'Florida homeowners insurance is priced per address, driven mostly by roof age, roof shape, and wind mitigation features. Two similar homes on one street can differ by thousands of dollars a year, so buyers should get a quote on any serious candidate before making an offer.' },
      { q: 'What is a CDD fee and does it ever go away?',
        a: 'A Community Development District fee pays off the bonds that built a community’s roads and amenities, plus ongoing maintenance. The bond part can be paid off or can expire after decades. The maintenance part continues. It shows up on the tax bill, and I always pull the actual number for any home we look at.',
        schemaA: 'A CDD fee repays the bonds that funded a community’s infrastructure plus ongoing maintenance. The bond portion can expire or be paid off after many years, while the maintenance portion continues. It appears on the property tax bill.' },
      { q: 'Should I rent here first before buying?',
        a: 'Sometimes, honestly, yes. If you have never spent time here and cannot say which area fits your life, six months of renting is cheaper than buying wrong. If you know roughly what you want, the market rewards buying when you find the right house rather than waiting.',
        schemaA: 'Renting first makes sense for buyers who have not spent time in the area and cannot yet tell which community fits them. Buyers who already know roughly what they want are usually better served buying when the right house appears.' },
      { q: 'Is the island lifestyle realistic on a normal budget?',
        a: 'Owning on the islands is expensive and the carrying costs are real. But West Bradenton, Palma Sola, and Cortez put you minutes from the sand at a fraction of island pricing, which is exactly why I keep pages on them. Beach life here is more about the drive you accept than the budget you have.',
        schemaA: 'Island ownership carries high prices and high insurance costs, but nearby areas such as West Bradenton, Palma Sola, and Cortez offer short drives to the beach at much lower price points.' },
    ],
    cta: {
      eyebrow: 'Moving here?',
      title: 'Tell me where you are in the process.',
      text: 'Planning a move two years out or under contract next week, it costs nothing to ask. I answer my own phone, I know these areas street by street, and I speak English and Spanish.',
      primary: { label: 'Start the Conversation', href: '../index.html#contact' },
    },
    related: [
      { label: 'Every neighborhood, explained', href: '../neighborhoods.html' },
      { label: 'The buyer process', href: '../buyers.html' },
      { label: 'First time buyer guide', href: 'first-time-home-buyer-florida.html' },
    ],
    legal: 'This guide is general information for people relocating to Manatee and Sarasota counties, Florida, not legal, tax, lending, or insurance advice. Costs and rules change; verify current figures with the relevant provider or agency.',
  },

  /* ------------------------------------------------------- INVEST ------- */
  {
    slug: 'gulf-coast-investment-property',
    keyword: 'invest',
    title: 'Buying an Investment Property on the Gulf Coast | Jennifer Barragan',
    desc: 'How to evaluate a rental or flip in Lakewood Ranch, Sarasota, and Bradenton, from an agent who owns and manages rental property herself.',
    h1: 'Buying a Gulf Coast Investment Property',
    lede: 'I own rentals, I have done the flips, and I still manage property I bought years ago. This is how I evaluate an investment here, written the way I would explain it to a friend.',
    crumbLast: 'Investment Property',
    headline: 'Buying an Investment Property on the Florida Gulf Coast',
    schemaDesc: 'A guide to evaluating investment property in Lakewood Ranch, Sarasota, and Bradenton: rental math, short term rental rules, insurance and flood costs, condominium caveats, and building a local team.',
    areaServed: 'Lakewood Ranch, Sarasota, Bradenton, Anna Maria Island, Manatee County, Sarasota County, Florida',
    cardKicker: 'For investors',
    cardBlurb: 'Rental math, the rules that change street by street, and the line items that kill deals here, from an agent who invests herself.',
    promoteOn: 'buyers.html',
    parent: { label: 'Buyers', href: '../buyers.html' },
    landingH1: 'The Gulf Coast Investment Guide',
    landingLede: 'Here it is: how I evaluate rentals and flips in this market, as an agent who owns and manages rental property myself. Tell me where to send it. You land on the full guide immediately and a copy arrives by email.',
    landingBullets: [
      'The rental math I actually run before I buy anything myself',
      'Short term rental rules on the islands and why they change street by street',
      'The two line items that quietly kill deals here: insurance and flood',
      'What a condo deal needs now that milestone inspections and reserves are law',
    ],
    summary: '**The short version:** I evaluate every property here the same way, and I own what I preach: rentals I still manage and flips I have taken start to finish. The math has to work with real Florida numbers, meaning insurance quoted per address, flood zone verified, CDD fees included, and rental rules read for the exact street. Most deals die in those details. The ones that survive them are worth owning.',
    sections: [
      { id: 'why-here', toc: 'Why this market',
        h2: 'What this market gives an investor',
        blocks: [
          { p: 'I invest here for the same reason my clients do: people keep arriving. Manatee County has years of steady inbound movement from out of state, a tourism economy that fills short term rentals on the coast, and a workforce that rents long term inland. Demand shows up on both ends of the rental spectrum, which gives you a choice of strategy rather than one narrow play.' },
          { p: 'It is not a market where sloppy math gets rescued by appreciation. Insurance costs have repriced the whole state, and a deal that ignores them is not a deal. That is the honest frame for everything below.' },
        ] },
      { id: 'math', toc: 'The rental math',
        h2: 'The math I run before I buy anything',
        blocks: [
          { p: 'Before I get attached to any property, mine or a client’s, I run the same numbers. None of this is exotic. The discipline is in using real local figures instead of national rules of thumb.' },
          { list: [
            '**Real rent, not hoped rent.** Comparable actual leases nearby, not listing asks. I pull these from the MLS, which sees what units actually rented for.',
            '**Insurance, quoted.** Not estimated. An older roof or a coastal address can move the annual premium by thousands and flip a deal from positive to negative on its own.',
            '**Flood zone and flood premium.** Verified for the exact address before the offer. Lender required coverage in AE or VE zones belongs in the math from day one.',
            '**Taxes at your purchase price.** Florida reassesses on sale, and investor owned property gets no homestead cap. The seller’s tax bill tells you nothing.',
            '**CDD and HOA, in full.** Plus what the HOA rules say about leasing at all. Some communities restrict lease terms or require owner occupancy for the first year.',
            '**Vacancy, management, repairs.** I budget them even though I manage my own, because your time is not free either.',
          ] },
          { p: 'If the number at the bottom only works when everything goes right, it does not work. The properties I have kept for years are the ones that penciled with honest inputs.' },
        ] },
      { id: 'str', toc: 'Short term rentals',
        h2: 'Short term rentals: the rules change street by street',
        blocks: [
          { p: 'The coast fills with visitors and the short term rental demand is real. So are the rules, and this is where out of state investors get hurt. Anna Maria Island is three separate cities, each with its own rental ordinance, and minimum stay rules genuinely differ block by block. A property that cash flows beautifully on a weekly calendar can be a money pit on the thirty day minimum that applies two streets over.' },
          { p: 'Never buy a short term rental strategy off a listing description. I verify the exact address against the exact current ordinance, and where the numbers matter I get it in writing from the city. Condos add a second layer: association documents can restrict rentals regardless of what the city allows.' },
        ] },
      { id: 'ltr', toc: 'Long term rentals',
        h2: 'Long term rentals inland',
        blocks: [
          { p: 'My own strategy has mostly been long term, and inland Manatee County suits it. Palmetto, Ellenton, parts of Bradenton, and Parrish rent steadily to people who work here, with lower purchase prices, lower insurance, and none of the rental ordinance risk of the coast. Returns are steadier and duller, which is a compliment in investing.' },
          { p: 'Newer construction rents easily and repairs less, but carries CDD fees and HOA rules that must be read before you offer. Older housing stock west of Interstate 75 buys cheaper and repairs more. I have owned both kinds and there is no universally right answer, only the one that matches your appetite for calls about plumbing.' },
        ] },
      { id: 'condos', toc: 'The condo caveats',
        h2: 'Condos: cheaper to buy, and why',
        blocks: [
          { p: 'Condo prices here can look like bargains next to houses, and sometimes they are. But Florida condo law changed after Surfside. Buildings three stories and taller face milestone structural inspections, and associations must now fund reserves for major repairs rather than waiving them. Buildings that deferred maintenance for decades are handing owners the bill as special assessments, sometimes enormous ones.' },
          { p: 'None of that makes condos uninvestable. It makes the association documents the real inspection. Before I let a client close on a condo, we read the budget, the reserve study, the milestone report if one exists, and the meeting minutes, which is where boards discuss the assessment they have not announced yet. A cheap condo with a huge pending assessment is not cheap.' },
        ] },
      { id: 'killers', toc: 'What kills deals',
        h2: 'The two line items that kill deals here',
        blocks: [
          { p: 'Insurance and flood. Almost every dead deal I have seen an investor walk away from in the last few years died on one of those two lines. A roof past fifteen years can make a property nearly uninsurable at rates that work for a rental. A VE zone premium can exceed the property’s entire monthly cash flow.' },
          { p: 'The defense is boring: quote insurance and verify flood before the offer, on every property, every time. It costs a day. Skipping it can cost the whole deal, or worse, close it and then bleed it.' },
        ] },
      { id: 'team', toc: 'Your local team',
        h2: 'The team that makes remote ownership work',
        blocks: [
          { p: 'Most of my investor clients do not live here. What makes that work is the bench: an agent who runs the numbers with you honestly, a lender who understands investment underwriting, an insurance agent who quotes fast, an inspector who photographs everything, and the tradespeople who show up after closing. I have spent years building that bench for my own properties, and my clients borrow it.' },
          { p: 'This is also where owning property myself changes what I do as an agent. I evaluate a house for value and potential rather than only for the sale, because I have sat on your side of the table with my own money. If a deal does not pencil, I will say so and we will find one that does.' },
        ] },
    ],
    faqTitle: 'What investors ask me',
    faq: [
      { q: 'Is Bradenton good for short term rentals?',
        a: 'The demand is real on and near the coast. The constraint is the rules, which differ by city and sometimes by block, plus association documents on condos. The honest answer for any specific property takes a day of verification, and I do that before an offer, never after.',
        schemaA: 'Coastal Manatee County has strong short term rental demand, but city ordinances differ block by block on Anna Maria Island and condo associations can restrict rentals further. Any specific property should be verified against the current ordinance and association documents before an offer.' },
      { q: 'What return should I expect on a long term rental here?',
        a: 'I will not quote a blanket number, because the honest one depends on price point, area, and how the property is financed and managed. What I will say: deals that pencil with real insurance quotes and real rents still exist here, and I own some. Bring me a budget and I will show you what it buys.',
        schemaA: 'Returns vary widely by price point, area, financing, and management, so blanket figures mislead. Deals that produce positive cash flow with realistic insurance and rent figures still exist in Manatee County at various price points.' },
      { q: 'Do you help investors who live out of state?',
        a: 'Constantly, and I am one in reverse: I still own and manage rentals in Alabama from here. Video walkthroughs, honest condition reports, remote closings, and introductions to my own contractors and managers. Distance is a solved problem if your team is real.',
        schemaA: 'Yes. Remote investors are common in this market, supported by video walkthroughs, remote closings, and local teams for management and repairs.' },
      { q: 'Should I buy a flip or a rental first?',
        a: 'Rentals forgive mistakes slowly. Flips punish them fast. I have done both, and I tell most first time investors to start with a rental unless they have construction experience or a very trusted contractor. A flip here also has to clear insurance and permit realities that surprise people from other states.',
        schemaA: 'Rentals are generally more forgiving for first time investors, while flips demand construction knowledge, reliable contractors, and familiarity with Florida insurance and permitting. Experienced guidance matters more for flips.' },
      { q: 'What does a 1031 exchange look like in this market?',
        a: 'Doable and common, but the clock is real: identification and closing deadlines do not bend. If you are selling elsewhere and buying here, tell me before you list there, so the search here is ready the day your sale closes. Your exchange intermediary and I will keep the calendar honest.',
        schemaA: 'A 1031 exchange into Manatee County property works well when the local search begins before the relinquished property sells, because the identification and closing deadlines are strict.' },
    ],
    cta: {
      eyebrow: 'Run the numbers',
      title: 'Bring me a budget. I will show you what it buys.',
      text: 'I evaluate property here the way I evaluate my own, and the first conversation costs nothing. Tell me the strategy you have in mind and I will tell you honestly whether this market supports it.',
      primary: { label: 'Talk Through a Deal', href: '../index.html#contact' },
    },
    related: [
      { label: 'Every neighborhood, explained', href: '../neighborhoods.html' },
      { label: 'The relocation guide', href: 'relocating-to-lakewood-ranch.html' },
      { label: 'Preparing a home to list', href: 'preparing-your-home-to-list.html' },
    ],
    legal: 'This guide is general information about investment property in Manatee County, Florida, not investment, legal, tax, lending, or insurance advice. Rental ordinances, condominium law, and insurance markets change; verify every figure and rule for a specific property before acting.',
  },

  /* -------------------------------------------------------- BUYER ------- */
  {
    slug: 'first-time-home-buyer-florida',
    keyword: 'buyer',
    title: 'First Time Home Buyer Guide for Florida | Jennifer Barragan',
    desc: 'Buying your first home in Lakewood Ranch, Sarasota, or Bradenton: what you really need saved, the process step by step, and the Florida specifics nobody warns you about.',
    h1: 'Your First Home, Start to Finish',
    lede: 'Nobody is born knowing how this works. This is the whole process in plain language, including the Florida parts that surprise people, written so you can walk in prepared.',
    crumbLast: 'First Time Buyers',
    headline: 'The First Time Home Buyer Guide for the Bradenton Area',
    schemaDesc: 'A step by step guide for first time home buyers in Lakewood Ranch, Sarasota, and Bradenton, Florida: down payment realities, preapproval, the true monthly payment, inspections, insurance, and closing.',
    areaServed: 'Lakewood Ranch, Sarasota, Bradenton, Palmetto, Manatee County, Sarasota County, Florida',
    cardKicker: 'For first time buyers',
    cardBlurb: 'What you really need saved, the process step by step, and the Florida costs nobody warns first time buyers about.',
    promoteOn: 'buyers.html',
    parent: { label: 'Buyers', href: '../buyers.html' },
    landingH1: 'The First Time Buyer Guide',
    landingLede: 'The whole process in plain language, including the parts about Florida that surprise people. Tell me where to send it. The full guide opens immediately and a copy lands in your email.',
    landingBullets: [
      'What you actually need for a down payment, versus what people assume',
      'Every piece of the real monthly payment: loan, taxes, insurance, and fees',
      'The Florida specifics: flood zones, insurance quotes, and the homestead exemption',
      'What happens between offer and keys, step by step, with no jargon',
    ],
    summary: '**The short version:** You likely need less down than you think and more process than you expect. Get preapproved before you shop, budget the full monthly payment rather than the loan alone, and in Florida always quote insurance and check the flood zone before you offer. From accepted offer to keys typically runs about thirty to forty five days. This guide walks every step.',
    sections: [
      { id: 'money', toc: 'The money, honestly',
        h2: 'What you actually need saved',
        blocks: [
          { p: 'The twenty percent down payment is the most persistent myth in real estate. Conventional loans exist with three percent down for first time buyers. FHA asks three and a half. VA and USDA can reach zero for those who qualify. Putting less down means mortgage insurance rides along until you build enough equity, which is a real cost, but it is a known and often worthwhile one.' },
          { p: 'What you do need beyond the down payment: closing costs, which typically run a few percent of the price, plus an honest cushion. The inspection, the appraisal, and the insurance binder all get paid before closing. Florida Housing and local programs offer down payment assistance to eligible buyers, and lenders here know which ones are funded right now. Asking costs nothing.' },
        ] },
      { id: 'preapproval', toc: 'Preapproval first',
        h2: 'Preapproval comes before the search',
        blocks: [
          { p: 'A preapproval is a lender examining your income, credit, and savings, then stating what they will lend. It is not a commitment to buy anything. It is the difference between shopping and browsing, and in a market where good houses attract several offers, sellers do not take offers seriously without one.' },
          { p: 'It also protects you from heartbreak. The saddest conversations in this business happen when someone falls for a house before learning their real budget. Talk to a lender first. I can introduce you to several local ones who explain things patiently and compete for your business, and the conversation is free.' },
        ] },
      { id: 'payment', toc: 'The real monthly payment',
        h2: 'The real monthly payment has five parts',
        blocks: [
          { list: [
            '**Principal and interest.** The loan itself. The number every online calculator shows you.',
            '**Property taxes.** Reassessed when you buy, so estimate from the purchase price, not from what the seller currently pays. The homestead exemption below softens this over time.',
            '**Homeowners insurance.** The Florida wildcard, priced per address and driven by the roof. Quote it on any house you get serious about, before the offer.',
            '**Flood insurance, sometimes.** Required by lenders in high risk zones, optional but often smart in Zone X. Check the zone before falling for the house.',
            '**HOA or CDD fees, sometimes.** Many newer communities carry one or both. They belong in your monthly math from the first showing, not discovered at closing.',
          ] },
          { p: 'When we look at homes together, I run this full number for anything you like. A house that fits at the loan payment and breaks at the real payment is not your house, and it is my job to say so early.' },
        ] },
      { id: 'florida', toc: 'The Florida parts',
        h2: 'The parts that are specifically Florida',
        blocks: [
          { p: 'Three things surprise first time buyers from elsewhere. First, insurance is a search step here, not an afterthought. A quote takes a day and can change which house you buy. Second, flood zones are property specific and public: we check the exact address, not the neighborhood’s reputation. Third, the homestead exemption is real money: once the home is your permanent residence, filing one free form with the county reduces your assessed value and caps how fast it can rise. File it by March 1 after you move in. I remind every client, because forgetting it costs money every single year.' },
          { p: 'Also worth knowing: Florida closings are commonly handled by title companies rather than attorneys, hurricane season does not stop closings but can delay insurance binding when a storm is named, and new construction contracts are builder written and worth reading with someone on your side of the table.' },
        ] },
      { id: 'process', toc: 'Offer to keys',
        h2: 'From offer to keys, step by step',
        blocks: [
          { p: 'When you find the house, we write an offer: price, deposit, timelines, and what stays with the home. The seller accepts, counters, or declines, and negotiation is normal rather than hostile. Once signed, your deposit goes into escrow and the clock starts.' },
          { p: 'The inspection happens in the first week or so. Every house has findings, including new ones. What matters is the size of the findings, and we negotiate repairs or credits where they are real. Your lender orders an appraisal, you finalize the loan and the insurance, and the title company verifies the seller can actually convey what they are selling. Then closing day: you wire funds, sign more times than seems reasonable, and walk out holding keys. Thirty to forty five days, most of the time, from accepted offer to that moment.' },
        ] },
      { id: 'mistakes', toc: 'Avoidable mistakes',
        h2: 'The mistakes I watch first time buyers make',
        blocks: [
          { list: [
            'Opening new credit between preapproval and closing. The lender checks again before funding. New car, new furniture on credit, new card: any of them can sink the loan at the finish line.',
            'Skipping the insurance quote until under contract, then meeting a premium that breaks the budget with the deposit already committed.',
            'Waiving inspection to win a bidding war. There are better ways to make an offer strong, and I would rather lose a house than have you buy a disaster blind.',
            'Draining every dollar into the down payment and closing with nothing left. Owning a home means owning its surprises. Keep a cushion.',
            'Not filing homestead. One form, real savings, deadline of March 1. I will nag you about it, cheerfully.',
          ] },
        ] },
    ],
    faqTitle: 'What first time buyers ask me',
    faq: [
      { q: 'How much do I really need for a down payment?',
        a: 'Less than the myth says. Three percent conventional and three and a half FHA are the common floors, with zero down VA and USDA for those who qualify. On a three hundred thousand dollar home, three percent is nine thousand dollars. Closing costs come on top, and assistance programs exist. Talk to a lender before deciding you cannot afford to.',
        schemaA: 'Many first time buyers qualify with three percent down on conventional loans or three and a half percent on FHA, with zero down available through VA and USDA for eligible buyers. Closing costs add a few percent, and Florida down payment assistance programs can help eligible buyers.' },
      { q: 'What credit score do I need to buy a house?',
        a: 'Lower than perfect. FHA can work in the upper five hundreds, conventional generally wants six twenty and up, and better scores buy better rates. If your score needs work, a good lender will tell you exactly what to fix and how long it takes. That conversation is free and does not hurt your credit.',
        schemaA: 'FHA loans can be available with scores in the upper 500s and conventional loans generally start around 620, with better rates at higher scores. Lenders can outline specific steps for buyers whose scores need improvement.' },
      { q: 'How long does buying a house take?',
        a: 'From accepted offer to keys, usually thirty to forty five days. The search before that is yours to pace: some clients find their house the first weekend, others look for months. Both are normal and I do not rush either kind.',
        schemaA: 'The period from accepted offer to closing typically runs thirty to forty five days. The search phase before an offer varies by buyer, from a single weekend to several months.' },
      { q: 'Do I need my own agent, and what does it cost me?',
        a: 'The listing agent works for the seller. You want someone contractually on your side, reading builder contracts and inspection reports with your interests, not theirs. Compensation is discussed and agreed in writing up front, and in many transactions the seller’s side contributes toward it. Ask me directly and you will get the arithmetic, not a dodge.',
        schemaA: 'A buyer’s agent represents the buyer’s interests, while the listing agent works for the seller. Buyer agent compensation is agreed in writing up front, and sellers frequently contribute toward it as part of the transaction.' },
      { q: 'Should I buy new construction or an existing home?',
        a: 'New construction gives you a fresh roof, which matters enormously for insurance here, plus builder warranties, in exchange for CDD fees in most new communities and a builder written contract. Existing homes buy you established areas and mature trees, and sometimes a roof that needs replacing sooner. I walk both with clients constantly, and the builder’s sales office does not represent you. Bring me: it costs you nothing and changes the conversation.',
        schemaA: 'New construction offers newer roofs, which lowers insurance costs, and warranties, but usually carries CDD fees and builder written contracts. Existing homes offer established locations with potentially older roofs and systems. A buyer’s agent can represent the buyer in either purchase at no cost to the buyer in most cases.' },
    ],
    cta: {
      eyebrow: 'First house?',
      title: 'Ask the questions you think are too basic.',
      text: 'They are not. Everyone starts not knowing this, and the buyers who end up happiest are the ones who asked everything early. Call, text, or write in English or Spanish.',
      primary: { label: 'Ask Me Anything', href: '../index.html#contact' },
    },
    related: [
      { label: 'The buyer process and estimator', href: '../buyers.html' },
      { label: 'Every neighborhood, explained', href: '../neighborhoods.html' },
      { label: 'The relocation guide', href: 'relocating-to-lakewood-ranch.html' },
    ],
    legal: 'This guide is general information for home buyers in Manatee County, Florida, not legal, tax, lending, or insurance advice. Loan programs, credit requirements, and assistance funds change; verify current terms with a licensed lender.',
  },

  /* --------------------------------------------------------- SELL ------- */
  {
    slug: 'preparing-your-home-to-list',
    keyword: 'sell',
    title: 'Preparing Your Home to List | Seller Guide | Jennifer Barragan',
    desc: 'How to get a Lakewood Ranch, Sarasota, or Bradenton area home ready to sell: pricing from real comparable sales, the preparation that pays, and what happens from listing day to closing.',
    h1: 'Getting Your Home Ready to Sell',
    lede: 'What to fix, what to skip, how the price actually gets set, and what happens after the sign goes up. The whole listing process, before you commit to anything.',
    crumbLast: 'Seller Guide',
    headline: 'Preparing a Bradenton Area Home to List',
    schemaDesc: 'A seller’s guide for Lakewood Ranch, Sarasota, and Bradenton: pricing from closed comparable sales, preparation with real return, listing marketing, offer negotiation, and the costs of selling.',
    areaServed: 'Lakewood Ranch, Sarasota, Bradenton, Anna Maria Island, Manatee County, Sarasota County, Florida',
    cardKicker: 'For sellers',
    cardBlurb: 'What to fix, what to skip, how the price really gets set, and what selling actually costs. Read it before you list with anyone.',
    promoteOn: 'sellers.html',
    parent: { label: 'Sellers', href: '../sellers.html' },
    landingH1: 'The Seller Listing Guide',
    landingLede: 'What to fix, what to skip, and how pricing really works before you sign with any agent, me included. Tell me where to send it. The guide opens immediately and a copy arrives by email.',
    landingBullets: [
      'How the asking price actually gets set, from closed sales rather than hope',
      'The short list of preparation that earns its cost back, and the long list that does not',
      'What selling costs in Florida, line by line, before you commit to anything',
      'Why some houses sit for months and what that teaches about yours',
    ],
    summary: '**The short version:** Price comes from closed comparable sales, not from listing sites or hope, and getting it right the first week matters more than everything else combined. Preparation is a short list: clean deeply, fix the small honest defects, brighten the light, and stage what matters. Selling costs run several percent of the price all in. This guide walks the whole process so nothing after listing day surprises you.',
    sections: [
      { id: 'price', toc: 'How pricing works',
        h2: 'The price is discovered, not declared',
        blocks: [
          { p: 'Every seller has a number in mind, and I understand where it comes from: what you paid, what you spent, what the site with the letter Z says, what a neighbor bragged about. The market cares about none of it. Buyers compare your home against everything else they can buy right now, and appraisers compare it against what actually closed nearby in the last few months.' },
          { p: 'So that is where I start: closed sales of genuinely comparable homes, adjusted for what makes yours different, plus what is currently competing for your buyer. I put the actual addresses in front of you, not a single mystery number. We set the price together from evidence, and you will know exactly why it is what it is.' },
          { p: 'One thing I will always say plainly: the first two weeks are the whole game. A new listing gets a surge of attention it never gets again, and an overpriced debut wastes it. Homes that sit get discounted below what honest pricing would have brought. Aspirational pricing costs sellers real money, and I would rather tell you that now than after ninety days on market.' },
        ] },
      { id: 'prep', toc: 'Preparation that pays',
        h2: 'What to fix, and what to leave alone',
        blocks: [
          { p: 'Preparation has sharply diminishing returns, and the expensive projects are usually the wrong ones. A kitchen renovation before selling almost never returns its cost. The short list below almost always does.' },
          { list: [
            '**Deep cleaning, everywhere.** The highest return work in real estate. Buyers read clean as cared for.',
            '**Small honest repairs.** The dripping faucet, the cracked switch plate, the door that sticks. Each one is trivial. Together they whisper deferred maintenance to every buyer and every inspector.',
            '**Light.** Bulbs matched and bright, curtains open, lamps on for showings. Florida buyers are buying light as much as space.',
            '**Declutter and depersonalize.** Buyers need to imagine their own life in the rooms. Pack early: you are moving anyway.',
            '**Curb and entry.** Mulch, trimmed plants, a clean front door. The first opinion forms before the lockbox opens.',
            '**Roof and AC honesty.** In this insurance market, the roof’s age is a pricing fact. If it is old, we price and negotiate knowing that, because the buyer’s insurance agent will certainly know it.',
          ] },
          { p: 'What to skip: renovations, additions, and anything a buyer would rather choose themselves. Bring me in before you spend a dollar on preparation. I will walk the house and give you the short list for your specific home, free, whether or not you ever list with me.' },
        ] },
      { id: 'marketing', toc: 'Marketing that works now',
        h2: 'How your home actually gets marketed',
        blocks: [
          { p: 'Professional photography is the entry fee, not the strategy. Buyers meet your home on a phone screen weeks before they meet it in person, and most of them meet it through video now. I market listings the way buyers actually look: full MLS exposure feeding every major site, real photography, and video content on the platforms where buyers and their adult children scroll.' },
          { p: 'The listing description matters more than people think, and mine are written for the buyer who is relocating from out of state, because on this coast that is so often who buys. What the area gives you, what the monthly reality looks like, what makes this house the one to fly in for.' },
        ] },
      { id: 'season', toc: 'Timing the listing',
        h2: 'When to list on the Gulf Coast',
        blocks: [
          { p: 'Our market swells when the snow falls elsewhere. Winter and early spring bring the most out of state buyers, late summer brings the fewest. That does not mean waiting is always right: less competition in the off season can suit a distinctive home, and life does not schedule itself around market seasonality.' },
          { p: 'What matters more than the month is the debut: complete preparation, complete photography, and the right price on day one. A perfect launch in August beats a sloppy one in February.' },
        ] },
      { id: 'offers', toc: 'Offers and negotiation',
        h2: 'From showing to signed contract',
        blocks: [
          { p: 'When offers come, price is only the loudest term. Financing strength, deposit size, timeline, and contingencies decide whether that price actually arrives at closing. A slightly lower offer from a strongly preapproved buyer often beats a higher one resting on wishful financing, and I will lay the tradeoffs out plainly on every offer.' },
          { p: 'After acceptance, the buyer inspects. Every inspection finds things, including in well kept homes, and the negotiation that follows is normal. We agree in advance how to respond: what is worth a credit, what is worth a repair, and where the answer is no. Then appraisal, the buyer’s financing, and closing. Expect thirty to forty five days from contract to keys, and expect me on the phone with the other side the whole way.' },
        ] },
      { id: 'costs', toc: 'What selling costs',
        h2: 'What it costs to sell, line by line',
        blocks: [
          { p: 'You should know the net before you commit to anything. Selling costs typically include the agreed brokerage compensation, title and closing charges, documentary stamp taxes on the deed, any payoff of your existing mortgage, prorated taxes and fees, and whatever repair credits get negotiated. All in, several percent of the sale price is the honest expectation.' },
          { p: 'Before you list, I prepare an estimated net sheet: sale price scenarios down one column, every cost line itemized, and the number you would walk away with at the bottom of each. No commitments, no charge, and no surprises at the closing table. The [home valuation on this site](../sellers.html) is where that conversation usually starts.' },
        ] },
    ],
    faqTitle: 'What sellers ask me',
    faq: [
      { q: 'What is my home worth?',
        a: 'More than a website algorithm knows and exactly what a buyer will pay, which is what closed comparable sales predict. I prepare that analysis for your specific home, free, with the addresses shown. The automated estimate on the site with the letter Z has never walked your street.',
        schemaA: 'A home’s value is best estimated from recently closed comparable sales adjusted for the specific property, rather than automated online estimates. A local agent can prepare that analysis for a specific home at no charge.' },
      { q: 'Should I renovate before selling?',
        a: 'Almost never. Major renovations rarely return their cost at sale, and buyers prefer choosing their own finishes. The money is in cleaning, small repairs, light, and presentation. Walk the house with me before spending anything and I will give you the short list.',
        schemaA: 'Major renovations rarely return their cost at sale. Deep cleaning, minor repairs, lighting, and presentation deliver far better returns, and an agent can identify the short list for a specific home before any money is spent.' },
      { q: 'Do I have to fix everything the inspection finds?',
        a: 'No. Inspections produce long lists by design, and most items are information rather than obligations. What typically gets addressed is what affects safety, financing, or insurance, and the rest is negotiation. I keep the response proportionate and in writing.',
        schemaA: 'Sellers are not obligated to address every inspection finding. Items affecting safety, financing, or insurability are the usual negotiation points, while most other findings are informational.' },
      { q: 'My roof is old. Should I replace it before listing?',
        a: 'This is a genuinely Florida question, because the buyer’s insurance depends on that roof. Sometimes replacement before listing widens your buyer pool enough to pay for itself. Sometimes pricing for the roof and offering flexibility works better. It depends on the roof, the price point, and the season, and I will run both scenarios with real numbers before you decide.',
        schemaA: 'An aging roof affects buyer insurance eligibility in Florida, so sellers should compare replacing before listing against pricing the home to reflect the roof. The better choice depends on the specific roof, price point, and market timing.' },
      { q: 'Can I sell while I still live in the house?',
        a: 'Most of my sellers do. It takes coordination on showings and a house kept closer to showing ready than daily life prefers, and it works. If you are also buying your next home, tell me at the start: sequencing the two is its own small project and doing it well is half my job.',
        schemaA: 'Selling while occupying the home is common and workable with showing coordination. Sellers who are simultaneously buying should plan the sequencing of both transactions from the start.' },
    ],
    cta: {
      eyebrow: 'Thinking of selling?',
      title: 'Start with the walkthrough, not the paperwork.',
      text: 'I will walk your home, tell you what preparation is worth doing, and hand you an estimated net sheet with real numbers. Free, no commitment, and you will know exactly where you stand.',
      primary: { label: 'Request the Walkthrough', href: '../sellers.html' },
    },
    related: [
      { label: 'The seller process and valuation', href: '../sellers.html' },
      { label: 'Every neighborhood, explained', href: '../neighborhoods.html' },
      { label: 'The investment guide', href: 'gulf-coast-investment-property.html' },
    ],
    legal: 'This guide is general information for home sellers in Manatee County, Florida, not legal, tax, or insurance advice. Costs, taxes, and market conditions change; exact figures for a specific sale come from a prepared net sheet and the closing agent.',
  },
];

/* ========================================================================= */
/* AUTHORING MARKUP (ported verbatim from Kevin's generator)                 */
/* ========================================================================= */

// Text node escape. Leaves quotes alone (legal in text) and skips entities
// already written by hand so the data can contain either form.
const escText = (s) => String(s)
  .replace(/&(?!#?[a-zA-Z0-9]+;)/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

// **bold**, *italic*, [text](href). Escape first, links before bold, so
// **[text](url):** nests correctly. Everything else is escaped.
function md(s) {
  return escText(s)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => `<a href="${href}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

// Strip markup back to plain text for JSON-LD and meta fields.
const plain = (s) => String(s)
  .replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1')
  .replace(/\*\*([^*]+)\*\*/g, '$1')
  .replace(/\*([^*]+)\*/g, '$1')
  .replace(/&amp;/g, '&');

// Rough reading time from the guide's own prose. ~220 wpm.
function readTime(g) {
  const words = [g.summary,
    ...g.sections.flatMap((s) => [s.h2, ...s.blocks.flatMap((b) => b.list || [b.p])]),
    ...g.faq.flatMap((f) => [f.q, f.a])].join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/* The one image every guide shares for OG cards. Guides deliberately have no
   photo hero: the neighborhood photos carry CC attribution obligations that
   must sit next to the photo, and a guide hero is the wrong place for a
   credit line. Typographic heroes match the site anyway. */
const OG_IMG = 'assets/hero-neighborhoods.webp';

/* ========================================================================= */
/* GUIDE PAGE                                                                */
/* ========================================================================= */

function buildGuide(g) {
  const canonical = `guides/${g.slug}.html`;

  const jsonld = `  <script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: SITE + '/guides.html' },
        // Schema carries the full H1, not the shortened visible crumb, because
        // it is what shows in a search result's breadcrumb line.
        { '@type': 'ListItem', position: 3, name: plain(g.h1), item: `${SITE}/${canonical}` },
      ] },
      { '@type': 'Article',
        headline: plain(g.headline || g.h1),
        description: plain(g.schemaDesc || g.desc),
        image: `${SITE}/${OG_IMG}`,
        datePublished: g.datePublished || PUBLISHED,
        dateModified: g.dateModified || g.datePublished || PUBLISHED,
        mainEntityOfPage: `${SITE}/${canonical}`,
        // Reference the canonical entity on the home page rather than minting
        // another copy of her details. One entity, many pages pointing at it.
        author: { '@id': `${SITE}/#agent` },
        publisher: { '@id': `${SITE}/#agent` },
        areaServed: g.areaServed },
      { '@type': 'FAQPage', mainEntity: g.faq.map((f) => ({
        '@type': 'Question', name: plain(f.schemaQ || f.q),
        acceptedAnswer: { '@type': 'Answer', text: plain(f.schemaA || f.a) } })) },
    ],
  }, null, 2)}
  </script>`;

  // A real <nav> with a list, so a screen reader announces it and reports how
  // many sections there are. Styled by the .toc block in styles.css.
  const toc = g.sections.filter((s) => s.toc)
    .map((s) => ({ href: '#' + s.id, label: s.toc }))
    .concat({ href: '#faq', label: 'Questions' })
    .map((t) => `<li><a class="toc__link" href="${t.href}">${escText(t.label)}</a></li>`)
    .join('\n            ');

  const prose = g.sections.map((s) => {
    const blocks = s.blocks.map((b) => b.list
      ? `<ul class="guide__list reveal">\n          ${b.list.map((li) => `<li>${md(li)}</li>`).join('\n          ')}\n        </ul>`
      : `<p class="reveal">${md(b.p)}</p>`).join('\n        ');
    return `<h2 id="${s.id}" class="reveal">${md(s.h2)}</h2>\n        ${blocks}`;
  }).join('\n\n        ');

  const html = head({
    title: g.title, description: g.desc,
    canonical,
    image: OG_IMG,
    imageAlt: 'A Florida barrier island seen from the air, with rows of homes, pools and palms between the Gulf and the bay.',
    extraLd: jsonld,
  }) + `
<body>
${nav('../', null)}

  <main id="main" tabindex="-1">

  <section class="section section--dark" style="padding-top:9rem">
    <div class="wrap">
      <nav aria-label="Breadcrumb">
        <ol style="list-style:none;padding:0;margin:0 0 2rem;display:flex;flex-wrap:wrap;gap:.5rem;font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">
          <li><a href="../index.html">Home</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="../guides.html">Guides</a></li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">${escText(g.crumbLast || g.h1)}</li>
        </ol>
      </nav>
      <p class="eyebrow reveal">A Guide by Jennifer Barragan</p>
      <h1 class="section__title reveal" style="--d:.08s;font-size:clamp(2.2rem,5vw,3.4rem)">${escText(g.h1)}</h1>
      <p class="section__lede reveal" style="--d:.16s;max-width:62ch">${escText(g.lede)}</p>
      <p class="reveal" style="--d:.22s;font-size:.8rem;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">
        Jennifer Barragan, REALTOR&reg; &middot; Preferred SHORE Real Estate &middot; Updated ${escText(g.updated || UPDATED)} &middot; ${readTime(g)} minute read
      </p>
    </div>
  </section>

  <section class="section section--tight">
    <div class="wrap">
      <div class="prose">
        <p class="lede-lg reveal">${md(g.summary)}</p>

        <nav class="toc reveal" aria-label="In this guide">
          <p class="toc__kicker">In this guide</p>
          <ul class="toc__list">
            ${toc}
          </ul>
        </nav>

        ${prose}
      </div>
    </div>
  </section>

  <section class="section section--bone2" id="faq">
    <div class="wrap">
      <div class="section__head">
        <p class="eyebrow reveal">Questions</p>
        <h2 class="section__title reveal" style="--d:.08s">${escText(g.faqTitle)}</h2>
      </div>
      <div class="faq">
${g.faq.map((f, i) => `        <details class="faq__item reveal" style="--d:.${i * 6}s">
          <summary>${escText(f.q)}</summary>
          <div class="faq__answer"><p>${md(f.a)}</p></div>
        </details>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="wrap">
      <p class="eyebrow reveal">${escText(g.cta.eyebrow)}</p>
      <h2 class="section__title reveal" style="--d:.06s">${escText(g.cta.title)}</h2>
      <p class="section__lede reveal" style="--d:.12s;max-width:60ch">${escText(g.cta.text)}</p>
      <p class="reveal" style="--d:.18s;margin-top:2.4rem;display:flex;gap:1rem;flex-wrap:wrap">
        <a href="${esc(g.cta.primary.href)}" class="btn btn--solid">${escText(g.cta.primary.label)}</a>
        <a href="tel:+12057907560" class="btn btn--ghost">Call or Text (205) 790-7560</a>
      </p>
      <p class="reveal" style="--d:.22s;margin-top:1rem;font-size:.85rem;color:var(--muted)">
        Jennifer Barragan, REALTOR&reg; &middot; Preferred SHORE Real Estate
      </p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head">
        <p class="eyebrow reveal">Keep reading</p>
      </div>
      <ul class="footer__list reveal" style="--d:.08s;columns:1;max-width:40rem;font-size:1.05rem">
${g.related.map((r) => `        <li><a href="${esc(r.href)}">${escText(r.label)}</a></li>`).join('\n')}
      </ul>
      <p style="margin-top:2.5rem;font-size:.85rem;color:var(--muted);max-width:70ch">${escText(g.legal)}</p>
    </div>
  </section>

  </main>
${footer('../')}`;

  fs.writeFileSync(path.join(ROOT, 'guides', g.slug + '.html'), html, 'utf8');
  return `${SITE}/${canonical}`;
}

/* ========================================================================= */
/* HUB                                                                       */
/* ========================================================================= */

// One card per guide, on the .path component the neighborhoods hub uses.
// Whole card is the link. `pre` is the path back to the site root.
function guideCard(g, pre, i) {
  return `<a class="path reveal reveal--scale" href="${pre}guides/${g.slug}.html" style="--d:.${(i % 3) * 8}s">
          <div class="path__body">
            <p class="eyebrow" style="margin-bottom:.6rem">${escText(g.cardKicker || 'Guide')} &middot; ${readTime(g)} minute read</p>
            <h3 class="path__title">${escText(g.h1)}</h3>
            <p class="path__text">${escText(g.cardBlurb || g.lede)}</p>
            <span class="path__link">Read the guide</span>
          </div>
        </a>`;
}

function buildHub() {
  const canonical = 'guides.html';
  const title = 'Buying, Selling and Relocation Guides | Lakewood Ranch FL | Jennifer Barragan';
  const desc = 'Free guides to relocating, buying a first home, investing, and selling in Lakewood Ranch, Sarasota, and Bradenton, written by Jennifer Barragan of Preferred SHORE Real Estate.';

  const jsonld = `  <script type="application/ld+json">
${JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: SITE + '/guides.html' } ] },
      { '@type': 'CollectionPage', name: 'Buying, Selling and Relocation Guides',
        url: SITE + '/guides.html', description: desc,
        hasPart: GUIDES.map((g) => ({ '@type': 'Article', headline: plain(g.headline || g.h1),
          url: `${SITE}/guides/${g.slug}.html`, description: plain(g.schemaDesc || g.desc) })) },
    ],
  }, null, 2)}
  </script>`;

  const html = head({
    title, description: desc,
    canonical,
    image: OG_IMG,
    imageAlt: 'A Florida barrier island seen from the air, with rows of homes, pools and palms between the Gulf and the bay.',
    extraLd: jsonld,
  }).replace(/\.\.\//g, '') + `
<body>
${nav('', null)}

  <main id="main" tabindex="-1">

  <section class="section section--dark" style="padding-top:9rem">
    <div class="wrap">
      <p class="eyebrow reveal">The Long Answers</p>
      <h1 class="section__title reveal" style="--d:.08s;font-size:clamp(2.2rem,5vw,3.4rem)">Guides</h1>
      <p class="section__lede reveal" style="--d:.16s;max-width:62ch">
        The full versions of the conversations I have with clients every week,
        written down so you can read them before we talk instead of after. Free
        to read right here, no form in your way.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="paths__grid">
        ${GUIDES.map((g, i) => guideCard(g, '', i)).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section section--bone2">
    <div class="wrap">
      <p class="eyebrow reveal">Rather just ask?</p>
      <h2 class="section__title reveal" style="--d:.06s">Call me and skip the reading.</h2>
      <p class="section__lede reveal" style="--d:.12s;max-width:60ch">
        These pages exist so you are not guessing. If asking the question is
        faster, do that instead. It costs nothing, in English or Spanish.
      </p>
      <p class="reveal" style="--d:.18s;margin-top:2.4rem;display:flex;gap:1rem;flex-wrap:wrap">
        <a href="index.html#contact" class="btn btn--solid">Contact Jennifer</a>
        <a href="tel:+12057907560" class="btn btn--ghost">Call or Text (205) 790-7560</a>
      </p>
      <p class="reveal" style="--d:.22s;margin-top:1rem;font-size:.85rem;color:var(--muted)">
        Jennifer Barragan, REALTOR&reg; &middot; Preferred SHORE Real Estate
      </p>
    </div>
  </section>

  </main>
${footer('')}`;

  fs.writeFileSync(path.join(ROOT, 'guides.html'), html, 'utf8');
  return `${SITE}/guides.html`;
}

/* ========================================================================= */
/* LANDING PAGES — g/<keyword>.html                                          */
/*                                                                           */
/* The pages Jennifer DMs. Own slim chrome on purpose: noindex robots (the   */
/* chrome head() hardcodes index), no nav links to wander off through, and   */
/* the firm name adjacent to the form and every contact point. The form is   */
/* "guide-request" for every guide; the hidden `guide` and `source` fields   */
/* say which one, so the notification email and the CRM record name what     */
/* the person wants.                                                         */
/* ========================================================================= */

function buildLanding(g) {
  const guideUrl = `../guides/${g.slug}.html`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(g.landingH1)} | Jennifer Barragan, Preferred SHORE Real Estate</title>
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="../assets/apple-touch-icon.png" />
  <meta name="description" content="${esc(g.desc)}" />
  <meta name="robots" content="noindex, nofollow" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/styles.css" />
</head>
<body class="lp">

  <header class="lp__head">
    <a href="../index.html" class="nav__brand" style="justify-content:center">
      <span class="nav__brand-text" style="text-align:center">
        <span class="nav__brand-name">Jennifer Barragan</span>
        <span class="nav__brand-sub">Preferred SHORE Real Estate</span>
      </span>
    </a>
  </header>

  <main id="main">
  <section class="section section--dark" style="min-height:calc(100vh - 90px);display:flex;align-items:center">
    <div class="wrap">
      <div class="guide__grid">
        <div>
          <p class="eyebrow reveal">Free Guide</p>
          <h1 class="section__title reveal" style="--d:.08s">${escText(g.landingH1)}</h1>
          <p class="section__lede reveal" style="--d:.16s">${escText(g.landingLede)}</p>
          <ul class="guide__list reveal" style="--d:.24s">
${g.landingBullets.map((b) => `            <li>${escText(b)}</li>`).join('\n')}
          </ul>
        </div>

        <div class="guide__card reveal reveal--scale" style="--d:.12s">
          <h2 class="guide__card-title">Where should I send it?</h2>
          <p class="guide__card-sub">
            The guide opens the moment you hit the button, and a copy arrives
            by email. I follow up personally, once, to ask if you have
            questions. No drip campaigns, no list you cannot escape.
          </p>

          <form id="gate-form" name="guide-request" method="POST" action="${guideUrl}"
                data-netlify="true" netlify-honeypot="bot-field"
                data-gate data-guide="${esc(g.keyword)}" data-guide-url="${guideUrl}">
            <input type="hidden" name="form-name" value="guide-request" />
            <input type="hidden" name="guide" value="${esc(g.keyword)}" />
            <input type="hidden" name="guideTitle" value="${esc(plain(g.h1))}" />
            <input type="hidden" name="source" value="/g/${esc(g.keyword)}" />
            <p class="hp-field" aria-hidden="true">
              <label>Leave this field empty:
                <input name="bot-field" tabindex="-1" autocomplete="off" /></label>
            </p>

            <label class="field">
              <span>Your name</span>
              <input type="text" name="name" autocomplete="name" required />
            </label>
            <label class="field">
              <span>Email</span>
              <input type="email" name="email" autocomplete="email" required />
            </label>
            <label class="field">
              <span>Phone</span>
              <input type="tel" name="phone" autocomplete="tel" required />
            </label>

            <button type="submit" class="btn btn--solid" style="width:100%">
              Send Me The Guide
            </button>
            <p class="form__note">
              Sending this gives me permission to contact you about your plans
              by phone, text, or email. Your details stay with me at Preferred
              SHORE Real Estate and are never sold or shared.
            </p>
            <p class="form__error" id="gate-error" hidden>
              Something went wrong sending that. Please try again, or text me
              directly at <a href="tel:+12057907560">(205) 790-7560</a> at
              Preferred SHORE Real Estate and I will send it myself.
            </p>
          </form>
        </div>
      </div>
    </div>
  </section>
  </main>

  <footer class="lp__foot" style="padding:2rem 1.5rem;text-align:center;background:var(--deep)">
    <p style="font-size:.8rem;color:var(--muted);max-width:60ch;margin:0 auto">
      Jennifer Barragan, REALTOR&reg; &middot; Preferred SHORE Real Estate &middot;
      <a href="tel:+12057907560" style="color:inherit">(205) 790-7560</a><br />
      Florida License SL3586445 &middot; 50 S. Lemon Ave. Ste 302, Sarasota, FL 34236<br />
      Equal Housing Opportunity
    </p>
  </footer>

  <script src="../js/reveal.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>
`;
  fs.writeFileSync(path.join(ROOT, 'g', g.keyword + '.html'), html, 'utf8');
}

/* ========================================================================= */
/* RUN                                                                       */
/* ========================================================================= */

fs.mkdirSync(path.join(ROOT, 'guides'), { recursive: true });
fs.mkdirSync(path.join(ROOT, 'g'), { recursive: true });

const built = GUIDES.map((g) => ({ g, url: buildGuide(g) }));
buildHub();
GUIDES.forEach(buildLanding);

console.log(`build-guides: wrote guides.html, ${built.length} guides, ${GUIDES.length} landing pages.`);
built.forEach(({ g }) => console.log(
  `  /guides/${g.slug}.html  (${g.sections.length} sections, ${g.faq.length} FAQs, ` +
  `${readTime(g)} min)  gate: /g/${g.keyword}`));

/* ---- promo cards on the hand maintained pages --------------------------- */
const START = '<!-- guide-cards:start (generated by scripts/build-guides.js. Do not edit by hand.) -->';
const END = '<!-- guide-cards:end -->';
const byPage = {};
GUIDES.forEach((g) => { if (g.promoteOn) (byPage[g.promoteOn] = byPage[g.promoteOn] || []).push(g); });
for (const [page, list] of Object.entries(byPage)) {
  const file = path.join(ROOT, page);
  if (!fs.existsSync(file)) { console.log(`  ! ${page} not found, skipped its guide card`); continue; }
  const src = fs.readFileSync(file, 'utf8');
  const a = src.indexOf(START), b = src.indexOf(END);
  if (a === -1 || b === -1) {
    console.log(`  ! ${page} has no guide-cards marker region, skipped. Add:\n      ${START}\n      ${END}`);
    continue;
  }
  const cards = list.map((g, i) => guideCard(g, '', i)).join('\n        ');
  const gridStyle = list.length === 1
    ? 'grid-template-columns:1fr;max-width:520px;margin:2rem auto 0'
    : 'margin-top:2rem';
  const block = `${START}
  <section class="section section--bone2">
    <div class="wrap">
      <div class="section__head">
        <p class="eyebrow reveal">Go Deeper</p>
        <h2 class="section__title reveal" style="--d:.08s">The long answers, written down.</h2>
      </div>
      <div class="paths__grid" style="${gridStyle}">
        ${cards}
      </div>
    </div>
  </section>
  ${END}`;
  const next = src.slice(0, a) + block + src.slice(b + END.length);
  if (next !== src) { fs.writeFileSync(file, next, 'utf8'); console.log(`  ${page}: guide card(s) refreshed`); }
}

/* ---- gates ---------------------------------------------------------------
   No dash check here on purpose: copy-lint.js is the stricter referee and it
   covers dashes, AI tells, and fair housing across the whole repo, landing
   pages included. check-links.js verifies every relative reference,
   including the exact class of path-to-root bug that once rendered a page
   blank on the sibling site. A failure in either fails this build. */
for (const script of ['copy-lint.js', 'check-links.js']) {
  const r = spawnSync(process.execPath, [path.join(__dirname, script)], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error(`\nbuild-guides: ${script} failed. Pages were written but are NOT shippable.`);
    process.exit(r.status || 1);
  }
}

console.log('\nNow run: node scripts/build-sitemap.js  (guides in, g/ stays out)');
