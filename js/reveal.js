/* =============================================================================
   Scroll animation system.

   One IntersectionObserver drives every entrance on the site. Adding a new
   motion is a CSS class (see the "scroll animation" block in styles.css), not
   new JavaScript. Stagger comes from an inline --d custom property on the
   element, so markup controls sequencing without touching this file.

   Exposes window.JR.observeReveals(root) so main.js can register cards that
   are injected after page load.
   ========================================================================== */
(function () {
  'use strict';

  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------- entrances --- */

  // Under reduced motion the CSS already renders everything in its final
  // state, so there is nothing to observe and no reason to pay for it.
  const io = reduce ? null : new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        // `reveal--repeat` plays in reverse on exit and replays on re-entry.
        // Everything else fires once and is released.
        const repeat = e.target.classList.contains('reveal--repeat');
        if (e.isIntersecting) {
          e.target.classList.add('is-in');
          if (!repeat) io.unobserve(e.target);
        } else if (repeat) {
          e.target.classList.remove('is-in');
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );

  function observeReveals(root = document) {
    if (!io) return;
    $$('.reveal', root).forEach((el) => io.observe(el));
  }

  /* ----------------------------------------------------------- parallax --- */

  // Writes --p (0 at the moment the element enters the bottom of the viewport,
  // 1 as it leaves the top) so CSS can drift the inner layer. Everything runs
  // inside one rAF and reads layout in a single pass.
  const parallaxEls = reduce ? [] : $$('.parallax');
  let parallaxRaf = 0;

  function updateParallax() {
    parallaxRaf = 0;
    const vh = window.innerHeight;
    for (const el of parallaxEls) {
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) continue;   // off screen, skip the write
      const p = (vh - r.top) / (vh + r.height);
      el.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
    }
  }

  function onScroll() {
    if (parallaxRaf) return;
    parallaxRaf = requestAnimationFrame(updateParallax);
  }

  /* --------------------------------------------------------- count ups --- */

  // Any [data-count] inside a group counts up once when the group first
  // appears. Under reduced motion the number is simply written.
  function initCounters() {
    $$('[data-count-group]').forEach((group) => {
      const stats = $$('[data-count]', group);
      if (!stats.length) return;

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
      new IntersectionObserver((entries, obs) => {
        if (entries[0].isIntersecting) { run(); obs.disconnect(); }
      }, { threshold: 0.4 }).observe(group);
    });
  }

  /* ------------------------------------------------------------- start --- */

  observeReveals();
  initCounters();

  if (parallaxEls.length) {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateParallax();
  }

  window.JR = window.JR || {};
  window.JR.observeReveals = observeReveals;
})();
