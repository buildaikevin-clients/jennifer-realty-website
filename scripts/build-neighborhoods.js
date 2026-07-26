#!/usr/bin/env node
/* =============================================================================
   build-neighborhoods.js — generates the neighborhoods hub and one page per
   area from the DATA array below.

   Run:  node scripts/build-neighborhoods.js

   Why a generator instead of 21 hand written files: these pages are the
   strongest local SEO asset on the site. Each one carries Place, FAQPage and
   BreadcrumbList schema and targets a search people actually perform ("homes
   for sale in Palma Sola"). Keeping them in one array means the nav, the
   footer, the schema and the disclaimers stay identical across all of them,
   and adding an area is a few lines rather than a new file.

   ---------------------------------------------------------------------------
   FAIR HOUSING, READ THIS BEFORE EDITING COPY
   ---------------------------------------------------------------------------
   Neighborhood writing is where fair housing problems start, because the
   natural way to describe a place is to describe who lives there. Do not.

   Describe: geography, drive times, what was built when, architecture, price,
   amenities, water access, what is nearby.

   Never: who lives there, family composition, age, religion, national origin,
   whether an area is "safe" or "quiet" or has "good schools". Schools may be
   named as a fact with a link to the district, never rated or characterized.

   scripts/copy-lint.js enforces the word list. It does not enforce judgment.
   ---------------------------------------------------------------------------

   PRICES: `priceRange` is left null wherever a real figure was not on hand.
   A null renders a visible [[FILL IN]] rather than a guess, because inventing
   market data on a licensed agent's site is not a placeholder, it is a false
   statement. Fill these from Stellar MLS and update `PRICES_AS_OF`.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'neighborhoods');

const DOMAIN = '[[DOMAIN]]';
const PRICES_AS_OF = '[[FILL IN: month and year these ranges were pulled]]';

/* ========================================================================= */
/* DATA                                                                      */
/* ========================================================================= */

const GROUPS = [
  { key: 'islands', title: 'The Islands and the Coast',
    intro: 'Anna Maria Sound on one side, the Gulf on the other. Higher prices, higher carrying costs, and rules about short term rentals that change from street to street.' },
  { key: 'west',    title: 'West Bradenton',
    intro: 'Between the city and the bridges. Older Florida housing stock, mature landscaping, and the shortest drive to the sand without paying island prices.' },
  { key: 'east',    title: 'East County and Lakewood Ranch',
    intro: 'Master planned communities built mostly after 1995. Newer construction, amenity centers, and CDD assessments on top of HOA dues.' },
  { key: 'north',   title: 'North of the River',
    intro: 'Across the Manatee River. The fastest growing part of the county and where most of the new construction inventory is.' },
  { key: 'central', title: 'Central Bradenton',
    intro: 'The original city. Historic housing along the river, a working downtown, and the arts district.' },
];

const DATA = [
  /* ------------------------------------------------------------ islands -- */
  {
    slug: 'anna-maria-island', name: 'Anna Maria Island', group: 'islands',
    county: 'Manatee County', lat: 27.5314, lng: -82.7332,
    priceRange: null,
    toBeach: 'On the island',
    styles: 'Old Florida cottages, raised coastal homes, newer elevated builds',
    intro: [
      'Anna Maria Island is seven miles of barrier island running north from Longboat Pass, and it holds three separate municipalities. Anna Maria at the north end, Holmes Beach in the middle, and Bradenton Beach at the south. They share a beach and very little else, including their rules.',
      'What that means practically is that two houses a mile apart can have completely different rental rights, height limits, and setback requirements. If you are buying here to rent the property when you are not in it, the municipality matters more than the address.',
    ],
    known: [
      'Three separate city governments with three separate sets of rules',
      'Short term rental regulations that vary by city and by zoning district',
      'Elevated construction, with most newer homes built well above grade',
      'The free island trolley running the length of Gulf Drive',
      'Coastal high hazard flood zones across much of the island',
    ],
    faq: [
      ['Can I rent out a home on Anna Maria Island?',
       'Sometimes, and the answer depends on which of the three cities the property sits in and how the parcel is zoned. Minimum rental periods, occupancy caps, and registration requirements are all set locally rather than county wide, and they have been revised more than once. Before you buy anything here with rental income in mind, we confirm the rules for that exact parcel in writing.'],
      ['What is different about insuring an island property?',
       'Most of the island falls in coastal high hazard flood zones, which changes both what coverage is required and what it costs. Wind coverage is frequently written separately. The elevation of the structure matters enormously, and an elevation certificate can shift a premium by thousands per year. I get quotes on a specific address early rather than at the end of a contract.'],
      ['Is the island the same market as mainland Bradenton?',
       'No. Island inventory is smaller, prices per square foot are substantially higher, buyers are often paying cash or buying with rental income in mind, and homes can take longer to sell. It moves on its own cycle and comparable sales from the mainland tell you almost nothing about it.'],
    ],
    nearby: ['holmes-beach', 'bradenton-beach', 'cortez', 'perico-island'],
  },
  {
    slug: 'holmes-beach', name: 'Holmes Beach', group: 'islands',
    county: 'Manatee County', lat: 27.4989, lng: -82.7112,
    priceRange: null,
    toBeach: 'On the island',
    styles: 'Canal homes, duplexes, raised single family, newer elevated builds',
    intro: [
      'Holmes Beach sits in the middle of Anna Maria Island and holds most of its year round population. It is the largest of the three island cities and the one with the most canal frontage, which is why it draws buyers who want a boat behind the house rather than only a walk to the sand.',
      'The housing runs from small mid century block homes to elevated new construction on the same street. That range is unusual and it means the comparable sales work here has to be done carefully.',
    ],
    known: [
      'Canal front homes with direct access to Anna Maria Sound',
      'The largest year round population of the three island cities',
      'Manatee Public Beach and the island shopping along Marina Drive',
      'A mix of original block construction and elevated rebuilds',
      'Vacation rental licensing administered by the city',
    ],
    faq: [
      ['What should I check on a canal home here?',
       'Seawall condition and age first, because replacement is expensive and it is not always obvious from a walk through. Then dock and lift condition and permits, water depth at low tide, and whether the bridge clearance between the canal and open water fits the boat you actually own. I would rather find these before an offer than during inspection.'],
      ['How does Holmes Beach compare to Anna Maria city?',
       'Holmes Beach is larger, has more canal inventory, and generally more year round residents. Anna Maria at the north end is smaller, quieter in inventory terms, and its rental rules differ. Prices in both are set more by water access, elevation, and rental rights than by which city line the parcel falls on.'],
      ['Are there still older homes to renovate here?',
       'Yes, though fewer every year. Original block homes come up regularly, but before planning a major renovation on one you need to understand substantial improvement rules, which limit how much you can spend on an older structure in a flood zone before it has to be brought fully up to current elevation requirements.'],
    ],
    nearby: ['anna-maria-island', 'bradenton-beach', 'perico-island', 'cortez'],
  },
  {
    slug: 'bradenton-beach', name: 'Bradenton Beach', group: 'islands',
    county: 'Manatee County', lat: 27.4675, lng: -82.6989,
    priceRange: null,
    toBeach: 'On the island',
    styles: 'Cottages, condominiums, resort style units, duplexes',
    intro: [
      'Bradenton Beach occupies the southern end of Anna Maria Island, from Cortez Road down to Longboat Pass. It is the most condominium heavy of the three island cities and historically the most rental oriented.',
      'Bridge Street is the small commercial core, and the Historic Bridge Street Pier runs out into the bay behind it. Inventory here skews toward smaller units and cottages rather than large single family homes.',
    ],
    known: [
      'The highest concentration of condominium inventory on the island',
      'Bridge Street and the Historic Bridge Street Pier',
      'Coquina Beach at the south end, with the pass beyond it',
      'A shorter drive to Longboat Key and north Sarasota',
      'Rental oriented ownership across much of the housing stock',
    ],
    faq: [
      ['What should I look at before buying a condominium here?',
       'The association documents, in detail. Florida now requires milestone structural inspections and reserve funding based on a structural integrity reserve study for buildings three stories and taller, and the effect on some island associations has been higher dues or special assessments. I want the budget, the reserve study, the milestone inspection, and recent minutes before we go under contract.'],
      ['Is this a better rental market than the rest of the island?',
       'It has historically had more rental inventory and more units zoned for shorter stays, but the rules are set by the city and by zoning district rather than by reputation. Any income assumption should be checked against that specific parcel and its rental history rather than against what is typical for the area.'],
      ['How far is it to the mainland?',
       'Cortez Road and the Cortez Bridge connect Bradenton Beach directly to the mainland at Cortez, which puts west Bradenton about ten to fifteen minutes away outside of peak season traffic. Longboat Pass Bridge at the south end leads down Longboat Key toward Sarasota.'],
    ],
    nearby: ['anna-maria-island', 'holmes-beach', 'longboat-key', 'cortez'],
  },
  {
    slug: 'longboat-key', name: 'Longboat Key', group: 'islands',
    county: 'Manatee and Sarasota Counties', lat: 27.4128, lng: -82.6559,
    priceRange: null,
    toBeach: 'On the island',
    styles: 'Gulf front condominiums, bayfront estates, club communities',
    intro: [
      'Longboat Key runs south from Longboat Pass for about eleven miles, and the town straddles the Manatee and Sarasota county line. The northern portion sits in Manatee County and the southern portion in Sarasota County, which affects taxes, services, and which set of county records applies.',
      'The island is more built out than Anna Maria and skews toward Gulf front condominiums and larger bayfront properties, with several club communities behind gates.',
    ],
    known: [
      'A town split across two counties, with different tax treatment on each side',
      'Gulf front condominium buildings along Gulf of Mexico Drive',
      'Deep water bayfront property with dockage on the eastern shore',
      'A short drive south to St Armands Circle and downtown Sarasota',
      'Strict town rules on rental minimums across most zoning districts',
    ],
    faq: [
      ['Does the county line actually matter?',
       'Yes. Property tax rates, county services, permitting, and public records all follow the county the parcel sits in rather than the town. Two comparable units a mile apart can carry noticeably different tax bills for that reason alone. It is one of the first things I check on any Longboat Key property.'],
      ['Can properties here be rented short term?',
       'In most of the town, no. Longboat Key has long enforced minimum rental periods across the majority of its zoning districts, with limited exceptions in specific tourism zoned areas. If income is part of your plan, the rental minimum for that exact parcel needs to be confirmed before you write an offer.'],
      ['What is the condominium situation here?',
       'Longboat Key has a large number of older mid rise and high rise buildings, which places many of them squarely inside Florida milestone inspection and reserve study requirements. Some associations have funded well ahead of the deadlines and some have not. That difference shows up directly in dues, assessments, and resale value.'],
    ],
    nearby: ['bradenton-beach', 'anna-maria-island', 'perico-island'],
  },
  {
    slug: 'cortez', name: 'Cortez', group: 'islands',
    county: 'Manatee County', lat: 27.4678, lng: -82.6851,
    priceRange: null,
    toBeach: 'About 5 minutes to the island',
    styles: 'Historic frame cottages, waterfront homes, newer infill',
    intro: [
      'Cortez is a working commercial fishing village on the mainland side of the Cortez Bridge, and one of the last of its kind on the Gulf Coast of Florida. The historic district is on the National Register, and a good deal of the original village housing survives.',
      'It sits directly across the water from Anna Maria Island, which makes it one of the shortest mainland drives to the beach in the county while trading island prices for mainland ones.',
    ],
    known: [
      'A National Register historic district and an active fishing fleet',
      'Deep water access to Sarasota Bay and the Gulf through Longboat Pass',
      'The FISH Preserve and the annual Cortez commercial fishing festival',
      'Original village housing alongside newer waterfront construction',
      'Roughly five minutes across the bridge to Bradenton Beach',
    ],
    faq: [
      ['What is the historic district designation and does it affect me?',
       'Portions of Cortez are within a designated historic district, which can affect exterior alterations, demolition, and new construction on those parcels. Whether a specific property is inside the district and what that means for your plans is something to confirm with Manatee County before you buy, not after.'],
      ['Is Cortez a practical alternative to buying on the island?',
       'For many buyers it is. You are minutes from the beach with mainland pricing, mainland insurance in many cases, and deep water access on much of the waterfront inventory. The tradeoff is a much smaller inventory, since the village is small and turnover is limited.'],
      ['What about flood zones here?',
       'Much of Cortez sits low and close to the water, so flood zone and structure elevation drive both insurance cost and what you can do with an older home. Substantial improvement rules can limit how much you invest in an existing structure before it must be brought up to current elevation standards. I pull the zone before we look seriously.'],
    ],
    nearby: ['bradenton-beach', 'holmes-beach', 'perico-island', 'west-bradenton'],
  },
  {
    slug: 'perico-island', name: 'Perico Island and Harbour Isle', group: 'islands',
    county: 'Manatee County', lat: 27.4972, lng: -82.6579,
    priceRange: null,
    toBeach: 'About 5 to 10 minutes',
    styles: 'Resort style condominiums, coach homes, villas, townhomes',
    intro: [
      'Perico Island sits on Manatee Avenue between west Bradenton and the Anna Maria Island bridge, surrounded by Anna Maria Sound and Palma Sola Bay. Almost all of it was developed as planned communities rather than as a conventional street grid.',
      'Harbour Isle is the largest of these, a waterfront community of coach homes and condominiums with a marina and a beach club. The result is island adjacent living with newer construction and association maintained exteriors.',
    ],
    known: [
      'Harbour Isle, One Particular Harbour, and the Perico Bay Club communities',
      'A marina with Gulf access through Anna Maria Sound',
      'Newer construction, most of it built after 2000',
      'Association maintained exteriors and grounds across most of the island',
      'Robinson Preserve and Neal Preserve immediately adjacent',
    ],
    faq: [
      ['What do the association dues cover here?',
       'It varies by community, but on Perico Island they commonly include exterior maintenance, grounds, amenity access, and in some cases roof and insurance on the building shell. That makes a direct comparison to a single family home misleading unless you account for what you would otherwise pay separately. I break that out when we compare options.'],
      ['Is this a good option for part time residents?',
       'It is one of the more practical ones in the county, because exterior maintenance and landscaping are handled and the communities are gated. That said, rental minimums vary by community and need to be checked if you intend to rent when you are away.'],
      ['How close is it really to the beach?',
       'Perico Island sits between west Bradenton and the island itself, so the Anna Maria Island bridge is minutes away and Manatee Public Beach is a short drive beyond it. Traffic on Manatee Avenue in high season is the variable, not the distance.'],
    ],
    nearby: ['holmes-beach', 'palma-sola', 'cortez', 'west-bradenton'],
  },

  /* --------------------------------------------------------------- west -- */
  {
    slug: 'palma-sola', name: 'Palma Sola', group: 'west',
    county: 'Manatee County', lat: 27.4956, lng: -82.6371,
    priceRange: null,
    toBeach: 'About 10 to 15 minutes',
    styles: 'Mid century ranch, waterfront homes, custom rebuilds',
    intro: [
      'Palma Sola runs along the bay of the same name at the western edge of the mainland, just before the causeway out to Perico Island and the beaches. It is one of the shortest drives to Anna Maria Island from a mainland address.',
      'The housing is largely mid century, with waterfront parcels along the bay and the canals feeding it, and a steady amount of teardown and rebuild activity on the better lots.',
    ],
    known: [
      'Palma Sola Bay and the causeway beach along Manatee Avenue',
      'The Palma Sola Botanical Park and Robinson Preserve nearby',
      'Waterfront and canal front parcels with bay access',
      'Mid century housing stock with ongoing rebuild activity',
      'Ten to fifteen minutes to the Gulf beaches',
    ],
    faq: [
      ['Why do people choose Palma Sola over the island?',
       'Cost, mostly. You are close to the beach without island pricing, island insurance, or island rental rules, and you get larger lots than most island inventory. The tradeoff is that you drive to the sand rather than walk to it.'],
      ['What is the waterfront situation here?',
       'Palma Sola Bay is shallow in places, so water depth and access matter as much as the fact of being on the water. If a boat is part of the plan, we check depth at low tide, bridge clearances on the route out, and the condition and permitting of any existing dock and lift before you commit.'],
      ['Are homes here being torn down and rebuilt?',
       'On the better lots, yes, and it has been going on for years. That has two effects worth knowing. Comparable sales need care, because a 1960s ranch and a new build can sit side by side. And if you buy an older home in a flood zone intending a major renovation, substantial improvement rules may require the whole structure to be brought up to current elevation standards.'],
    ],
    nearby: ['west-bradenton', 'perico-island', 'cortez', 'bayshore-gardens'],
  },
  {
    slug: 'west-bradenton', name: 'West Bradenton', group: 'west',
    county: 'Manatee County', lat: 27.4989, lng: -82.6068,
    priceRange: '[[FILL IN: verify, research suggested roughly $385,000 to $445,000]]',
    toBeach: 'About 15 minutes',
    styles: 'Mid century ranch, block construction, pockets of newer infill',
    intro: [
      'West Bradenton covers the stretch between the city proper and Palma Sola, running along Manatee Avenue and Cortez Road. Most of it was built between the 1950s and the 1970s, which shows in the tree canopy and the lot sizes.',
      'It is the practical middle of the county for a lot of buyers. You are fifteen minutes from the beach, ten minutes from downtown, and paying considerably less than either the island or the newer communities to the east.',
    ],
    known: [
      'Mature tree canopy and larger lots than newer construction offers',
      'Blake Medical Center and the medical corridor along 59th Street West',
      'GT Bray Park, with the county aquatic center and recreation complex',
      'Direct access to both Manatee Avenue and Cortez Road for the beaches',
      'Block construction typical of the era, which insurers generally view well',
    ],
    faq: [
      ['What should I check on a home from this era?',
       'Roof age first, because Florida carriers are strict about it and an older roof can prevent a buyer from getting insured at all. Then the electrical panel, the plumbing type, and whether the windows have been replaced with impact rated units. Original 1960s systems are common here and each of them affects both insurability and your offer.'],
      ['Is west Bradenton in a flood zone?',
       'Parts of it are and parts are not, and it changes street by street rather than neighborhood by neighborhood. Areas closer to Palma Sola Bay and to the creeks sit lower. I pull the FEMA zone for any specific address, because the difference between Zone X and Zone AE is a meaningful monthly number.'],
      ['How does it compare to the newer communities east of I-75?',
       'Different tradeoffs entirely. West Bradenton gives you larger lots, mature landscaping, no CDD assessments, and a much shorter drive to the beach. The eastern communities give you newer construction, amenity centers, and homes built to current codes. Which is better depends on whether you value the beach drive or the newer build.'],
    ],
    nearby: ['palma-sola', 'bayshore-gardens', 'downtown-bradenton', 'cortez'],
  },
  {
    slug: 'bayshore-gardens', name: 'Bayshore Gardens', group: 'west',
    county: 'Manatee County', lat: 27.4381, lng: -82.5878,
    priceRange: null,
    toBeach: 'About 20 minutes',
    styles: 'Mid century ranch, block homes, condominiums, mobile home parks',
    intro: [
      'Bayshore Gardens sits south of Bradenton along US 41, running down toward the Sarasota county line. It was developed largely in the 1950s and 1960s as one of the county original planned subdivisions, and it retains its own recreation district.',
      'It is among the more affordable parts of coastal Manatee County, and it sits close to Sarasota Bay with marina access through the Bayshore Gardens Park and Recreation District.',
    ],
    known: [
      'A dedicated park and recreation district with a marina and pool',
      'Direct frontage on Sarasota Bay at the district park',
      'Some of the lower price points in coastal Manatee County',
      'US 41 corridor access north to Bradenton and south to Sarasota',
      'A mix of single family, condominium, and manufactured housing',
    ],
    faq: [
      ['What is the recreation district?',
       'Bayshore Gardens has its own park and recreation district funded by a separate assessment on properties within it. It maintains the bayfront park, a marina with boat slips, a pool, and ball fields. It is a real line item on the tax bill and also a real amenity, so it belongs in any cost comparison against a neighborhood without one.'],
      ['Is the marina available to residents?',
       'The district marina offers slips to property owners within the district, generally with a waiting list. Availability, cost, and the current rules change, so it is worth confirming directly with the district if dockage is part of why you are looking here.'],
      ['How is the commute to Sarasota from here?',
       'Bayshore Gardens sits close to the county line, which makes it one of the shorter drives in Manatee County to downtown Sarasota and to Sarasota Bradenton International Airport. US 41 and I-75 are both accessible, with 41 slower and more direct.'],
    ],
    nearby: ['west-bradenton', 'whitfield', 'downtown-bradenton'],
  },
  {
    slug: 'whitfield', name: 'Whitfield and Sara Bay', group: 'west',
    county: 'Manatee County', lat: 27.4106, lng: -82.5764,
    priceRange: null,
    toBeach: 'About 20 to 25 minutes',
    styles: ' 1920s through 1960s homes, bayfront estates, golf course frontage',
    intro: [
      'Whitfield Estates sits at the southern edge of Manatee County along Sarasota Bay, and it is one of the older platted neighborhoods in the area, laid out in the 1920s around what is now the Sara Bay Country Club golf course.',
      'The housing runs from small original bungalows to substantial bayfront property, and the location puts the Sarasota Bradenton airport and downtown Sarasota within a short drive.',
    ],
    known: [
      'A 1920s land boom era plat, one of the oldest in the county',
      'The Sara Bay Country Club golf course running through the neighborhood',
      'Bayfront parcels on Sarasota Bay with deep water on portions',
      'Minutes from Sarasota Bradenton International Airport',
      'Housing spanning nearly a century of construction',
    ],
    faq: [
      ['What is the housing stock actually like?',
       'Unusually varied for one neighborhood. Original 1920s and 1930s homes sit near 1950s and 1960s construction and near substantially rebuilt bayfront property. That range makes comparable sales work more involved here than in a subdivision where everything was built in the same three years.'],
      ['Does the airport affect the area?',
       'Sarasota Bradenton International is close, which is convenient and also means aircraft noise on some approach paths. It varies considerably by exact location within the neighborhood. If it matters to you, I would want you to stand on the lot at a few different times before making a decision.'],
      ['Is golf course frontage a premium here?',
       'It generally carries a premium, though the course is private and frontage does not convey membership. Membership terms are set by the club and are separate from the real estate, so they should be confirmed with the club directly rather than assumed from the listing.'],
    ],
    nearby: ['bayshore-gardens', 'west-bradenton'],
  },

  /* --------------------------------------------------------------- east -- */
  {
    slug: 'lakewood-ranch', name: 'Lakewood Ranch', group: 'east',
    county: 'Manatee and Sarasota Counties', lat: 27.4181, lng: -82.4265,
    priceRange: '[[FILL IN: verify, research suggested a median around $600,000]]',
    toBeach: 'About 35 to 45 minutes',
    styles: 'New construction, Mediterranean and coastal transitional, villas',
    intro: [
      'Lakewood Ranch is a master planned development east of I-75 that spans the Manatee and Sarasota county line, and it has been among the top selling planned communities in the country for years running. It is not a neighborhood so much as a collection of dozens of them, each with its own builder, price point, and association.',
      'Almost everything here was built after 1995, which means current construction standards, newer roofs, and homes that insure more easily than older coastal stock. The tradeoff is distance from the water and the assessments that pay for the amenities.',
    ],
    known: [
      'Dozens of separate villages, each with its own builder and association',
      'Waterside Place and Main Street as the commercial and dining cores',
      'Over 150 miles of trails and a large amount of preserved open space',
      'CDD assessments on most villages, paid through the property tax bill',
      'Construction almost entirely post 1995, built to modern codes',
    ],
    faq: [
      ['What is a CDD and how is it different from an HOA?',
       'A Community Development District is a special taxing district that financed the infrastructure of the community, meaning the roads, utilities, and amenities. You repay it through an assessment on your annual property tax bill, separate from and in addition to HOA dues. It can run well over a thousand dollars a year. Some villages have paid theirs off and some have decades left, so it is one of the first numbers I pull on any Lakewood Ranch property.'],
      ['Is it really in two counties?',
       'Yes. The community straddles the Manatee and Sarasota county line, and the county a parcel sits in determines its property tax rate, its school assignment, and which county government you deal with. Buyers regularly assume the whole community is one or the other. It is worth confirming for any specific address.'],
      ['How far is it to the beach from Lakewood Ranch?',
       'Realistically thirty five to forty five minutes to Anna Maria Island or Siesta Key depending on where in the community you are and what season it is. That is the honest tradeoff for newer construction and the amenities. People who want to be at the water regularly tend to weigh that drive carefully.'],
    ],
    nearby: ['greyhawk-landing', 'mill-creek', 'river-strand', 'waterlefe'],
  },
  {
    slug: 'greyhawk-landing', name: 'Greyhawk Landing', group: 'east',
    county: 'Manatee County', lat: 27.4842, lng: -82.4092,
    priceRange: null,
    toBeach: 'About 35 to 40 minutes',
    styles: 'Single family, Mediterranean and Florida transitional, built 2000s',
    intro: [
      'Greyhawk Landing is a gated community east of Bradenton off State Road 64, built largely in the 2000s across a large parcel with a significant amount of the land left as lakes and preserve.',
      'It is one of the larger single family communities in east Manatee County outside of Lakewood Ranch, with two amenity centers and its own CDD.',
    ],
    known: [
      'Gated entry with two separate amenity centers and pools',
      'A large share of the acreage kept as lakes, wetlands, and preserve',
      'Trails and boardwalks through the preserve areas',
      'A CDD assessment on the annual property tax bill',
      'Construction concentrated in the 2000s and early 2010s',
    ],
    faq: [
      ['What do the assessments run here?',
       'Greyhawk Landing carries both HOA dues and a CDD assessment, and the CDD appears on the property tax bill rather than being billed separately. The combined figure varies by phase and lot, so it needs to be pulled for the specific parcel. I do that before we tour rather than after you like the house.'],
      ['What is the appeal versus Lakewood Ranch?',
       'Generally a lower price point for comparable square footage, a single community rather than a collection of villages, and a considerable amount of preserve within the gates. Lakewood Ranch offers more amenities, more dining, and more inventory. It comes down to whether you want the larger ecosystem or a self contained community.'],
      ['Are homes here newer than in Bradenton proper?',
       'Substantially. Most of Greyhawk Landing was built in the 2000s, versus mid century construction across much of west Bradenton. That usually means newer roofs and systems, construction to more recent codes, and generally easier insurance placement, which is a real cost difference.'],
    ],
    nearby: ['lakewood-ranch', 'mill-creek', 'river-strand'],
  },
  {
    slug: 'mill-creek', name: 'Mill Creek', group: 'east',
    county: 'Manatee County', lat: 27.4744, lng: -82.3873,
    priceRange: null,
    toBeach: 'About 40 minutes',
    styles: 'Single family on larger lots, 1990s through 2000s construction',
    intro: [
      'Mill Creek is a residential community in east Manatee County near Lakewood Ranch, built out mostly through the 1990s and 2000s. What distinguishes it from most of its neighbors is lot size. Parcels here run considerably larger than the typical master planned subdivision.',
      'It has no CDD, which is unusual for the area and makes the carrying cost comparison against nearby communities more favorable than the sale price alone suggests.',
    ],
    known: [
      'Lot sizes noticeably larger than surrounding master planned communities',
      'No Community Development District assessment',
      'Construction concentrated in the 1990s and 2000s',
      'Close to Lakewood Ranch amenities without the Lakewood Ranch assessments',
      'Lakes and preserve areas within the community',
    ],
    faq: [
      ['Why does the absence of a CDD matter?',
       'Because a CDD assessment can run well over a thousand dollars a year on top of HOA dues, and it is repaid over decades. Two homes at the same list price can carry very different monthly costs depending on whether one of them is inside a CDD. Mill Creek not having one is a genuine financial difference, not a technicality.'],
      ['How large are the lots really?',
       'Larger than the quarter acre typical of nearby master planned communities, with many parcels running to half an acre or more depending on the phase. Exact size varies by section, so it is worth confirming per property rather than assuming from the community.'],
      ['What is the tradeoff versus Lakewood Ranch?',
       'Fewer shared amenities. Lakewood Ranch has the trail network, the amenity centers, Main Street and Waterside Place. Mill Creek gives you land and a lower carrying cost. Many buyers here are trading community amenities for a bigger yard.'],
    ],
    nearby: ['lakewood-ranch', 'greyhawk-landing', 'river-strand'],
  },
  {
    slug: 'waterlefe', name: 'Waterlefe', group: 'east',
    county: 'Manatee County', lat: 27.5089, lng: -82.4497,
    priceRange: null,
    toBeach: 'About 35 to 40 minutes',
    styles: 'Single family, maintenance free villas, golf and river frontage',
    intro: [
      'Waterlefe sits on the Manatee River in northeast Bradenton and is one of the few communities in the county to combine a golf course with a marina offering river access. It was developed beginning in the late 1990s.',
      'The marina gives boaters a route down the Manatee River to Tampa Bay and the Gulf beyond, which is unusual for a golf community this far inland.',
    ],
    known: [
      'A community marina with access to the Manatee River',
      'An eighteen hole golf course running through the community',
      'River frontage and preserve along the northern edge',
      'A river club with dining and fitness',
      'Both single family homes and maintenance free villas',
    ],
    faq: [
      ['Is golf membership required?',
       'Membership structures at golf communities change over time and are set by the club rather than by the real estate. Whether a given property carries a mandatory membership, an optional one, or a separate equity requirement needs to be confirmed in writing for that specific property before you commit.'],
      ['How usable is the marina for a larger boat?',
       'That depends on slip availability, draft, and bridge clearances between the marina and open water on the Manatee River. Those constraints are specific enough that anyone buying here for the boating should verify them against the actual vessel rather than the brochure.'],
      ['What are the assessments like?',
       'Waterlefe has both a CDD and community association dues, and there are additional costs tied to the river club. The full picture varies by property type, since villas and single family homes carry different maintenance obligations. I pull the complete number rather than the headline HOA figure.'],
    ],
    nearby: ['lakewood-ranch', 'river-strand', 'ellenton'],
  },
  {
    slug: 'river-strand', name: 'River Strand and Heritage Harbour', group: 'east',
    county: 'Manatee County', lat: 27.5019, lng: -82.4664,
    priceRange: null,
    toBeach: 'About 35 to 40 minutes',
    styles: 'Condominiums, coach homes, villas, single family, golf frontage',
    intro: [
      'Heritage Harbour is a large master planned area just east of I-75 at State Road 64, and River Strand is the gated golf community within it. Together they hold one of the widest ranges of price points in east Manatee County, from condominiums to single family homes.',
      'The location right at the interstate makes it one of the quicker east county drives to both Bradenton and the Sarasota airport.',
    ],
    known: [
      'A twenty seven hole golf course inside the River Strand gates',
      'A wide range of housing from condominiums through single family',
      'Immediate I-75 access at State Road 64',
      'A community park with sports fields and a lake in Heritage Harbour',
      'Separate associations and fee structures between the sub communities',
    ],
    faq: [
      ['What is the difference between Heritage Harbour and River Strand?',
       'Heritage Harbour is the larger master planned area. River Strand is the gated golf community inside it. They have different associations, different fee structures, and different amenity access, so a listing in Heritage Harbour does not necessarily include River Strand golf or club privileges. It is a common point of confusion and worth being precise about.'],
      ['Do condominiums here carry golf membership?',
       'Some do and some do not, and in certain buildings a membership is bundled into the association dues. Because this varies by building and by phase, the specific documents for that unit are the only reliable source. I read them before we make an offer.'],
      ['Why do prices vary so much within one community?',
       'Because the housing types vary so much. A two bedroom condominium and a single family home on the golf course are both technically River Strand. That range is why a valuation here has to be based on comparable sales of the same product type rather than on a community average.'],
    ],
    nearby: ['lakewood-ranch', 'waterlefe', 'greyhawk-landing', 'ellenton'],
  },

  /* -------------------------------------------------------------- north -- */
  {
    slug: 'palmetto', name: 'Palmetto', group: 'north',
    county: 'Manatee County', lat: 27.5214, lng: -82.5723,
    priceRange: null,
    toBeach: 'About 25 to 30 minutes',
    styles: 'Historic homes, mid century, riverfront, newer construction',
    intro: [
      'Palmetto sits directly across the Manatee River from Bradenton and is a city in its own right, with its own downtown, its own historic district, and a working waterfront. It is older than most of what surrounds it.',
      'The riverfront position gives it direct access out to Tampa Bay, and prices have historically run below comparable property on the south side of the river.',
    ],
    known: [
      'A historic downtown and a designated historic district',
      'Manatee River frontage with direct access toward Tampa Bay',
      'The Green Bridge and US 41 connecting directly to Bradenton',
      'Emerson Point Preserve at the western end of the peninsula',
      'Generally lower price points than the equivalent south of the river',
    ],
    faq: [
      ['How is Palmetto different from Bradenton?',
       'It is a separate city with its own government, its own utilities in places, and its own downtown. Practically it is minutes from Bradenton across the bridge, but the tax rates, permitting, and services follow the city of Palmetto rather than Bradenton or the county.'],
      ['What is the historic district?',
       'Palmetto has a designated historic district containing a concentration of late nineteenth and early twentieth century homes. Properties within it can be subject to review for exterior changes and demolition. Whether a particular property falls inside the district is a question for the city, and worth asking before planning renovations.'],
      ['Is the riverfront here practical for boating?',
       'The Manatee River gives direct access out to Tampa Bay and the Gulf beyond without crossing a pass, which some boaters prefer. As always, the constraints are draft, dock condition and permitting, and bridge clearances on the route, and those are specific to the property rather than to the area.'],
    ],
    nearby: ['ellenton', 'parrish', 'downtown-bradenton'],
  },
  {
    slug: 'parrish', name: 'Parrish', group: 'north',
    county: 'Manatee County', lat: 27.5722, lng: -82.4256,
    priceRange: '[[FILL IN: verify, research suggested roughly $409,000 to $450,000]]',
    toBeach: 'About 40 to 50 minutes',
    styles: 'New construction, single family, villas, townhomes',
    intro: [
      'Parrish is the fastest growing part of Manatee County and where most of its new construction inventory currently sits. It was farmland and small holdings until recently, and it is now a corridor of master planned communities running north from the Manatee River toward the Hillsborough county line.',
      'Buying here mostly means buying new. That comes with the advantages of current codes and builder warranties, and the complications that come with buying from a builder rather than an owner.',
    ],
    known: [
      'The largest concentration of new construction inventory in the county',
      'Master planned communities along US 301 and Fort Hamer Road',
      'The Fort Hamer Bridge connecting across the river toward Lakewood Ranch',
      'A commute north toward Tampa that many residents make',
      'CDD assessments on most of the newer communities',
    ],
    faq: [
      ['What should I know about buying from a builder here?',
       'That the builder contract is not the standard Florida contract and it is written to favor the builder. Completion dates are often not firm, the deposit terms differ, and the ability to walk away is more limited than in a resale. Having representation at the model home matters, and in most cases the builder pays for it, but you generally have to register me on your first visit rather than after.'],
      ['Why are prices lower here than closer to the water?',
       'Distance, mostly. Parrish is forty to fifty minutes from the Gulf beaches, and that drive is the tradeoff for newer construction at a lower price per square foot. For buyers who work from home or commute north toward Tampa, it can be the right trade. For buyers who came for the beach, it often is not.'],
      ['Is the growth here a problem?',
       'It is a real consideration rather than a problem exactly. Road capacity, school capacity, and construction traffic are all following rather than leading the housing. If you buy into an early phase of a community you should expect construction around you for years. I would rather you know that going in.'],
    ],
    nearby: ['palmetto', 'ellenton', 'lakewood-ranch'],
  },
  {
    slug: 'ellenton', name: 'Ellenton', group: 'north',
    county: 'Manatee County', lat: 27.5217, lng: -82.4779,
    priceRange: null,
    toBeach: 'About 35 to 40 minutes',
    styles: 'Mid century, manufactured housing communities, newer subdivisions',
    intro: [
      'Ellenton sits on the north bank of the Manatee River at I-75, and it is best known regionally for the outlet mall and the Gamble Plantation historic site. Residentially it is a mix of older housing, a number of manufactured home communities, and newer subdivisions filling in around them.',
      'The interstate position makes it one of the more convenient points in the county for driving anywhere else in the region.',
    ],
    known: [
      'Immediate I-75 access, with Tampa and Sarasota both reachable quickly',
      'The Gamble Plantation Historic State Park, the oldest structure in the area',
      'Ellenton Ice and Sports Complex',
      'A significant amount of manufactured housing inventory',
      'Manatee River frontage on the southern edge',
    ],
    faq: [
      ['What should I know about buying in a manufactured home community?',
       'Whether you own the land or lease it, first, because that changes everything about financing, resale, and monthly cost. Land lease communities carry a monthly lot rent that can rise, and financing on the home itself is generally not a conventional mortgage. These are legitimate options for the right buyer, but they need to be understood before rather than after.'],
      ['Is Ellenton a good commuter location?',
       'It is among the better ones in the county for that purpose. Sitting at I-75 on the north side of the river puts Tampa, St Petersburg, and Sarasota all within a reasonable drive. That is the main reason people choose it over areas closer to the beach.'],
      ['How much new construction is there?',
       'Less than Parrish immediately to the northeast, but it has been increasing as that corridor fills in. Inventory here is more mixed than in the newer master planned areas, which means more variety and more careful comparable sales work.'],
    ],
    nearby: ['palmetto', 'parrish', 'river-strand'],
  },

  /* ------------------------------------------------------------ central -- */
  {
    slug: 'downtown-bradenton', name: 'Downtown Bradenton and the Village of the Arts',
    group: 'central',
    county: 'Manatee County', lat: 27.4989, lng: -82.5748,
    priceRange: null,
    toBeach: 'About 20 minutes',
    styles: 'Bungalows, historic cottages, riverfront condominiums, live work',
    intro: [
      'Downtown Bradenton runs along the south bank of the Manatee River, with the Riverwalk connecting the waterfront and the cultural buildings that sit on it. Just south of it is the Village of the Arts, a neighborhood of small 1920s through 1940s cottages rezoned to allow residents to run galleries and studios out of their homes.',
      'The two together are the part of the county that feels least like a subdivision, and the housing is correspondingly older and more varied.',
    ],
    known: [
      'The Riverwalk, running along the Manatee River through downtown',
      'The Village of the Arts, zoned for live and work use',
      'The Bishop Museum of Science and Nature and the Manatee Performing Arts Center',
      'Riverfront condominium buildings with direct water views',
      'Housing stock largely from the 1920s through the 1940s',
    ],
    faq: [
      ['What does live and work zoning mean in the Village of the Arts?',
       'The neighborhood carries a zoning overlay that permits residents to operate certain small businesses, most commonly galleries and studios, from their homes. The permitted uses and requirements are set by the city of Bradenton and are specific. If running a business from the property is part of your plan, we confirm the allowed use for that exact parcel with the city.'],
      ['What should I expect from homes of this age?',
       'Original wood frame construction, older electrical and plumbing, and often no central air in the earliest homes unless it has been added. Insurers look closely at roof, wiring, and plumbing on properties this old. Many have been renovated and many have not, and the difference between the two is substantial in both price and insurability.'],
      ['Are the riverfront condominiums subject to the new inspection rules?',
       'The taller buildings are. Florida milestone inspection and structural integrity reserve study requirements apply to condominium buildings three stories and above, and downtown has several. As anywhere, that makes the association budget, the reserve study, and the inspection report essential reading before an offer.'],
    ],
    nearby: ['riverview-boulevard', 'west-bradenton', 'palmetto', 'bayshore-gardens'],
  },
  {
    slug: 'riverview-boulevard', name: 'Riverview Boulevard', group: 'central',
    county: 'Manatee County', lat: 27.5011, lng: -82.5951,
    priceRange: null,
    toBeach: 'About 15 to 20 minutes',
    styles: 'Historic estates, 1920s revival, mid century, riverfront',
    intro: [
      'Riverview Boulevard runs west from downtown Bradenton along the south bank of the Manatee River, and it holds the oldest concentration of substantial homes in the city. Many date to the 1910s and 1920s land boom, and several are on the National Register.',
      'It is a linear neighborhood rather than a subdivision, defined by the river on one side and the boulevard itself, which is lined with mature oaks.',
    ],
    known: [
      'Some of the oldest surviving substantial homes in Manatee County',
      'Direct Manatee River frontage on the north side of the boulevard',
      'Mature oak canopy along the length of the street',
      'Several properties listed on the National Register of Historic Places',
      'A short drive to both downtown and the Manatee Avenue beach route',
    ],
    faq: [
      ['What is involved in owning a historic home here?',
       'More maintenance and more specialized trades than a newer house, and potentially review requirements for exterior work if the property carries a historic designation. Insurance can also be more involved, since replacement cost on original construction is not straightforward. None of that is a reason to avoid these homes, but it should be understood before you buy one.'],
      ['Is the riverfront side worth the premium?',
       'Riverfront parcels here carry a clear premium, and the questions that go with it are seawall condition, dock permitting, and flood zone. Those three items are where the real money is on a riverfront purchase, and they are worth investigating before an offer rather than during inspection.'],
      ['How does this compare to the Village of the Arts?',
       'Both are historic, but the housing is different in scale. Riverview Boulevard has larger homes on larger parcels, many with river frontage. The Village of the Arts is small cottages on small lots with live and work zoning. They are close together geographically and quite far apart in price.'],
    ],
    nearby: ['downtown-bradenton', 'west-bradenton', 'palma-sola'],
  },
];

/* ========================================================================= */
/* TEMPLATE                                                                  */
/* ========================================================================= */

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const jsonEsc = (s) => JSON.stringify(String(s)).slice(1, -1);

function head({ title, description, canonical, image, imageAlt, extraLd }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
  <meta name="description" content="${esc(description)}" />

  <link rel="canonical" href="https://${DOMAIN}/${canonical}" />
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="author" content="Jennifer [[LAST]]" />
  <meta name="geo.region" content="US-FL" />
  <meta name="geo.placename" content="Bradenton, Florida" />

  <meta property="og:site_name" content="Jennifer [[LAST]], Real Estate" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://${DOMAIN}/${canonical}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="https://${DOMAIN}/${image}" />
  <meta property="og:image:alt" content="${esc(imageAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="https://${DOMAIN}/${image}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/styles.css" />
${extraLd}
</head>`;
}

function nav(prefix) {
  return `
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="nav" id="nav">
    <div class="nav__inner">
      <a href="${prefix}index.html" class="nav__brand">
        <span class="nav__brand-text">
          <span class="nav__brand-name">Jennifer [[LAST]]</span>
          <span class="nav__brand-sub">[[FIRM]]</span>
        </span>
      </a>
      <nav class="nav__links" aria-label="Primary">
        <a href="${prefix}index.html#listings">Listings</a>
        <a href="${prefix}buyers.html">Buyers</a>
        <a href="${prefix}sellers.html">Sellers</a>
        <a href="${prefix}neighborhoods.html" aria-current="page">Neighborhoods</a>
        <a href="${prefix}new-construction.html">New Construction</a>
        <a href="${prefix}relocate.html">Relocating</a>
        <a href="${prefix}about.html">About</a>
        <a href="${prefix}index.html#contact">Contact</a>
      </nav>
      <a href="tel:[[TEL]]" class="nav__cta">
        <span class="nav__cta-num">[[PHONE]]</span>
        <span class="nav__cta-firm">[[FIRM]]</span>
      </a>
      <button class="nav__burger" id="burger" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;
}

function footer(prefix) {
  return `
  <footer class="footer">
    <div class="wrap">
      <div class="footer__top">
        <div>
          <p class="footer__brand-name">Jennifer [[LAST]]</p>
          <p class="footer__tagline">
            Buying and selling across Bradenton, the barrier islands, and
            Lakewood Ranch.
          </p>
        </div>
        <div>
          <p class="footer__title">Explore</p>
          <ul class="footer__list">
            <li><a href="${prefix}buyers.html">Buyers</a></li>
            <li><a href="${prefix}sellers.html">Sellers</a></li>
            <li><a href="${prefix}neighborhoods.html">Neighborhoods</a></li>
            <li><a href="${prefix}new-construction.html">New Construction</a></li>
            <li><a href="${prefix}relocate.html">Relocating</a></li>
          </ul>
        </div>
        <div>
          <p class="footer__title">More</p>
          <ul class="footer__list">
            <li><a href="${prefix}about.html">About</a></li>
            <li><a href="${prefix}index.html#listings">Listings</a></li>
            <li><a href="${prefix}index.html#guide">Free Guide</a></li>
            <li><a href="${prefix}accessibility.html">Accessibility</a></li>
            <li><a href="${prefix}index.html#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer__contact">
          <p class="footer__title">Contact</p>
          <address>
            <a href="tel:[[TEL]]">[[PHONE]]</a><br />
            <a href="mailto:[[EMAIL]]">[[EMAIL]]</a><br />
            [[OFFICE]]<br />
            Bradenton, FL
          </address>
          <span class="footer__firm">
            <b>[[FIRM]]</b><br />
            Jennifer [[LAST]], Licensed Real Estate Agent<br />
            Florida License [[LICENSE]]
          </span>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__legal">
          &copy; <span class="js-year"></span> Jennifer [[LAST]], Licensed Real
          Estate Agent. Florida License [[LICENSE]]. Brokered by [[FIRM]].
          Neighborhood descriptions are general guidance about places and are
          not a representation about price, schools, or availability. Listing
          information is deemed reliable but is not guaranteed and is subject to
          change or prior sale. This site is not intended to solicit properties
          already listed with another broker.
        </p>
        <p class="footer__legal footer__eho">
          <span class="eho-mark" aria-hidden="true"></span>
          <span>
            Equal Housing Opportunity. I am committed to the letter and the
            spirit of the Fair Housing Act, and I do not discriminate on the
            basis of race, color, religion, sex, familial status, national
            origin, disability, or any other class protected by federal or
            Florida law.
          </span>
        </p>
      </div>
    </div>
  </footer>

  <script src="${prefix}js/reveal.js"></script>
  <script src="${prefix}js/main.js"></script>
</body>
</html>
`;
}

function areaPage(a) {
  const group = GROUPS.find((g) => g.key === a.group);
  const title = `${a.name} Homes for Sale | Bradenton Area | Jennifer [[LAST]]`;
  const description = `What to know about buying or selling in ${a.name}, ${a.county}. ` +
    `Housing styles, flood and insurance considerations, and what the area is actually like.`;

  const ld = `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://${DOMAIN}/" },
          { "@type": "ListItem", "position": 2, "name": "Neighborhoods", "item": "https://${DOMAIN}/neighborhoods.html" },
          { "@type": "ListItem", "position": 3, "name": "${jsonEsc(a.name)}", "item": "https://${DOMAIN}/neighborhoods/${a.slug}.html" }
        ]
      },
      {
        "@type": "Place",
        "name": "${jsonEsc(a.name)}",
        "description": "${jsonEsc(a.intro[0])}",
        "geo": { "@type": "GeoCoordinates", "latitude": ${a.lat}, "longitude": ${a.lng} },
        "containedInPlace": { "@type": "AdministrativeArea", "name": "${jsonEsc(a.county)}, Florida" }
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
${a.faq.map(([q, ans]) => `          {
            "@type": "Question",
            "name": "${jsonEsc(q)}",
            "acceptedAnswer": { "@type": "Answer", "text": "${jsonEsc(ans)}" }
          }`).join(',\n')}
        ]
      }
    ]
  }
  </script>`;

  const nearbyLinks = a.nearby
    .map((slug) => DATA.find((d) => d.slug === slug))
    .filter(Boolean)
    .map((n) => `        <li><a href="${n.slug}.html">${esc(n.name)}</a></li>`)
    .join('\n');

  return head({
    title, description,
    canonical: `neighborhoods/${a.slug}.html`,
    image: 'assets/hero-neighborhoods.webp',
    imageAlt: 'The Gulf Coast of Florida seen from above, with palms and white sand.',
    extraLd: ld,
  }) + `
<body>
${nav('../')}

  <main id="main" tabindex="-1">

  <section class="page-hero">
    <img class="page-hero__img" src="../assets/hero-neighborhoods.webp"
         width="1800" height="1013" fetchpriority="high"
         alt="The Gulf Coast of Florida seen from above, with palms and white sand." />
    <div class="page-hero__veil" aria-hidden="true"></div>
    <div class="page-hero__content">
      <p class="eyebrow reveal">${esc(group ? group.title : 'Manatee County')}</p>
      <h1 class="page-hero__title reveal" style="--d:.08s">${esc(a.name)}</h1>
      <p class="page-hero__lede reveal" style="--d:.18s">${esc(a.county)}, Florida</p>
    </div>
  </section>

  <nav class="wrap" aria-label="Breadcrumb" style="padding-top:2rem">
    <ol style="list-style:none;padding:0;margin:0;display:flex;flex-wrap:wrap;gap:.5rem;font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)">
      <li><a href="../index.html">Home</a></li>
      <li aria-hidden="true">/</li>
      <li><a href="../neighborhoods.html">Neighborhoods</a></li>
      <li aria-hidden="true">/</li>
      <li aria-current="page">${esc(a.name)}</li>
    </ol>
  </nav>

  <section class="section section--tight">
    <div class="wrap">
      <div class="prose">
${a.intro.map((p, i) => `        <p class="lede-lg reveal"${i === 0 ? '' : ' hidden'} style="--d:.05s">${esc(p)}</p>`)[0]}
${a.intro.slice(1).map((p, i) => `        <p class="reveal" style="--d:.${12 + i * 6}s">${esc(p)}</p>`).join('\n')}
      </div>

      <dl class="stats reveal" style="--d:.2s;border-color:var(--line);color:var(--ink)">
        <div class="stat">
          <dt class="stat__label" style="color:var(--muted);margin:0 0 .6rem">To the Beach</dt>
          <dd style="margin:0;font-family:var(--display);font-size:1.5rem">${esc(a.toBeach)}</dd>
        </div>
        <div class="stat">
          <dt class="stat__label" style="color:var(--muted);margin:0 0 .6rem">Typical Range</dt>
          <dd style="margin:0;font-family:var(--display);font-size:1.5rem">${esc(a.priceRange || '[[FILL IN: pull from Stellar MLS]]')}</dd>
        </div>
        <div class="stat">
          <dt class="stat__label" style="color:var(--muted);margin:0 0 .6rem">What Was Built Here</dt>
          <dd style="margin:0;font-size:.95rem;line-height:1.6">${esc(a.styles)}</dd>
        </div>
      </dl>
    </div>
  </section>

  <section class="section section--bone2">
    <div class="wrap">
      <div class="section__head">
        <p class="eyebrow reveal">The Details</p>
        <h2 class="section__title reveal" style="--d:.08s">What defines ${esc(a.name)}.</h2>
      </div>
      <ul class="guide__list reveal" style="--d:.14s;max-width:70ch">
${a.known.map((k) => `        <li>${esc(k)}</li>`).join('\n')}
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head">
        <p class="eyebrow reveal">Questions</p>
        <h2 class="section__title reveal" style="--d:.08s">What people ask me about ${esc(a.name)}.</h2>
      </div>
      <div class="faq">
${a.faq.map(([q, ans], i) => `        <details class="faq__item reveal" style="--d:.${i * 6}s">
          <summary>${esc(q)}</summary>
          <div class="faq__answer"><p>${esc(ans)}</p></div>
        </details>`).join('\n')}
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="wrap">
      <div class="section__head">
        <p class="eyebrow reveal">Nearby</p>
        <h2 class="section__title reveal" style="--d:.08s">Areas next to ${esc(a.name)}.</h2>
      </div>
      <ul class="footer__list reveal" style="--d:.14s;columns:2;max-width:40rem">
${nearbyLinks}
      </ul>
      <p style="margin-top:3rem">
        <a href="../index.html#contact" class="btn btn--solid">Ask Me About ${esc(a.name)}</a>
      </p>
    </div>
  </section>

  </main>
${footer('../')}`;
}

function hubPage() {
  const title = 'Bradenton Area Neighborhoods | Manatee County Guide | Jennifer [[LAST]]';
  const description =
    'A guide to the areas of Manatee County, from Anna Maria Island and Cortez ' +
    'to Lakewood Ranch and Parrish. What was built where, and what to know before buying.';

  const ld = `  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://${DOMAIN}/" },
          { "@type": "ListItem", "position": 2, "name": "Neighborhoods", "item": "https://${DOMAIN}/neighborhoods.html" }
        ]
      },
      {
        "@type": "ItemList",
        "name": "Manatee County neighborhoods",
        "itemListElement": [
${DATA.map((a, i) => `          { "@type": "ListItem", "position": ${i + 1}, "name": "${jsonEsc(a.name)}", "url": "https://${DOMAIN}/neighborhoods/${a.slug}.html" }`).join(',\n')}
        ]
      }
    ]
  }
  </script>`;

  const groups = GROUPS.map((g) => {
    const areas = DATA.filter((a) => a.group === g.key);
    if (!areas.length) return '';
    return `
      <div class="section__head" style="margin-top:4rem">
        <p class="eyebrow reveal">${esc(g.title)}</p>
        <p class="section__lede reveal" style="--d:.08s;margin-top:.4rem">${esc(g.intro)}</p>
      </div>
      <div class="paths__grid">
${areas.map((a, i) => `        <a class="path reveal reveal--scale" href="neighborhoods/${a.slug}.html" style="--d:.${(i % 3) * 8}s">
          <div class="path__body">
            <h3 class="path__title">${esc(a.name)}</h3>
            <p class="path__text">${esc(a.intro[0].split('. ').slice(0, 2).join('. ') + '.')}</p>
            <span class="path__link">Explore ${esc(a.name.split(' and ')[0])}</span>
          </div>
        </a>`).join('\n')}
      </div>`;
  }).join('\n');

  return head({
    title, description,
    canonical: 'neighborhoods.html',
    image: 'assets/hero-neighborhoods.webp',
    imageAlt: 'The Gulf Coast of Florida seen from above, with palms and white sand.',
    extraLd: ld,
  }).replace(/\.\.\//g, '') + `
<body>
${nav('')}

  <main id="main" tabindex="-1">

  <section class="page-hero">
    <img class="page-hero__img" src="assets/hero-neighborhoods.webp"
         width="1800" height="1013" fetchpriority="high"
         alt="The Gulf Coast of Florida seen from above, with palms and white sand." />
    <div class="page-hero__veil" aria-hidden="true"></div>
    <div class="page-hero__content">
      <p class="eyebrow reveal">Manatee County</p>
      <h1 class="page-hero__title reveal" style="--d:.08s">
        Bradenton is not one market.
      </h1>
      <p class="page-hero__lede reveal" style="--d:.18s">
        It is about twenty of them, and they behave differently. Here is what
        each one actually is.
      </p>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <p class="lede-lg reveal" style="max-width:60ch">
        Anna Maria and Parrish are forty minutes apart and have almost nothing
        in common. One is a barrier island with coastal flood zones and rental
        rules that change by the block. The other is new construction on former
        farmland with builder contracts and CDD assessments. Picking the wrong
        one for how you actually live is the most expensive mistake I see.
      </p>
${groups}
    </div>
  </section>

  </main>
${footer('')}`;
}

/* ========================================================================= */
/* WRITE                                                                     */
/* ========================================================================= */

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

let n = 0;
for (const area of DATA) {
  fs.writeFileSync(path.join(OUT_DIR, area.slug + '.html'), areaPage(area), 'utf8');
  n++;
}
fs.writeFileSync(path.join(ROOT, 'neighborhoods.html'), hubPage(), 'utf8');

const missingPrices = DATA.filter((a) => !a.priceRange).length;

console.log(`build-neighborhoods: wrote ${n} area pages plus the hub.`);
if (missingPrices) {
  console.log(
    `  ${missingPrices} of ${DATA.length} areas still have no price range and will ` +
    `render a visible [[FILL IN]].\n` +
    `  Fill them from Stellar MLS and set PRICES_AS_OF (currently: ${PRICES_AS_OF}).`
  );
}
