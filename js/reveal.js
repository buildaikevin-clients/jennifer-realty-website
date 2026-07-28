/* =============================================================================
   Scroll motion system.

   Three separate things, one scroll listener, one rAF, all reads before all
   writes so nothing thrashes layout.

   1. ENTRANCES. Elements with .reveal animate in as they enter view. They
      animate back OUT as they leave, and replay on re-entry, so the page is
      alive whichever direction you scroll. Opt out per element with
      .reveal--once for anything that should settle permanently.

   2. PARALLAX. Large imagery drifts against the scroll so it is never static
      while it is on screen. Applied automatically to page hero photos and
      card media, so no page markup has to know about it.

   3. PROGRESS. A hairline at the top of the viewport tracking read position.

   Adding a new entrance motion is a CSS class, not code. See the scroll
   animation block in styles.css.

   Exposes window.JR.observeReveals(root) so main.js can register listing cards
   that are injected after load.
   ========================================================================== */
(function () {
  'use strict';

  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ========================================================== entrances === */

  // Under reduced motion the CSS already renders everything in its resting
  // state, so there is nothing to observe and no reason to pay for it.
  const io = reduce ? null : new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          // .reveal--once settles permanently. Everything else stays under
          // observation so it can replay.
          if (e.target.classList.contains('reveal--once')) io.unobserve(e.target);
        } else {
          e.target.classList.remove('is-in');
        }
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -6% 0px' }
  );

  function observeReveals(root = document) {
    if (!io) return;
    $$('.reveal', root).forEach((el) => io.observe(el));
  }

  /* =========================================================== parallax === */

  /* Elements are tagged rather than hard coded so this stays additive: nothing
     here hides anything, so a JS failure costs motion and never content.
     `range` is how far the inner layer travels across the full pass, in px. */
  const PARALLAX_TARGETS = [
    { sel: '.page-hero__img',   range: 90 },
    { sel: '.path__media img',  range: 26 },
    { sel: '.card__media img',  range: 20 },
    { sel: '.about__photo img', range: 34 },
  ];

  const layers = [];

  function collectParallax(root = document) {
    if (reduce) return;
    for (const t of PARALLAX_TARGETS) {
      for (const el of $$(t.sel, root)) {
        if (el.dataset.pxOn) continue;          // already registered
        el.dataset.pxOn = '1';
        el.classList.add('px');
        // Position is driven by the container, not the image, because the image
        // is deliberately taller than its frame and its own rect would give a
        // slightly wrong crossing point.
        layers.push({ el, track: el.parentElement || el, range: t.range });
      }
    }
  }

  /* ========================================================== progress ==== */

  let bar = null;
  function makeProgressBar() {
    if (reduce) return;
    bar = document.createElement('div');
    bar.className = 'scroll-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
  }

  /* ============================================================== loop ==== */

  let raf = 0;

  function frame() {
    raf = 0;
    const vh = window.innerHeight;

    // --- read pass -------------------------------------------------------
    const writes = [];
    for (const l of layers) {
      const r = l.track.getBoundingClientRect();
      if (r.bottom < -40 || r.top > vh + 40) continue;   // off screen, skip
      // 0 as the element enters the bottom, 1 as it clears the top.
      const p = (vh - r.top) / (vh + r.height);
      writes.push([l, Math.min(1, Math.max(0, p))]);
    }

    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - vh;
    const progress = scrollable > 0 ? doc.scrollTop / scrollable : 0;

    // --- write pass ------------------------------------------------------
    for (const [l, p] of writes) {
      l.el.style.setProperty('--py', ((p - 0.5) * l.range).toFixed(1) + 'px');
    }
    if (bar) bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress)).toFixed(4)})`;
  }

  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(frame);
  }

  /* ========================================================== count ups === */

  function initCounters(root = document) {
    $$('[data-count-group]', root).forEach((group) => {
      const stats = $$('[data-count]', group);
      if (!stats.length || group.dataset.counted) return;
      group.dataset.counted = '1';

      const run = () => {
        stats.forEach((el) => {
          const target = +el.dataset.count || 0;
          if (reduce) { el.textContent = target.toLocaleString('en-US'); return; }
          const dur = 1100;
          const t0 = performance.now();
          (function step(now) {
            const p = Math.min((now - t0) / dur, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased).toLocaleString('en-US');
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = target.toLocaleString('en-US');
          })(t0);
        });
      };

      if (reduce) { run(); return; }
      // Unlike the entrance reveals this fires once. A number that recounts
      // every time you scroll past reads as broken rather than as alive.
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { run(); obs.disconnect(); }
      }, { threshold: 0.4 }).observe(group);
    });
  }

  /* ============================================================== start === */

  function scan(root = document) {
    observeReveals(root);
    collectParallax(root);
    initCounters(root);
  }

  scan();
  makeProgressBar();

  /* Failsafe sweep.

     Every entrance on this site starts hidden in CSS and is revealed by the
     observer above. That means a single missed callback leaves content
     permanently invisible, and the user never sees an error, just an absence.
     It already cost us Jennifer's photograph once.

     A second after load, and again after the window settles, anything already
     within the viewport is marked in directly. Cheap, idempotent, and it turns
     a silent disappearance into at worst a missed animation. */
  function sweep() {
    if (reduce) return;
    const vh = window.innerHeight;
    for (const el of $$('.reveal')) {
      if (el.classList.contains('is-in')) continue;
      const r = el.getBoundingClientRect();
      if (r.top < vh && r.bottom > 0) el.classList.add('is-in');
    }
  }
  setTimeout(sweep, 1000);
  window.addEventListener('load', () => setTimeout(sweep, 200));

  if (!reduce) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    frame();
  }

  window.JR = window.JR || {};
  window.JR.observeReveals = observeReveals;
  window.JR.scan = scan;
})();
