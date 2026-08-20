#!/usr/bin/env node
/* =============================================================================
   copy-lint.js — the guardrail on everything written on this site.

   Three jobs, in ascending order of how much they matter:

   1. HYPHENS AND DASHES.  Jennifer asked for no hyphens or dashes on the site,
      and she meant it literally. No em dash, no en dash, and no hyphen joining
      two words. Write "mid century" not "mid-century", "Interstate 75" not
      "I-75", "well priced" not "well-priced".

      Two carve outs, both narrow:
        - Digit to digit passes, so a phone number keeps its normal format.
        - JSON-LD has URLs and language tags stripped before the check, because
          that block legitimately holds page slugs, license URLs, and en-US.

      This rule only ever sees visible text. Class names, element IDs, CSS
      properties and file paths are code, not writing, and never reach it.

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

   SPANISH.  The pages under es/ are checked by the same three rules, against
   Spanish word lists chosen from the page's own lang attribute. This is not
   optional politeness: fair housing law does not care which language the ad
   was written in, and an English only word list would have let every one of
   these phrases through on a page nobody on the English side reads. The
   Spanish lists are ADDITIONAL, so a stray English phrase on a Spanish page
   is still caught.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ------------------------------------------------------------------ rules */

const DASHES = [
  { re: /—/g,  name: 'em dash',       hint: 'Rewrite as two sentences, or use a comma.' },
  { re: /–/g,  name: 'en dash',       hint: 'Write "to" in ranges. 3 to 6 months.' },
  { re: /--/g, name: 'double hyphen', hint: 'Reads as an em dash. Rewrite the sentence.' },
  // Letter to letter, letter to digit, and digit to letter. Digit to digit is
  // deliberately absent so 555-0142 passes.
  // The letter classes include the accented characters Spanish uses. Without
  // them "informacion-general" would pass on a Spanish page purely because
  // the character before the hyphen was outside A to Z.
  {
    re: /(?<=[A-Za-z\u00C0-\u024F])-(?=[A-Za-z0-9\u00C0-\u024F])|(?<=[0-9])-(?=[A-Za-z\u00C0-\u024F])/g,
    name: 'hyphen',
    hint: 'Separate the words, or pick one that does not need joining.',
  },
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

/* ------------------------------------------------------------- espanol ---
   The Spanish equivalents, applied on top of the English lists to any page
   whose html lang starts with es.

   FAIR HOUSING FIRST, and read this before deleting anything from it. The
   protected classes are the same in Spanish: raza, color, religion, sexo,
   origen nacional, estado familiar, discapacidad. What changes is that the
   coded phrases are ordinary, friendly sounding Spanish, which is exactly
   what makes them easy to write by accident. "Zona tranquila" and "buenas
   escuelas" read as helpful description and are read by HUD as statements
   about who lives somewhere. Describe the place: what was built when, how
   far the drive is, where the water goes.

   Some of these are common in Latin American real estate writing. That they
   are common is not a defense. Use the allow comment if a specific line is
   genuinely about the property and say why next to it.
   ------------------------------------------------------------------------- */
const FAIR_HOUSING_ES = [
  // estado familiar
  'ideal para familias', 'perfecto para familias', 'perfecta para familias',
  'solo para familias', 'apto para familias', 'ambiente familiar',
  'sin ninos', 'sin ninos pequenos', 'no se aceptan ninos',
  'solo adultos', 'comunidad de adultos', 'comunidad para adultos',
  'ideal para jovenes', 'para profesionales jovenes', 'jovenes profesionales',
  'ideal para jubilados', 'perfecto para jubilados', 'para personas mayores',
  'ideal para recien casados',
  // raza, color, origen nacional
  'vecindario exclusivo', 'zona exclusiva', 'comunidad exclusiva',
  'area exclusiva', 'barrio exclusivo', 'gente como tu', 'el tipo de gente',
  'zona en ascenso', 'barrio en transicion',
  // religion
  'cerca de la iglesia', 'cerca de iglesias', 'comunidad cristiana',
  'cerca del templo', 'a pasos de la iglesia',
  // discapacidad
  'no apto para discapacitados', 'debe poder caminar', 'ideal para gente activa',
  // lenguaje codificado sobre las personas
  'vecindario seguro', 'zona segura', 'area segura', 'barrio seguro',
  'comunidad segura', 'sin delincuencia', 'libre de delincuencia',
  'buenas escuelas', 'las mejores escuelas', 'mejores escuelas',
  'escuelas de calidad', 'buenos colegios',
  'vecindario tranquilo', 'zona tranquila', 'barrio tranquilo',
  'comunidad tranquila', 'prestigioso', 'prestigiosa',
];

/* The Spanish AI tells. Machine translation has its own accent, separate from
   machine writing: it reaches for the same handful of elevated words and for
   English sentence shapes carried over whole. Everything here is replaceable
   with something concrete. */
const AI_TELLS_ES = [
  'enclavado', 'enclavada', 'ubicado en el corazon', 'en el corazon de',
  'no busques mas', 'no busque mas', 'sumergete en', 'sumergirse en',
  'sin igual', 'inigualable', 'incomparable', 'insuperable',
  'de clase mundial', 'de primer nivel', 'de vanguardia', 'a la vanguardia',
  'un sinfin de', 'sinnumero de', 'una amplia gama de', 'sinfin de opciones',
  'joya escondida', 'joya oculta', 'tesoro escondido',
  'la tranquilidad de saber', 'ten la seguridad', 'tenga la seguridad',
  'ya sea que estes buscando', 'ya sea que este buscando',
  'embarcate en', 'embarcarse en', 'emprende el viaje',
  'no es solo una casa', 'mas que solo una casa', 'no es solo un hogar',
  'testimonio de', 'un verdadero testimonio',
  'combinacion perfecta', 'mezcla perfecta', 'equilibrio perfecto',
  'al final del dia', 'en el mercado actual', 'en la actualidad del mercado',
  'navegar por las complejidades', 'el mundo de los bienes raices',
  'experiencia unica', 'oportunidad unica', 'vibrante',
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
   answer engines, so its string values get the same treatment.

   URLs and IETF language tags are blanked first. That block legitimately holds
   page slugs (anna-maria-island.html), license URLs (.../licenses/by-sa/4.0),
   and en-US, none of which are writing. Blanking preserves offsets so a finding
   still maps back to the right line. */
function jsonLdText(html) {
  let s = html.replace(/[^\n]/g, ' ');   // start blank, keep line structure
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    const start = m.index + m[0].indexOf(m[1]);
    s = s.slice(0, start) + m[1] + s.slice(start + m[1].length);
  }
  s = blank(s, /https?:\/\/[^\s"']+/g);      // URLs
  s = blank(s, /\b[a-z]{2}-[A-Z]{2}\b/g);    // language tags such as en-US
  return s;
}

/* The Spanish lists are written without accents on purpose, and the haystack
   is folded to match. Two reasons. Accents are the first thing a hurried
   writer drops, so "zona tranquila" and "zona tranquíla" both have to be
   caught, and a rule that only fires on perfectly accented text would miss
   exactly the sloppy copy it exists to catch. Folding also sidesteps the word
   boundary problem below.

   Offsets are preserved: every character maps to exactly one character, so a
   match still reports the right line. */
const FOLD = {
  'á':'a','é':'e','í':'i','ó':'o','ú':'u','ü':'u','ñ':'n',
  'Á':'A','É':'E','Í':'I','Ó':'O','Ú':'U','Ü':'U','Ñ':'N',
  'à':'a','è':'e','ì':'i','ò':'o','ù':'u','â':'a','ê':'e','î':'i','ô':'o','û':'u',
};
function fold(str) {
  return str.replace(/[\u00C0-\u024F]/g, (c) => FOLD[c] || c);
}

/* Which language a page is written in, from its own html lang attribute.
   Read from the markup rather than from the file path, so a Spanish page that
   ever moves out of es/ is still checked as Spanish. */
function langOf(html) {
  const m = /<html[^>]*\blang\s*=\s*["']([^"']+)["']/i.exec(html);
  return m ? m[1].slice(0, 2).toLowerCase() : 'en';
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
  const isEs = langOf(raw) === 'es';

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
        // A space in a term matches whitespace OR a hyphen. HTML wraps prose
        // wherever it likes, and more importantly "family-friendly" has to be
        // caught by the fair housing rule and not only by the hyphen rule.
        // Without this, hyphenating a banned phrase hides it from its own check.
        const pattern = term
          .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          .replace(/ /g, '[\\s-]+');
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

    /* The Spanish pass. Separate from check() above because it folds accents
       off the haystack first, and because it cannot use \b as a boundary:
       in a JavaScript regex an accented letter is not a word character, so
       \b never fires beside one and a term like "area segura" would be
       missed. Unicode property escapes give a boundary that is correct in
       both alphabets. */
    if (isEs) {
      const folded = fold(haystack);
      const checkEs = (list, sev, hint) => {
        for (const term of list) {
          if (allowed.has(term.toLowerCase())) continue;
          const pattern = term
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
            .replace(/ /g, '[\\s-]+');
          const re = new RegExp(
            '(?<![\\p{L}\\p{N}])' + pattern + '(?![\\p{L}\\p{N}])', 'giu');
          let m;
          while ((m = re.exec(folded))) {
            findings.push({
              file: rel, line: lineOf(folded, m.index), sev, term, where,
              text: snippet(haystack, m.index, m[0].length), hint,
            });
          }
        }
      };
      checkEs(FAIR_HOUSING_ES, 'FAIR-HOUSING',
        'Describe la propiedad o el lugar, nunca a quien vive ahi.');
      checkEs(AI_TELLS_ES, 'AI-TELL',
        'Cambialo por algo concreto: una calle, un numero, un dato real.');
    }
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
