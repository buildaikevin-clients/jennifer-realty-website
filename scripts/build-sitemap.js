#!/usr/bin/env node
/* =============================================================================
   build-sitemap.js — regenerates sitemap.xml by walking the repo for HTML.

   Run:  node scripts/build-sitemap.js
   Run it after build-neighborhoods.js, or after adding any page.

   Hand maintained sitemaps drift. This one cannot, because it reads the actual
   files. Priorities are assigned by depth and by a small override table, since
   the home page and the two conversion pages genuinely matter more than an
   individual neighborhood page.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOMAIN = 'jenniferbarragan.com';

// Pages that should never appear in search results. brand/ holds the logo
// concept sheet, which is internal working material rather than site content.
// It already carries a noindex, and listing a noindex page in the sitemap sends
// Google two contradictory instructions, so it is excluded here as well.
const EXCLUDE = new Set(['404.html', 'brand/logo-concepts.html']);

// Directory prefixes that never enter the sitemap. g/ holds the noindex
// landing pages the video funnel DMs out; listing a noindex page in the
// sitemap sends Google contradictory instructions, same reasoning as above.
const EXCLUDE_PREFIX = ['g/'];

// Explicit priority and change frequency. Anything not listed falls back to
// the depth based default below.
const OVERRIDES = {
  'index.html':            { priority: '1.0', changefreq: 'weekly' },
  'buyers.html':           { priority: '0.9', changefreq: 'monthly' },
  'sellers.html':          { priority: '0.9', changefreq: 'monthly' },
  'relocate.html':         { priority: '0.9', changefreq: 'monthly' },
  'neighborhoods.html':    { priority: '0.8', changefreq: 'monthly' },
  'accessibility.html':    { priority: '0.3', changefreq: 'yearly' },
  'es/index.html':         { priority: '1.0', changefreq: 'weekly' },
  'es/comprar.html':       { priority: '0.9', changefreq: 'monthly' },
  'es/vender.html':        { priority: '0.9', changefreq: 'monthly' },
  'es/mudarse.html':       { priority: '0.9', changefreq: 'monthly' },
  'es/vecindarios.html':   { priority: '0.8', changefreq: 'monthly' },
};

/* ---------------------------------------------------------- translations ---
   The English page and its Spanish twin, one entry per pair.

   Google wants hreflang declared in EITHER the head or the sitemap, and
   accepts both. Both is what this site does, because the two go stale
   independently: the head tags live in the page and the sitemap is generated,
   so a page that gets copied without its tags is still paired here, and a
   page deleted without updating this table fails the check below instead of
   quietly shipping a broken pair.

   THE PAIRING MUST BE RECIPROCAL AND THE FILES MUST EXIST. Both are asserted
   at build time. A one way hreflang is ignored by Google outright, so a
   silent half pair would look fine here and do nothing in search.

   Add a row when a page gets translated. Only these five are today.
   -------------------------------------------------------------------------- */
const PAIRS = [
  ['index.html',          'es/index.html'],
  ['buyers.html',         'es/comprar.html'],
  ['sellers.html',        'es/vender.html'],
  ['relocate.html',       'es/mudarse.html'],
  ['neighborhoods.html',  'es/vecindarios.html'],
];

// file path -> { en, es } so either side of a pair can find both URLs.
const ALT = new Map();
for (const [en, es] of PAIRS) {
  for (const f of [en, es]) {
    if (!fs.existsSync(path.join(ROOT, f))) {
      console.error(`build-sitemap: PAIRS names ${f}, which does not exist.`);
      process.exit(1);
    }
  }
  ALT.set(en, { en, es });
  ALT.set(es, { en, es });
}

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(ROOT)
  .map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
  .filter((f) => !EXCLUDE.has(f) && !EXCLUDE_PREFIX.some((p) => f.startsWith(p)))
  .sort((a, b) => {
    // index first, then top level pages, then nested
    if (a === 'index.html') return -1;
    if (b === 'index.html') return 1;
    const da = a.split('/').length;
    const db = b.split('/').length;
    return da - db || a.localeCompare(b);
  });

const today = new Date().toISOString().slice(0, 10);

// An index.html is served from its directory, never by file name. That is
// true of the root and of es/, and the canonical tags on both pages say so,
// so the sitemap has to agree or the two contradict each other.
const url = (f) => `https://${DOMAIN}/${f.replace(/(^|\/)index\.html$/, '$1')}`;

const urls = files.map((f) => {
  const o = OVERRIDES[f] || {
    priority: f.includes('/') ? '0.6' : '0.7',
    changefreq: 'monthly',
  };
  const loc = url(f);
  // Every URL in a translated pair lists BOTH sides plus x-default, including
  // itself. That self reference is required, not redundant: Google discards
  // an hreflang set where a page does not name itself.
  const pair = ALT.get(f);
  const alts = pair ? `
    <xhtml:link rel="alternate" hreflang="en" href="${url(pair.en)}" />
    <xhtml:link rel="alternate" hreflang="es" href="${url(pair.es)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${url(pair.en)}" />` : '';
  return `  <url>
    <loc>${loc}</loc>${alts}
    <lastmod>${today}</lastmod>
    <changefreq>${o.changefreq}</changefreq>
    <priority>${o.priority}</priority>
  </url>`;
}).join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!-- Generated by scripts/build-sitemap.js. Do not edit by hand. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml, 'utf8');
console.log(`build-sitemap: wrote ${files.length} URLs to sitemap.xml.`);
