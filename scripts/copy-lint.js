#!/usr/bin/env node
/* =============================================================================
   copy-lint.js — the guardrail on everything written on this site.

   Three jobs, in ascending order of how much they matter:

   1. DASHES.  Jennifer asked for no dashes. That means no em dash and no en
      dash in prose, which happens to be the loudest tell that a machine wrote
      the sentence. Ordinary hyphens inside words stay, because removing those
      produces broken English.

   2. AI TELLS.  A vocabulary that reads as generated. Most of these are real
      words. They are banned here because they cluster in machine writing and
      because every one of them can be replaced with something more specific.

   3. FAIR HOUSING.  Words and phrases that describe the people who live
      somewhere rather than the place itself. This list is the reason the
      script exists. A fair housing complaint is not a style problem.

   Run:  node scripts/copy-lint.js
   Exits nonzero on any finding, so it can gate a commit or a deploy.

   Escape hatch: put  <!-- copy-lint-allow: term -->  anywhere in a file to
   whitelist one term for that file. Use it rarely and say why next to it.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ------------------------------------------------------------------ rules */

const DASHES = [
  { re: /—/g, name: 'em dash',           hint: 'Rewrite as two sentences, or use a comma.' },
  { re: /–/g, name: 'en dash',           hint: 'Write "to" in ranges. 3 to 6 months.' },
  { re: /--/g,     name: 'double hyphen',     hint: 'Reads as an em dash. Rewrite the sentence.' },
];

const AI_TELLS = [
  'nestled', 'boasts', 'boasting', 'elevate', 'elevated your', 'delve',
  'seamless', 'seamlessly', 'unlock', 'unlocking', 'vibrant', 'tapestry',
  'testament to', 'a testament', 'look no further', 'dive into',
  'in today’s market', "in today's market", 'ever changing market',
  'ever evolving', 'bustling', 'charming blend', 'perfect blend',
  'nestled in the heart', 'in the heart of', 'stunning array',
  'plethora', 'myriad of', 'treasure trove', 'hidden gem',
  'when it comes to', 'at the end of the day', 'navigate the complexities',
  'peace of mind knowing', 'rest assured', 'world class', 'top notch',
  'state of the art', 'unparalleled', 'unmatched', 'second to none',
  'whether you are looking', 'whether you’re looking',
  'not just a', 'more than just a', 'embark on',
];

/* The list that actually matters. Sources: the Fair Housing Act's protected
   classes (race, color, religion, sex, national origin, familial status,
   disability) plus the HUD advertising guidance that treats these phrases as
   indicating a preference. Some are obvious. Some, like "safe" and "quiet",
   are here because they are routinely read as coded language about who lives
   in a neighborhood. Describe the place, not the people. */
const FAIR_HOUSING = [
  // familial status
  'family friendly', 'families only', 'perfect for families', 'ideal for families',
  'great for kids', 'no kids', 'no children', 'adults only', 'adult community',
  'mature community', 'empty nesters', 'singles only', 'bachelor',
  'perfect for young', 'great for young professionals', 'young professionals',
  'retirees will love', 'perfect for retirees',
  // race, color, national origin
  'exclusive neighborhood', 'integrated', 'traditional neighborhood',
  'ethnic', 'private community' ,
  // religion
  'walking distance to church', 'near churches', 'christian', 'church community',
  'close to temple', 'near the mosque',
  // disability
  'able bodied', 'must be able to', 'not suitable for handicapped',
  'perfect for active', 'walk up only',
  // coded language about people
  'safe neighborhood', 'safe area', 'safe community', 'crime free',
  'good schools', 'best schools', 'top rated schools', 'desirable schools',
  'quiet neighborhood', 'quiet community', 'exclusive area',
  'prestigious', 'up and coming', 'transitional neighborhood',
  'right kind of', 'people like you',
];

/* --------------------------------------------------------------- helpers */

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

// Replace a matched region with spaces so every remaining character keeps its
// original offset. That is what lets a match map back to a real line number.
function blank(str, re) {
  return str.replace(re, (m) => m.replace(/[^\n]/g, ' '));
}

/* Reduce a page to the text a visitor actually reads:
   drop script and style blocks, HTML comments, and all tags. Attribute values
   go with the tags, which is correct here because alt text is checked
   separately and the rest of the attributes are not prose. */
function visibleText(html) {
  let s = html;
  s = blank(s, /<script\b[\s\S]*?<\/script>/gi);
  s = blank(s, /<style\b[\s\S]*?<\/style>/gi);
  s = blank(s, /<!--[\s\S]*?-->/g);
  s = blank(s, /<[^>]+>/g);
  return s;
}

/* JSON-LD is not read on the page but it is read in search results and by
   answer engines, so its string values get the same treatment. */
function jsonLdText(html) {
  let s = html.replace(/[^\n]/g, ' ');   // start blank, keep line structure
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const start = m.index + m[0].indexOf(m[1]);
    s = s.slice(0, start) + m[1] + s.slice(start + m[1].length);
  }
  return s;
}

function lineOf(text, index) {
  return text.slice(0, index).split('\n').length;
}

function snippet(text, index, len) {
  const from = Math.max(0, index - 42);
  const to = Math.min(text.length, index + len + 42);
  return ('' + (from > 0 ? '...' : '') +
    text.slice(from, to).replace(/\s+/g, ' ').trim() +
    (to < text.length ? '...' : ''));
}

/* ------------------------------------------------------------------- run */

const files = walk(ROOT);
const findings = [];

for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');

  const allowed = new Set(
    [...raw.matchAll(/<!--\s*copy-lint-allow:\s*([^>]+?)\s*-->/g)]
      .map((m) => m[1].trim().toLowerCase())
  );

  const prose = visibleText(raw);
  const ld = jsonLdText(raw);

  const scan = (haystack, where) => {
    for (const d of DASHES) {
      let m;
      d.re.lastIndex = 0;
      while ((m = d.re.exec(haystack))) {
        if (allowed.has(d.name)) continue;
        findings.push({
          file: rel, line: lineOf(haystack, m.index), sev: 'DASH',
          term: d.name, where,
          text: snippet(haystack, m.index, m[0].length), hint: d.hint,
        });
      }
    }

    const check = (list, sev, hint) => {
      for (const term of list) {
        if (allowed.has(term.toLowerCase())) continue;
        // Word boundaries, and spaces in a term also match a newline or
        // multiple spaces, because HTML wraps prose wherever it likes.
        const pattern = term
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/ /g, '\\s+');
        const re = new RegExp('\\b' + pattern + '\\b', 'gi');
        let m;
        while ((m = re.exec(haystack))) {
          findings.push({
            file: rel, line: lineOf(haystack, m.index), sev, term, where,
            text: snippet(haystack, m.index, m[0].length), hint,
          });
        }
      }
    };

    check(FAIR_HOUSING, 'FAIR-HOUSING',
      'Describe the property or the place, never who lives there.');
    check(AI_TELLS, 'AI-TELL',
      'Replace with something specific. A street, a number, a real detail.');
  };

  scan(prose, 'page text');
  scan(ld, 'JSON-LD');

  /* ---- images need alt text (WCAG 1.1.1) ------------------------------- */
  const imgRe = /<img\b[^>]*>/gi;
  let im;
  while ((im = imgRe.exec(raw))) {
    if (!/\balt\s*=/.test(im[0])) {
      findings.push({
        file: rel, line: lineOf(raw, im.index), sev: 'A11Y',
        term: 'missing alt', where: 'markup',
        text: im[0].slice(0, 96), hint: 'Add alt. Use alt="" only if decorative.',
      });
    }
  }

  /* ---- tone: exclamation points ---------------------------------------- */
  const bangs = (prose.match(/!/g) || []).length;
  if (bangs > 1) {
    findings.push({
      file: rel, line: 0, sev: 'TONE',
      term: bangs + ' exclamation points', where: 'page text',
      text: '(one per page at most)',
      hint: 'Elegant copy does not shout. Cut all but the strongest.',
    });
  }
}

/* ---------------------------------------------------------------- report */

const ORDER = { 'FAIR-HOUSING': 0, DASH: 1, 'AI-TELL': 2, A11Y: 3, TONE: 4 };
findings.sort((a, b) =>
  (ORDER[a.sev] - ORDER[b.sev]) || a.file.localeCompare(b.file) || a.line - b.line
);

if (!findings.length) {
  console.log('copy-lint: clean across ' + files.length + ' page' +
    (files.length === 1 ? '' : 's') + '.');
  process.exit(0);
}

const counts = {};
for (const f of findings) counts[f.sev] = (counts[f.sev] || 0) + 1;

console.log('');
for (const f of findings) {
  console.log(`  [${f.sev}] ${f.file}:${f.line}  ${f.term}  (${f.where})`);
  console.log(`      ${f.text}`);
  console.log(`      ${f.hint}`);
  console.log('');
}
console.log('copy-lint: ' + findings.length + ' finding' +
  (findings.length === 1 ? '' : 's') + '  ' +
  Object.entries(counts).map(([k, v]) => k + ' ' + v).join('  '));
process.exit(1);
