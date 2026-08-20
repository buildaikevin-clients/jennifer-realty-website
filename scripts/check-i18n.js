#!/usr/bin/env node
/* =============================================================================
   check-i18n.js: the guardrail on the bilingual half of the site.

   Run:  node scripts/check-i18n.js
   Exits nonzero on any finding, so it can gate a commit or a deploy.

   WHY THIS EXISTS
   ---------------------------------------------------------------------------
   The English pages and their Spanish twins are separate hand written files.
   That matches how the rest of this site is built and it keeps the Spanish
   copy editable by a person rather than buried in a generator. The cost is
   that nothing stops the two sides drifting apart, and every way they drift
   fails quietly:

     - A one way hreflang is IGNORED BY GOOGLE ENTIRELY. Not degraded, not
       partially credited. Ignored. So a half updated pair looks fine in the
       markup, passes every other check in this repo, and buys nothing at all
       in search. Nobody would notice for months.

     - An hreflang set where a page does not name ITSELF is discarded for the
       same reason, which is the mistake that is easiest to make by hand.

     - The nav switch is the only way a Spanish speaker finds the Spanish
       site. A new page added without it is a dead end for exactly the reader
       the Spanish pages were written for, and it looks perfectly normal to
       whoever added the page.

     - js/main.js finds the calculator and the multi step forms by element id.
       Translating an id, which is the natural thing to do when translating a
       page, silently turns that feature off on the Spanish side only. No
       error, no console warning, just a payment estimator that never
       calculates.

     - A FAQPage answer that does not match its visible accordion word for
       word is a Google structured data violation. It is easy to keep in step
       in one language and easy to lose when the copy is edited in the other.

   None of these throw. All of them are caught here.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DOMAIN = 'jenniferbarragan.com';

/* The pairing. This table and the PAIRS table in build-sitemap.js describe the
   same thing and both are checked here, so the two cannot disagree. Add a row
   in both when a page is translated. */
const PAIRS = [
  ['index.html',          'es/index.html'],
  ['buyers.html',         'es/comprar.html'],
  ['sellers.html',        'es/vender.html'],
  ['relocate.html',       'es/mudarse.html'],
  ['neighborhoods.html',  'es/vecindarios.html'],
];

/* Ids a Spanish page is allowed to be missing, with the reason. These are
   deliberate differences in what the page DOES, not translation slips.

   es/mudarse.html: relocate.html closes on a gated PDF guide. That guide only
   exists in English, and handing a Spanish reader a form that delivers an
   English document is worse than not offering one. The Spanish page asks for
   the conversation instead, through the ordinary contact form. When the
   Spanish guide is built, delete this entry and the page becomes a gate. */
const EXPECTED_MISSING = {
  'es/mudarse.html': ['guide-error'],
};

// Pages with no nav at all, so no language switch is expected. The g/ landing
// pages carry deliberately slim chrome: brand only, no nav. See build-guides.
const NO_NAV_PREFIX = ['g/', 'brand/'];

const findings = [];
const fail = (file, msg, hint) => findings.push({ file, msg, hint });

const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const exists = (rel) => fs.existsSync(path.join(ROOT, rel));

// The URL a page is actually served at. An index.html is served from its
// directory, which is what the canonical tags on both home pages say.
const url = (rel) => `https://${DOMAIN}/${rel.replace(/(^|\/)index\.html$/, '$1')}`;

const headOf = (html) => html.split(/<\/head>/i)[0] || '';

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const pages = walk(ROOT)
  .map((f) => path.relative(ROOT, f).replace(/\\/g, '/'))
  .sort();

/* ------------------------------------------------------- 1. pairs exist --- */

for (const [en, es] of PAIRS) {
  for (const f of [en, es]) {
    if (!exists(f)) {
      fail(f, 'named in PAIRS but the file does not exist',
        'Create it, or drop the row from PAIRS here and in build-sitemap.js.');
    }
  }
}

/* --------------------------------------- 2. build-sitemap agrees with us --- */

{
  const sm = read('scripts/build-sitemap.js');
  for (const [en, es] of PAIRS) {
    const row = new RegExp(`'${en.replace(/\./g, '\\.')}'\\s*,\\s*'${es.replace(/\./g, '\\.')}'`);
    if (!row.test(sm)) {
      fail('scripts/build-sitemap.js', `PAIRS is missing ${en} to ${es}`,
        'The sitemap emits the hreflang alternates. Both tables must match.');
    }
  }
}

/* ------------------------------------------- 3. hreflang is reciprocal ---- */

/* Every page in a pair must declare all three: itself, its twin, and
   x-default. A set missing the self reference is discarded by Google, and a
   set that is not reciprocal is ignored outright. */
for (const [en, es] of PAIRS) {
  if (!exists(en) || !exists(es)) continue;

  const want = {
    en: url(en),
    es: url(es),
    'x-default': url(en),
  };

  for (const side of [en, es]) {
    const head = headOf(read(side));
    const got = {};
    const re = /<link\s+rel=["']alternate["']\s+hreflang=["']([^"']+)["']\s+href=["']([^"']+)["']/gi;
    let m;
    while ((m = re.exec(head))) got[m[1].toLowerCase()] = m[2];

    for (const tag of ['en', 'es', 'x-default']) {
      if (!got[tag]) {
        fail(side, `head is missing <link rel="alternate" hreflang="${tag}">`,
          `Expected href="${want[tag]}". A set missing any of the three is discarded.`);
      } else if (got[tag] !== want[tag]) {
        fail(side, `hreflang="${tag}" points at ${got[tag]}`,
          `Expected ${want[tag]}.`);
      }
    }
  }
}

/* ------------------------------------------- 4. lang attribute is right --- */

for (const rel of pages) {
  const m = /<html[^>]*\blang\s*=\s*["']([^"']+)["']/i.exec(read(rel));
  if (!m) {
    fail(rel, 'no lang attribute on <html>',
      'js/main.js picks its language from this. Without it a Spanish page renders English strings.');
    continue;
  }
  const lang = m[1].slice(0, 2).toLowerCase();
  const want = rel.startsWith('es/') ? 'es' : 'en';
  if (lang !== want) {
    fail(rel, `<html lang="${m[1]}"> but the file sits at ${rel}`,
      `Expected lang to start with "${want}".`);
  }
}

/* --------------------------------------- 5. every page carries the switch - */

for (const rel of pages) {
  if (NO_NAV_PREFIX.some((p) => rel.startsWith(p))) continue;
  const html = read(rel);
  if (!/class="nav__lang"/.test(html)) {
    fail(rel, 'no language switch in the nav',
      'Copy the .nav__lang block from a sibling page. On a generated page, fix scripts/lib/chrome.js.');
    continue;
  }
  // It has to lead somewhere in the OTHER language, or it is decoration.
  const wantSwitch = rel.startsWith('es/') ? 'en' : 'es';
  if (!new RegExp(`data-lang-switch="${wantSwitch}"`).test(html)) {
    fail(rel, `language switch does not carry data-lang-switch="${wantSwitch}"`,
      'js/lang.js reads this to remember the choice and to find the fallback target.');
  }
  if (!/<script[^>]+js\/lang\.js/.test(headOf(html))) {
    fail(rel, 'js/lang.js is not loaded in the head',
      'It must run before the header paints, or the offer bar shoves the nav down under the reader.');
  }
}

/* ------------------------- 6. the ids js/main.js binds to survive both sides */

/* Every id main.js looks up by literal selector. If the English page has one,
   its Spanish twin must have it too: translating an id is silent breakage,
   because querySelector simply returns null and the feature stops. */
{
  const mainJs = read('js/main.js');
  const ids = new Set(
    [...mainJs.matchAll(/\$\(['"]#([a-zA-Z0-9_-]+)['"]\)/g)].map((m) => m[1])
  );

  for (const [en, es] of PAIRS) {
    if (!exists(en) || !exists(es)) continue;
    const enHtml = read(en);
    const esHtml = read(es);
    for (const id of ids) {
      if ((EXPECTED_MISSING[es] || []).includes(id)) continue;
      const has = (h) => new RegExp(`\\bid=["']${id}["']`).test(h);
      if (has(enHtml) && !has(esHtml)) {
        fail(es, `missing id="${id}", which ${en} has and js/main.js binds to`,
          'Translate the label, never the id. The feature fails silently without it.');
      }
    }
  }
}

/* --------------------------- 6b. the scrub hero can find its frames ------- */

/* js/hero-scrub.js reads the frame path off the preload link rather than
   hardcoding it, because a hardcoded 'assets/hero-frames/' is correct at the
   root and a 404 one directory down. That is exactly what happened to
   es/index.html: all 145 frames failed and the hero canvas stayed blank, with
   nothing but image errors in the console to show for it.

   So any page that runs the scrub must carry the preload link the script
   derives from. There is a stylesheet based fallback in the script, but a
   missing preload is also a real performance regression on its own: frame 1
   is the largest contentful paint. */
for (const rel of pages) {
  const html = read(rel);
  if (!/hero--scrub/.test(html)) continue;
  const pre = /<link[^>]+rel=["']preload["'][^>]+hero-frames[^>]*>/i.test(headOf(html));
  if (!pre) {
    fail(rel, 'uses hero--scrub but has no preload link for the hero frames',
      'js/hero-scrub.js reads the frame path from it. Add <link rel="preload" as="image" href="...assets/hero-frames/frame-001.webp">.');
  }
}

/* ------------------- 7. FAQPage answers match the visible accordion text --- */

/* Google requires the structured answer to be the text on the page. This
   compares them with whitespace collapsed and entities resolved, which is the
   only difference that should ever exist between the two. */
{
  const decode = (s) => s
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’').replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”')
    .replace(/&middot;/g, '·');
  const norm = (s) => decode(s).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  /* Scoped to the translated pairs on purpose. The guides under guides/ carry
     a `schemaA` field that is deliberately the same answer rewritten in third
     person, because a search result quotes it away from the page where
     Jennifer's first person reads oddly. That is a documented decision in
     scripts/build-guides.js and it predates this file, so it is not this
     script's to overrule. What this check is for is the pairs: five pages
     whose own head comments promise the schema matches the accordion word for
     word, in two languages, edited by hand. That is where it drifts. */
  const paired = new Set(PAIRS.flat());

  for (const rel of pages) {
    if (!paired.has(rel)) continue;
    const html = read(rel);
    const ldRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let ld;
    const answers = [];
    while ((ld = ldRe.exec(html))) {
      let data;
      try { data = JSON.parse(ld[1]); } catch { continue; }
      const graph = data['@graph'] || [data];
      for (const node of graph) {
        if (node['@type'] !== 'FAQPage') continue;
        for (const q of node.mainEntity || []) {
          if (q.acceptedAnswer && q.acceptedAnswer.text) answers.push(q.acceptedAnswer.text);
        }
      }
    }
    if (!answers.length) continue;

    // The visible answers, in document order.
    const visible = [...html.matchAll(/<div class="faq__answer">([\s\S]*?)<\/div>/gi)]
      .map((m) => norm(m[1]));

    for (const a of answers) {
      if (!visible.includes(norm(a))) {
        fail(rel, 'a FAQPage answer does not match any visible accordion answer',
          'They must be word for word identical. Starts: ' + norm(a).slice(0, 70) + '...');
      }
    }
  }
}

/* ---------------------------------------------------------------- report */

if (!findings.length) {
  console.log(`check-i18n: ${PAIRS.length} translated pairs, ${pages.length} pages, all consistent.`);
  process.exit(0);
}

console.log('');
for (const f of findings) {
  console.log(`  [I18N] ${f.file}  ${f.msg}`);
  console.log(`      ${f.hint}`);
  console.log('');
}
console.log(`check-i18n: ${findings.length} finding${findings.length === 1 ? '' : 's'}.`);
process.exit(1);
