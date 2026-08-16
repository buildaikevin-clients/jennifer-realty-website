#!/usr/bin/env node
/* =============================================================================
   set-domain.js — point every absolute URL on the site at one host.

   The site launched with the placeholder [[DOMAIN]] in every canonical,
   og:url, JSON-LD @id, sitemap entry, and the robots.txt sitemap line. This
   script swaps the placeholder, or a previously set host, for a new one, so
   moving from the Netlify subdomain to a bought domain later is one command:

     node scripts/set-domain.js jenniferbarragan.netlify.app
     node scripts/set-domain.js jenniferbarragan.com     (later, same command)

   What it does:
     1. Rewrites the DOMAIN constant in build-neighborhoods.js and
        build-sitemap.js, then it is on YOU to regenerate (it prints the
        commands). Generated files are never edited directly.
     2. Rewrites hand written files in place: the root html pages, robots.txt,
        and llms.txt.
     3. Prints every file it touched and every occurrence count, so a partial
        run is visible instead of silent.

   It accepts a bare host, never a URL. It refuses anything with a slash or
   protocol so a paste mistake cannot write "https://https://" into 247 URLs.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const host = (process.argv[2] || '').trim();
if (!host || /[/\\:]/.test(host) || !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) {
  console.error('Usage: node scripts/set-domain.js <host>');
  console.error('  e.g. node scripts/set-domain.js jenniferbarragan.netlify.app');
  console.error('  Bare host only. No https://, no trailing slash.');
  process.exit(1);
}

/* Hand written files that carry absolute URLs. Generated files (neighborhoods,
   guides, sitemap.xml) are NOT here on purpose: their generators read the
   DOMAIN constant and rewrite the whole file, so editing the output directly
   would just be overwritten and hide a stale constant. */
const HAND_WRITTEN = [
  'index.html', 'buyers.html', 'sellers.html', 'relocate.html',
  'accessibility.html', 'robots.txt', 'llms.txt', '404.html',
];

/* Generator sources whose DOMAIN constant must track the host. */
const GENERATORS = ['scripts/build-neighborhoods.js', 'scripts/build-sitemap.js', 'scripts/build-guides.js'];

/* What we replace: the original placeholder, or any host previously written
   by this script (recorded in .domain). */
const PLACEHOLDER = '[[DOMAIN]]';
const stampFile = path.join(ROOT, '.domain');
const previous = fs.existsSync(stampFile) ? fs.readFileSync(stampFile, 'utf8').trim() : null;

const targets = [PLACEHOLDER];
if (previous && previous !== host) targets.push(previous);

let touched = 0;
for (const rel of [...HAND_WRITTEN, ...GENERATORS]) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) { console.log(`  skip  ${rel} (not present)`); continue; }
  let s = fs.readFileSync(file, 'utf8');
  let count = 0;
  for (const t of targets) {
    const parts = s.split(t);
    count += parts.length - 1;
    s = parts.join(host);
  }
  if (count) { fs.writeFileSync(file, s, 'utf8'); touched++; }
  console.log(`  ${String(count).padStart(4)}  ${rel}`);
}

fs.writeFileSync(stampFile, host + '\n', 'utf8');

console.log(`\nset-domain: ${host} written into ${touched} files.`);
console.log('Now regenerate everything that reads the DOMAIN constant:');
console.log('  node scripts/build-neighborhoods.js');
console.log('  node scripts/build-guides.js');
console.log('  node scripts/build-sitemap.js');
console.log('Then: node scripts/copy-lint.js && node scripts/check-links.js');
