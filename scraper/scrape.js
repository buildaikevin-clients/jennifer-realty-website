#!/usr/bin/env node
/* =============================================================================
   scrape.js — pulls Jennifer's and her brokerage's listings and writes
   ../data/listings.js and ../data/listings.json.

   Run:  npm run scrape        (from this folder)
   Or:   node scraper/scrape.js

   ---------------------------------------------------------------------------
   BEFORE THIS CAN RUN
   ---------------------------------------------------------------------------
   1. Fill in CONFIG.broker below. Nothing works until then, and the script
      exits with instructions rather than pretending.

   2. Get the broker's written permission. Bradenton is Stellar MLS territory
      and its IDX rules (Article 19) are stricter than most. Scraped data does
      not satisfy them regardless of where the HTML came from. See
      ../BROKER-PERMISSION.md for the request and the answer.

   The site works without this. main.js falls back to data/listings.seed.js and
   then to an honest empty state, so nothing is blocked on the feed.

   ---------------------------------------------------------------------------
   WHY curl AND NOT fetch
   ---------------------------------------------------------------------------
   Brokerage sites almost universally sit behind Cloudflare, which returns 403
   to Node's fetch on sight. Shelling out to the system curl gets a normal TLS
   fingerprint and works. This is deliberate. Do not "fix" it back to fetch.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ========================================================================= */
/* CONFIG                                                                    */
/* ========================================================================= */

const CONFIG = {
  // ---- REQUIRED. The script refuses to run until these are real. ---------
  broker: {
    name:    '[[FIRM]]',
    // Base URL of the brokerage's public site, no trailing slash.
    base:    '[[FILL IN: https://brokerage-site.com]]',
    // Jennifer's own agent profile page on that site.
    agent:   '[[FILL IN: https://brokerage-site.com/agents/jennifer-...]]',
    // The search results path. Most brokerage sites expose something like
    // /search?type=1&page=2. Fill in the real pattern once you can see it.
    searchPath: '[[FILL IN: /listings/search?...]]',
  },

  // ---- Geography. Manatee County, centered on Bradenton. -----------------
  center: { lat: 27.4989, lng: -82.5748 },
  radiusMiles: 25,

  // ---- Categories that become the carousel tabs. -------------------------
  categories: [
    { key: 'singleFamily', label: 'Single Family',        perTier: 8 },
    { key: 'condos',       label: 'Condos and Townhomes', perTier: 6 },
  ],

  // ---- Price tiers, calibrated to the Gulf Coast rather than inland. -----
  tiers: [
    { key: 'luxury',  label: 'Over $1M',        min: 1000000, max: null },
    { key: 'mid',     label: '$600K to $1M',    min: 600000,  max: 1000000 },
    { key: 'entry',   label: 'Under $600K',     min: null,    max: 600000 },
  ],

  // Anything outside this is a parse error, not a listing. Guards against
  // picking up a phone number or a lot size and treating it as a price.
  sanity: { min: 60000, max: 12000000 },

  // Politeness. Do not lower this.
  requestDelayMs: 1200,
  maxPhotosPerListing: 24,
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/122.0 Safari/537.36',
};

const OUT_JS   = path.resolve(__dirname, '..', 'data', 'listings.js');
const OUT_JSON = path.resolve(__dirname, '..', 'data', 'listings.json');

/* ========================================================================= */
/* GUARD                                                                     */
/* ========================================================================= */

function unconfigured() {
  const holes = [];
  const b = CONFIG.broker;
  if (!b.base   || b.base.includes('FILL IN'))       holes.push('broker.base');
  if (!b.agent  || b.agent.includes('FILL IN'))      holes.push('broker.agent');
  if (!b.searchPath || b.searchPath.includes('FILL IN')) holes.push('broker.searchPath');
  if (!b.name   || b.name.includes('FIRM'))          holes.push('broker.name');
  return holes;
}

/* ========================================================================= */
/* HTTP                                                                      */
/* ========================================================================= */

function sleep(ms) {
  // Synchronous, because the whole script is synchronous and the delay is
  // there to be polite rather than to be fast.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function get(url) {
  try {
    const out = execFileSync('curl', [
      '-sSL',
      '--compressed',
      '--max-time', '30',
      '-A', CONFIG.userAgent,
      url,
    ], { encoding: 'utf8', maxBuffer: 40 * 1024 * 1024 });
    sleep(CONFIG.requestDelayMs);
    return out;
  } catch (err) {
    console.warn(`  request failed: ${url}\n    ${err.message.split('\n')[0]}`);
    return null;
  }
}

// HEAD a URL and report whether it is a real image rather than the CDN's
// "photo coming soon" placeholder. Placeholders are detected by a stable
// content length or ETag, which is the trick that makes photo discovery work
// on sites that return 200 for every photo index.
function imageExists(url, placeholderSignature) {
  try {
    const head = execFileSync('curl', [
      '-sSI', '--max-time', '15', '-A', CONFIG.userAgent, url,
    ], { encoding: 'utf8' });
    if (!/^HTTP\/[\d.]+ 2\d\d/m.test(head)) return false;
    if (placeholderSignature) {
      const etag = (head.match(/^etag:\s*"?([^"\r\n]+)"?/im) || [])[1];
      const len  = (head.match(/^content-length:\s*(\d+)/im) || [])[1];
      if (etag && etag === placeholderSignature.etag) return false;
      if (len && len === placeholderSignature.length) return false;
    }
    return true;
  } catch { return false; }
}

/* ========================================================================= */
/* PARSING                                                                   */
/* ========================================================================= */

const strip = (html) => String(html)
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/&#39;|&rsquo;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ')
  .trim();

function parsePrice(text) {
  const m = String(text).match(/\$\s?([\d,]{3,})/);
  if (!m) return null;
  const n = parseInt(m[1].replace(/,/g, ''), 10);
  if (!Number.isFinite(n)) return null;
  if (n < CONFIG.sanity.min || n > CONFIG.sanity.max) return null;
  return n;
}

// Great circle distance in miles. Used to drop listings the brokerage returns
// that are actually in Sarasota or Hillsborough county.
function milesFrom(lat, lng) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat - CONFIG.center.lat);
  const dLng = toRad(lng - CONFIG.center.lng);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(CONFIG.center.lat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

/* Most brokerage platforms embed a JSON blob or JSON-LD for each listing card.
   That is far more reliable than scraping the rendered HTML, so try it first
   and fall back to markup only if nothing structured is present. */
function extractStructured(html) {
  const found = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const data = JSON.parse(m[1].trim());
      const items = Array.isArray(data) ? data : (data['@graph'] || [data]);
      for (const it of items) {
        const type = it['@type'];
        const types = Array.isArray(type) ? type : [type];
        if (types.some((t) => /Residence|Product|Offer|RealEstateListing|House|Apartment/i.test(t || ''))) {
          found.push(it);
        }
      }
    } catch { /* not our JSON, move on */ }
  }
  return found;
}

function normalize(raw, sourceUrl) {
  const addr = raw.address || {};
  const geo = raw.geo || {};
  const price = raw.price ||
    (raw.offers && (raw.offers.price || (raw.offers[0] && raw.offers[0].price)));
  const n = typeof price === 'string' ? parsePrice(price) : price;

  const lat = parseFloat(geo.latitude);
  const lng = parseFloat(geo.longitude);
  const listing = {
    address: raw.name || addr.streetAddress || null,
    city: addr.addressLocality || null,
    state: addr.addressRegion || 'FL',
    zip: addr.postalCode || null,
    price: Number.isFinite(n) ? n : null,
    beds: raw.numberOfBedrooms || raw.numberOfRooms || null,
    baths: raw.numberOfBathroomsTotal || raw.numberOfBathrooms || null,
    sqft: raw.floorSize && parseInt(raw.floorSize.value, 10) || null,
    description: raw.description ? strip(raw.description) : null,
    photo: null,
    photoLarge: null,
    photos: [],
    link: raw.url || sourceUrl || null,
    listingBroker: CONFIG.broker.name,
    area: null,
  };

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const d = milesFrom(lat, lng);
    if (d > CONFIG.radiusMiles) return null;   // outside Manatee County area
    listing.area = `${d} mi from Bradenton`;
  }

  const img = raw.image;
  if (typeof img === 'string') listing.photos = [img];
  else if (Array.isArray(img)) listing.photos = img.filter((x) => typeof x === 'string');
  else if (img && img.url) listing.photos = [img.url];
  listing.photos = listing.photos.slice(0, CONFIG.maxPhotosPerListing);
  listing.photo = listing.photos[0] || null;
  listing.photoLarge = listing.photos[0] || null;

  if (!listing.address || !listing.price) return null;
  return listing;
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((l) => {
    const key = `${(l.address || '').toLowerCase()}|${l.zip || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function inTier(l, tier) {
  if (tier.min !== null && l.price < tier.min) return false;
  if (tier.max !== null && l.price >= tier.max) return false;
  return true;
}

/* ========================================================================= */
/* RUN                                                                       */
/* ========================================================================= */

function main() {
  const holes = unconfigured();
  if (holes.length) {
    console.error(
      '\nscrape: not configured yet.\n\n' +
      '  Still to fill in scraper/scrape.js CONFIG:\n' +
      holes.map((h) => `    - ${h}`).join('\n') +
      '\n\n  Also required before the feed goes live publicly:\n' +
      '    - Written permission from the broker. See BROKER-PERMISSION.md.\n' +
      '      Bradenton is Stellar MLS territory and Article 19 IDX rules apply.\n\n' +
      '  The site works without this. It falls back to data/listings.seed.js.\n'
    );
    process.exit(2);
  }

  console.log(`scrape: ${CONFIG.broker.name}`);

  /* ---- 1. Jennifer's own listings from her agent profile ---------------- */
  let active = [];
  console.log('  fetching agent profile');
  const agentHtml = get(CONFIG.broker.agent);
  if (agentHtml) {
    active = dedupe(
      extractStructured(agentHtml)
        .map((r) => normalize(r, CONFIG.broker.agent))
        .filter(Boolean)
    );
    console.log(`    found ${active.length}`);
  }

  /* ---- 2. Brokerage listings by category and price tier ----------------- */
  const team = {};
  const teamLabels = {};

  for (const cat of CONFIG.categories) {
    teamLabels[cat.key] = cat.label;
    const bucket = [];

    for (const tier of CONFIG.tiers) {
      const url = CONFIG.broker.base + CONFIG.broker.searchPath
        .replace('{category}', cat.key)
        .replace('{min}', tier.min || '')
        .replace('{max}', tier.max || '');

      console.log(`  ${cat.label} / ${tier.label}`);
      const html = get(url);
      if (!html) continue;

      const found = extractStructured(html)
        .map((r) => normalize(r, url))
        .filter(Boolean)
        .filter((l) => inTier(l, tier))
        .slice(0, cat.perTier);

      console.log(`    ${found.length}`);
      bucket.push(...found);
    }

    team[cat.key] = dedupe(bucket);
  }

  const total = active.length + Object.values(team).reduce((n, a) => n + a.length, 0);

  if (total === 0) {
    console.error(
      '\n  Nothing was parsed. That usually means the search path or the page ' +
      'structure\n  is different from what this expects. Fetch one search URL ' +
      'by hand and look\n  at whether the listings are in JSON-LD. If they are ' +
      'not, the extractStructured\n  function needs a site specific parser ' +
      'added.\n\n  data/listings.js was NOT overwritten, so the site keeps ' +
      'whatever it had.\n'
    );
    process.exit(1);
  }

  const payload = {
    source: CONFIG.broker.name,
    generatedAt: new Date().toISOString(),
    active,
    sold: [],
    team,
    teamLabels,
  };

  const banner =
    '/* Generated by scraper/scrape.js. Do not edit by hand.\n' +
    `   Written ${new Date().toISOString()}.\n` +
    '   Listing data is the property of the listing brokerage and is displayed\n' +
    '   under the permission recorded in BROKER-PERMISSION.md. */\n';

  fs.writeFileSync(OUT_JS, banner + 'window.LISTINGS = ' +
    JSON.stringify(payload, null, 2) + ';\n', 'utf8');
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(`\n  wrote ${total} listings to data/listings.js`);
}

main();
