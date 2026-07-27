/* =============================================================================
   listings.seed.js — hand maintained fallback.

   Load order in the page is: listings.js (written by the scraper) first, then
   this file. main.js reads window.LISTINGS and falls back to window.LISTINGS_SEED,
   so the site is never blank and never blocked on the feed.

   This ships EMPTY on purpose. An empty feed renders the honest empty state
   ("reach out and I will send what is coming"), which is correct when there is
   nothing to show. It is not filled with invented sample homes, because a real
   estate site that displays properties that do not exist is a compliance
   problem, not a placeholder.

   To add a listing by hand, copy the shape below into `active`. Only `address`
   and one of `price` / `priceFormatted` are really required. Everything else
   degrades gracefully if absent.

     {
       address: '1234 Gulf Drive N',
       city: 'Bradenton Beach',
       state: 'FL',
       zip: '34217',
       price: 1250000,              // number, drives the price sort
       priceFormatted: '$1,250,000',// optional, overrides the formatted price
       beds: 3,
       baths: 2.5,
       sqft: 2140,
       area: 'Anna Maria Island',   // shown in the card footer
       description: 'Full listing remarks.',
       photo: 'https://.../photo-1.jpg',        // card and modal fallback
       photoLarge: 'https://.../photo-1.jpg',   // preferred for the card
       photos: ['https://.../1.jpg', '...'],    // modal gallery
       link: 'https://...',         // source listing page
       listingBroker: 'Name of the listing brokerage'  // required attribution
     }

   Attribution note: `listingBroker` is not decoration. MLS display rules
   require the listing brokerage to be named on every listing that is not hers.
   The modal prints it. Leave it out only for her own listings.
   ========================================================================== */

window.LISTINGS_SEED = {
  source: 'Preferred SHORE Real Estate',
  generatedAt: null,

  // Jennifer's own listings. These take priority over everything else and
  // flip the section heading to "My Listings".
  active: [],

  // Recently closed. Renders behind a "Sold" tag when present.
  sold: [],

  // Brokerage listings, grouped. Keys become tabs, labelled by teamLabels.
  team: {
    singleFamily: [],
    condos: [],
  },
  teamLabels: {
    singleFamily: 'Single Family',
    condos: 'Condos and Townhomes',
  },
};
