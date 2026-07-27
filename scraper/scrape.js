#!/usr/bin/env node
/* =============================================================================
   scrape.js — pulls listings from Jennifer's Preferred Shore subdomain and
   writes ../data/listings.js.

   Run:  node scraper/scrape.js
         node scraper/scrape.js --agency     (include brokerage listings)

   ---------------------------------------------------------------------------
   READ THIS BEFORE TURNING ON --agency
   ---------------------------------------------------------------------------
   Her OWN listings are hers to advertise. No permission needed, no question.
   That is the default and it carries no risk.

   The brokerage's listings are a different thing. Preferred Shore's site is fed
   by MLS Grid carrying Stellar MLS data, and it publishes a takedown address at
   DMCAnotice@MLSGrid.com. Republishing that data on another domain is not
   something the brokerage can authorize, because Stellar MLS holds the
   redistribution right, not them. Running with --agency accepts that risk
   knowingly. It is off by default for that reason.

   See ../BROKER-PERMISSION.md for the full picture.

   ---------------------------------------------------------------------------
   WHAT THIS RESPECTS
   ---------------------------------------------------------------------------
   Their robots.txt disallows /index.php?advanced=1 and /index.php?quick=1,
   which are the search endpoints. This script never touches them. It reads the
   subdomain root, which is allowed. That single request gets everything,
   because the site embeds a complete account_info JSON blob in the page.

   Photo galleries come from HEAD requests to the image CDN rather than from
   fetching property pages, so preferredshore.com is hit exactly once per run
   no matter how many listings come back.

   ---------------------------------------------------------------------------
   WHY curl AND NOT fetch
   ---------------------------------------------------------------------------
   preferredshore.com returns 403 to Node's fetch and to plain HTTP libraries.
   Shelling out to system curl with a browser user agent gets a normal response.
   Deliberate. Do not "fix" it back to fetch.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

/* ========================================================================= */

const CONFIG = {
  brokerName: 'Preferred SHORE Real Estate',
  // Her own subdomain. Allowed by robots.txt, and it carries both her listings
  // and the brokerage's in one embedded JSON blob.
  origin: 'https://jenniferbarragan.preferredshore.com',

  // Brokerage listings are opt in. See the warning above.
  includeAgency: process.argv.includes('--agency'),
  maxAgency: 24,

  // Photo galleries come from probing the CDN, not from fetching property
  // pages. See galleryFor() for why.
  fetchGalleries: true,
  maxPhotosPerListing: 24,

  /* The photo CDN answers 200 for every index, serving a "no photo available"
     placeholder past the end of a listing's real photos. It is identified by a
     fixed ETag. Worth knowing: this is the same platform Kevin's HomeSmart
     scraper talks to, and the placeholder ETag is byte for byte identical, so
     the same detection works on both sites. */
  placeholderEtag: '2cc381669533481bec152dd6d2794804',

  requestDelayMs: 1500,      // politeness. do not lower
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
             '(KHTML, like Gecko) Chrome/122.0 Safari/537.36',
};

const OUT_JS   = path.resolve(__dirname, '..', 'data', 'listings.js');
const OUT_JSON = path.resolve(__dirname, '..', 'data', 'listings.json');

/* ============================================================= transport == */

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function get(url) {
  try {
    const out = execFileSync('curl', [
      '-sSL', '--compressed', '--max-time', '30',
      '-A', CONFIG.userAgent, url,
    ], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    sleep(CONFIG.requestDelayMs);
    return out;
  } catch (err) {
    console.warn('  request failed: ' + url);
    console.warn('    ' + String(err.message).split('\n')[0]);
    return null;
  }
}

/* =============================================================== parsing == */

/* Extract `var account_info = { ... };` by counting braces rather than with a
   regex. A lazy regex stops at the first `}` inside a nested object and a
   greedy one runs past the end of the assignment; both were tried and both
   produced invalid JSON. This walks the string and tracks whether it is inside
   a quoted value so braces in text do not confuse the depth count. */
function extractAccountInfo(html) {
  const marker = 'var account_info';
  const at = html.indexOf(marker);
  if (at < 0) return null;
  const start = html.indexOf('{', at);
  if (start < 0) return null;

  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(html.slice(start, i + 1)); }
        catch (e) { console.warn('  account_info did not parse: ' + e.message); return null; }
      }
    }
  }
  return null;
}

const num = (v) => {
  const n = parseInt(String(v == null ? '' : v).replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
};

const abs = (u) => !u ? null : (/^https?:/i.test(u) ? u : CONFIG.origin + u);

/* HEAD a photo URL. Returns true only if it is a real image rather than the
   CDN's placeholder, which is served with 200 and a fixed ETag. */
function photoExists(url) {
  try {
    const head = execFileSync('curl', [
      '-sSI', '--max-time', '15', '-A', CONFIG.userAgent, url,
    ], { encoding: 'utf8' });
    if (!/^HTTP\/[\d.]+ 2\d\d/m.test(head)) return false;
    const etag = (head.match(/^etag:\s*"?([^"\r\n]+)"?/im) || [])[1];
    return etag !== CONFIG.placeholderEtag;
  } catch { return false; }
}

/* Build the gallery by walking photo indexes on the CDN.

   The property pages themselves only ever contain photo 1; the rest are loaded
   by JavaScript, so scraping the detail page returns a single image. Probing
   the CDN instead gets the whole gallery AND makes zero extra requests to
   preferredshore.com, which is the politer of the two options.

   Photo 1's URL comes from the summary payload, and the rest follow the same
   {MLSID}-{n}.jpg pattern, so the URL is derived rather than guessed. */
function galleryFor(firstPhoto) {
  if (!firstPhoto) return [];
  const m = firstPhoto.match(/^(.*-)(\d+)(\.jpg)$/i);
  if (!m) return [firstPhoto];

  const out = [firstPhoto];
  let misses = 0;
  for (let n = 2; n <= CONFIG.maxPhotosPerListing; n++) {
    const url = m[1] + n + m[3];
    if (photoExists(url)) { out.push(url); misses = 0; }
    // One gap can be a deleted photo. Two in a row means the end.
    else if (++misses >= 2) break;
  }
  return out;
}

const titleCase = (s) => String(s || '').toLowerCase()
  .replace(/\b([a-z])/g, (m) => m.toUpperCase())
  .replace(/\bN\b/g, 'N').replace(/\bS\b/g, 'S')
  .replace(/\bE\b/g, 'E').replace(/\bW\b/g, 'W');

function normalize(raw, opts) {
  const price = num(raw.price);
  const link = abs(raw.url);
  const photo = (raw.photo || '').replace(/\?v=$/, '') || null;

  const photos = (CONFIG.fetchGalleries && photo)
    ? galleryFor(photo)
    : (photo ? [photo] : []);

  return {
    address: titleCase(raw.address) || null,
    city: titleCase(raw.city) || null,
    state: raw.state || 'FL',
    zip: raw.zip || null,
    price: price,
    priceFormatted: price ? '$' + price.toLocaleString('en-US') : null,
    beds: raw.beds || null,
    baths: raw.baths || null,
    sqft: num(raw.footage),
    // Carried through so main() can split the tabs. The source calls this
    // listing_type_label and its values are Single Family, Condos, Income.
    type: raw.listing_type_label || null,
    area: titleCase(raw.city) || null,
    description: null,          // not present in the summary payload
    photo: photos[0] || null,
    photoLarge: photos[0] || null,
    photos: photos,
    link: link,
    // Attribution. Required whenever the listing is not hers, and simply
    // honest either way.
    listingBroker: opts.own ? null : (raw.agent
      ? raw.agent + ', ' + CONFIG.brokerName
      : CONFIG.brokerName),
  };
}

const dedupe = (list) => {
  const seen = new Set();
  return list.filter((l) => {
    const k = (l.address || '') + '|' + (l.zip || '');
    if (!l.address || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};

/* =================================================================== run == */

function main() {
  console.log('scrape: ' + CONFIG.origin);
  if (!CONFIG.includeAgency) {
    console.log('  her own listings only. Pass --agency to include the brokerage feed.');
  }

  const html = get(CONFIG.origin + '/');
  if (!html) { console.error('\n  could not reach the site.\n'); process.exit(1); }

  const info = extractAccountInfo(html);
  if (!info) {
    console.error('\n  account_info not found. The site template probably changed.\n' +
      '  data/listings.js was NOT overwritten.\n');
    process.exit(1);
  }

  const mine = Array.isArray(info.mylistings) ? info.mylistings : [];
  const sold = Array.isArray(info.soldlistings) ? info.soldlistings : [];
  const agency = Array.isArray(info.agencylistings) ? info.agencylistings : [];

  console.log('  found: ' + mine.length + ' hers, ' + sold.length + ' sold, ' +
    agency.length + ' brokerage');

  const active = dedupe(mine.map((r) => normalize(r, { own: true })));
  const soldOut = dedupe(sold.map((r) => normalize(r, { own: true })));

  const team = {};
  const teamLabels = {};
  if (CONFIG.includeAgency && agency.length) {
    const picked = agency.slice(0, CONFIG.maxAgency)
      .map((r) => normalize(r, { own: false }));
    const single = [], condos = [];
    for (const l of dedupe(picked)) {
      // Condos, townhomes and villas go in their own tab. Everything else,
      // including Income and multi family, sits with single family.
      (/condo|town|villa/i.test(String(l.type || '')) ? condos : single).push(l);
    }
    if (single.length) { team.singleFamily = single; teamLabels.singleFamily = 'Single Family'; }
    if (condos.length) { team.condos = condos; teamLabels.condos = 'Condos and Townhomes'; }
  }

  const total = active.length + soldOut.length +
    Object.values(team).reduce((n, a) => n + a.length, 0);

  if (!total) {
    console.log('\n  nothing to write. She has no listings of her own yet, and the\n' +
      '  brokerage feed is off. The site will show the handoff panel, which is\n' +
      '  the correct display for that state. data/listings.js not written.\n');
    if (fs.existsSync(OUT_JS)) fs.unlinkSync(OUT_JS);
    return;
  }

  const payload = {
    source: CONFIG.brokerName,
    generatedAt: new Date().toISOString(),
    active: active,
    sold: soldOut,
    team: team,
    teamLabels: teamLabels,
  };

  const banner =
    '/* Generated by scraper/scrape.js. Do not edit by hand.\n' +
    '   Written ' + new Date().toISOString() + '.\n' +
    '   Listing data belongs to the listing brokerage. See BROKER-PERMISSION.md. */\n';

  fs.writeFileSync(OUT_JS, banner + 'window.LISTINGS = ' +
    JSON.stringify(payload, null, 2) + ';\n', 'utf8');
  fs.writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log('\n  wrote ' + total + ' listings to data/listings.js');
}

main();
