#!/usr/bin/env node
/* =============================================================================
   check-links.js — verifies every local href, src and anchor actually resolves.

   Run:  node scripts/check-links.js

   A static site with no build step has nothing catching a typo in a path. Every
   page hand carries its own nav and footer, so one mistake tends to be copied
   into twenty files at once. This is the safety net for that.

   Checks:
     - local href and src targets exist on disk
     - same page #anchors point at an id that exists
     - cross page #anchors point at an id that exists in the target file
   Skips external URLs, mailto:, tel:, and data: URIs.
   ========================================================================== */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/* Assets Jennifer still has to supply. These are referenced on purpose and the
   pages degrade gracefully without them, so they are reported as pending rather
   than as failures. A checker that always exits nonzero gets ignored, and then
   it catches nothing. Delete entries here as the files arrive. */
const PENDING = new Set([
  'assets/jennifer-headshot.jpg',
  'assets/jennifer-working.jpg',
  'assets/guides/moving-to-bradenton.pdf',
]);

const files = walk(ROOT);

// id="..." for every page, so cross page anchors can be verified
const idsByFile = new Map();
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const ids = new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((m) => m[1]));
  idsByFile.set(path.resolve(f), ids);
}

const problems = [];
const pending = new Set();

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file).replace(/\\/g, '/');
  const dir = path.dirname(file);

  const refs = [...html.matchAll(/\s(?:href|src)=["']([^"']+)["']/g)].map((m) => m[1]);

  for (const ref of refs) {
    if (/^(https?:|mailto:|tel:|data:|#\s*$)/i.test(ref)) continue;
    if (ref.startsWith('[[')) continue;          // unfilled token, expected

    const [rawPath, hash] = ref.split('#');

    // same page anchor
    if (!rawPath) {
      if (hash && !idsByFile.get(path.resolve(file)).has(hash)) {
        problems.push(`${rel}  ->  #${hash}  (no element with that id on this page)`);
      }
      continue;
    }

    const target = path.resolve(dir, rawPath);
    if (!fs.existsSync(target)) {
      const fromRoot = path.relative(ROOT, target).replace(/\\/g, '/');
      if (PENDING.has(fromRoot)) pending.add(fromRoot);
      else problems.push(`${rel}  ->  ${ref}  (file not found)`);
      continue;
    }

    if (hash && target.endsWith('.html')) {
      const ids = idsByFile.get(target);
      if (ids && !ids.has(hash)) {
        problems.push(`${rel}  ->  ${ref}  (target page has no id "${hash}")`);
      }
    }
  }
}

if (problems.length) {
  console.log('');
  for (const p of problems) console.log('  BROKEN  ' + p);
}

if (pending.size) {
  console.log('');
  console.log('  Still to be supplied (referenced on purpose, pages degrade gracefully):');
  for (const p of [...pending].sort()) console.log('    - ' + p);
  console.log('  See assets/README.txt.');
}

console.log('');
if (!problems.length) {
  console.log(`check-links: ${files.length} pages, no broken references` +
    (pending.size ? `, ${pending.size} asset${pending.size === 1 ? '' : 's'} pending.` : '.'));
  process.exit(0);
}
console.log(`check-links: ${problems.length} broken reference` +
  (problems.length === 1 ? '' : 's') + '.');
process.exit(1);
