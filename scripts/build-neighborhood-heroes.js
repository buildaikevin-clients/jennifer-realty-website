#!/usr/bin/env node
/* =============================================================================
   build-neighborhood-heroes.js — rebuilds the 20 neighborhood page heroes from
   their licensed originals on Wikimedia Commons.

   Run:  node scripts/build-neighborhood-heroes.js
   Needs sharp:  npm install sharp        (dev only, not a site dependency)

   The originals are 94 MB and do not belong in a website repo, so they are not
   committed. The script downloads each one from the URL recorded beside it
   below and caches it in scripts/.hero-cache/ (git ignored). That cache is
   also the provenance record in executable form: if a URL ever dies, the file
   page in assets/neighborhoods/CREDITS.md is the way back.

   ---------------------------------------------------------------------------
   WHY THE FOCAL POINT MATTERS MORE THAN THE CROP
   ---------------------------------------------------------------------------
   The output is 1800x1013, which is 16:9. The hero box is nowhere near 16:9.
   `.page-hero` is `min-height: clamp(380px, 52vh, 560px)` across the full
   viewport width, so on a 1440px desktop it renders about 3.1:1, and
   `object-fit: cover` throws away the top and bottom of the file. Only the
   middle ~55% of every image is ever seen on a desktop. On a phone the box is
   taller than it is wide and the same thing happens sideways instead.

   So the file has to be cropped with the subject in the MIDDLE BAND, not
   merely inside the frame. `focus` below is where that band is taken from:
   0 is the top of the source, 1 is the bottom, .5 is centered. A few images
   also carry `zoom`/`fx` to crop in horizontally, which is how the "KEEP OFF
   JETTY" sign leaves the Bradenton Beach frame.

   Where `focus` is absent the image is cropped by sharp's saliency detector,
   which lands well on wide landscape compositions and badly on everything
   else. Anything with a built subject — a house, a bridge, a boardwalk —
   should carry an explicit number.

   Verify changes by rendering the page, not by looking at the file. The file
   always looks fine; the band is what ships.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('build-neighborhood-heroes: needs sharp.  npm install sharp');
  process.exit(1);
}

const ROOT = path.resolve(__dirname, '..');
const CACHE_DIR = path.join(__dirname, '.hero-cache');
const OUT_DIR = path.join(ROOT, 'assets', 'neighborhoods');

const UA = 'jennifer-realty-website hero build (contact via the site)';

const W = 1800, H = 1013;      // 16:9, matches the width/height attrs in the markup
const START_QUALITY = 72;
const BUDGET = 150 * 1024;     // step quality down until the file fits
const MIN_QUALITY = 28;

/* Source photograph per area, and how to crop it.
   url:   the Commons original. Author and license are in CREDITS.md and in the
          PHOTOS block of build-neighborhoods.js, which is what renders the
          on-page credit. Changing a url here means changing both of those.
   focus: 0 = top of the source, 1 = bottom. Omit to use saliency.
   zoom:  fraction of the source width to keep (default 1).
   fx:    horizontal anchor for that zoom, 0 = left, 1 = right. */
const U = 'https://upload.wikimedia.org/wikipedia/commons/';
const HEROES = {
  'anna-maria-island': {
    url: U + 'a/aa/Tranquil_Anna_Maria_Island.jpg', focus: 0.70 },
  'holmes-beach': {
    url: U + '7/74/SunsetHolmesBeachFlorida.jpg', focus: 0.38 },
  'bradenton-beach': {
    // zoomed off the right edge, which is where the KEEP OFF JETTY sign lives
    url: U + '2/28/Coquina_Beach_Jetty_%2828091850649%29.jpg', focus: 0.45, zoom: 0.62, fx: 0 },
  'longboat-key': {
    url: U + '1/11/Longboat-Key_Beach.jpg', focus: 0.60 },
  'cortez': {
    url: U + '1/1a/Cortez_FL_HD02.jpg', focus: 0.20 },
  'perico-island': {
    url: U + '6/62/Robinson_Perserve_-_panoramio.jpg' },
  'palma-sola': {
    url: U + 'e/e1/Palma_Sola_Botanical_Park_Lake_Overlook.png' },
  'west-bradenton': {
    url: U + 'a/a2/Sunset_in_Bradenton%2C_Florida._%2853458847305%29.jpg', position: 'north' },
  'bayshore-gardens': {
    url: U + '4/46/Sarasota_Bay_-_Longboat_Key%2C_Florida_2023-01-24.jpg' },
  'whitfield': {
    url: U + 'e/e5/Sarasota_FL_Whitfield_Estate04.jpg', focus: 0.20 },
  'lakewood-ranch': {
    url: U + '6/69/Lake_Nona_Golf_Course.jpg' },
  'greyhawk-landing': {
    url: U + 'e/e7/Emerson_Point_Preserve_Palmetto_Florida_2019-2541.jpg', focus: 0.80 },
  'mill-creek': {
    url: U + '6/6e/Lake_Manatee_SP_lake01.JPG' },
  'waterlefe': {
    url: U + 'e/ee/Manatee_River_Lift_Bridge_Bradenton_Florida_2019-2569.jpg' },
  'river-strand': {
    url: U + 'c/c4/1st_Tee_Sunrise_%2833977722393%29.jpg' },
  'palmetto': {
    url: U + 'c/c8/10th_Avenue_Palmetto_Florida_2019-12019.jpg' },
  'parrish': {
    url: U + '9/99/Fort_Hamer_Bridge.jpg' },
  'ellenton': {
    url: U + '0/05/Rocky_Bluff_Library_Ellenton_Florida_2019-12006.jpg', focus: 0.65 },
  'downtown-bradenton': {
    url: U + '9/90/Bradenton_Riverwalk.jpg', focus: 0.15 },
  'riverview-boulevard': {
    url: U + '6/60/Bradenton_FL_Richardson_House01.jpg', focus: 0.15 },
};

/* A 16:9 window on the source, placed by focus/zoom/fx. */
function window16x9(sw, sh, { focus, zoom = 1, fx = 0.5 }) {
  let cw = Math.round(Math.min(sw * zoom, sh * (W / H)));
  let ch = Math.round(cw * (H / W));
  if (ch > sh) { ch = sh; cw = Math.round(ch * (W / H)); }
  return {
    left: Math.max(0, Math.min(sw - cw, Math.round((sw - cw) * fx))),
    top: Math.max(0, Math.min(sh - ch, Math.round((sh - ch) * focus))),
    width: cw, height: ch,
  };
}

async function encode(pipeline, out) {
  let bytes = Infinity, q = START_QUALITY;
  for (; q >= MIN_QUALITY; q -= 6) {
    await pipeline().webp({ quality: q, effort: 6 }).toFile(out);
    bytes = fs.statSync(out).size;
    if (bytes <= BUDGET) break;
  }
  return { bytes, q: Math.max(q, MIN_QUALITY) };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* Commons rate limits hard on bursts, hence the backoff and the cache. */
async function source(slug, url) {
  const file = path.join(CACHE_DIR, slug + path.extname(new URL(url).pathname));
  if (fs.existsSync(file)) return file;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) {
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      await sleep(500);
      return file;
    }
    if (res.status === 429) { await sleep(3000 * (attempt + 1)); continue; }
    throw new Error(`${res.status} fetching ${url}`);
  }
  throw new Error(`rate limited fetching ${url}`);
}

(async () => {
  fs.mkdirSync(CACHE_DIR, { recursive: true });

  let missing = 0;
  for (const [slug, cfg] of Object.entries(HEROES)) {
    let src;
    try {
      src = await source(slug, cfg.url);
    } catch (e) {
      console.error(`  ! ${slug}: ${e.message}`);
      missing++;
      continue;
    }
    const out = path.join(OUT_DIR, slug + '.webp');
    const meta = await sharp(src, { limitInputPixels: false }).metadata();

    const build = () => {
      const img = sharp(src, { limitInputPixels: false });
      if (typeof cfg.focus === 'number') {
        return img.extract(window16x9(meta.width, meta.height, cfg)).resize(W, H, { fit: 'fill' });
      }
      return img.resize(W, H, { fit: 'cover', position: cfg.position || 'attention' });
    };

    const { bytes, q } = await encode(build, out);
    const how = typeof cfg.focus === 'number'
      ? `focus ${cfg.focus}${cfg.zoom ? ` zoom ${cfg.zoom}` : ''}`
      : (cfg.position || 'saliency');
    console.log(`${slug.padEnd(22)} ${String(Math.round(bytes / 1024)).padStart(4)} KB  q${q}  ${how}`);
  }

  console.log(`\nbuild-neighborhood-heroes: wrote ${Object.keys(HEROES).length - missing} heroes.`);
  if (missing) {
    console.log(`  ${missing} source file(s) missing. Nothing was written for those.`);
    process.exitCode = 1;
  }
})();
