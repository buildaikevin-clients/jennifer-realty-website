/* =============================================================================
   Scroll-scrubbed hero.

   145 WebP frames are the full 12 second source clip at 12fps. Scrolling the
   pinned hero from top to bottom plays the whole thing.

   Two deliberate departures from a naive implementation, both about phones:

   1. Below MOBILE_MAX the canvas never initializes. Phones get a muted
      autoplay loop instead, because iOS Safari cannot reliably seek a video
      or hold 145 decoded images in memory.
   2. Frames stream in progressively from the current scroll position outward
      rather than all at once. Eagerly fetching 7 MB before first paint is the
      single most expensive thing a hero like this can do.
   ========================================================================== */
(function () {
  'use strict';

  const section = document.getElementById('top');
  const canvas = document.getElementById('hero-canvas');
  const video = document.getElementById('hero-video');
  if (!section) return;

  const FRAME_COUNT = 145;
  const MOBILE_MAX = 900;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.matchMedia(`(max-width: ${MOBILE_MAX}px)`).matches;

  const src = (i) =>
    'assets/hero-frames/frame-' + String(i + 1).padStart(3, '0') + '.webp';

  /* ------------------------------------------------------------ mobile --- */

  // Phones and reduced-motion users never touch the scrub path. Collapse the
  // tall scroll track so the hero behaves like an ordinary full-height section.
  if (isMobile || reduce) {
    section.classList.remove('hero--scrub');
    section.classList.add('hero--static');
    if (canvas) canvas.remove();
    if (video) {
      video.hidden = false;
      // Reduced motion means the poster stays and the clip never plays.
      if (reduce) {
        video.removeAttribute('autoplay');
        video.removeAttribute('loop');
      } else {
        const p = video.play();
        // Autoplay can still be refused (low power mode). The poster covers it.
        if (p && p.catch) p.catch(() => {});
      }
    }
    return;
  }

  if (!canvas) return;
  if (video) video.remove();

  /* ----------------------------------------------------------- desktop --- */

  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'medium';

  const images = new Array(FRAME_COUNT);
  let currentFrame = -1;

  function loadFrame(i, onload) {
    if (i < 0 || i >= FRAME_COUNT) return null;
    if (images[i]) return images[i];
    const img = new Image();
    img.decoding = 'async';
    if (onload) img.onload = onload;
    img.src = src(i);
    images[i] = img;
    return img;
  }

  function drawFrame(i) {
    const img = images[i];
    if (!img || !img.complete || !img.naturalWidth) return;
    const cw = canvas.width;
    const ch = canvas.height;
    // cover fit, centered
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s;
    const h = img.naturalHeight * s;
    ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
    currentFrame = i;
  }

  // Draw the closest already-decoded frame at or before the target, so fast
  // scrolling shows a slightly stale frame rather than a blank canvas.
  function drawNearest(target) {
    for (let i = target; i >= 0; i--) {
      const img = images[i];
      if (img && img.complete && img.naturalWidth) { drawFrame(i); return; }
    }
    loadFrame(target, () => { if (currentFrame < 0) drawFrame(target); });
  }

  function progress() {
    const r = section.getBoundingClientRect();
    const span = r.height - window.innerHeight;
    return span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
  }

  function targetFrame() {
    return Math.min(FRAME_COUNT - 1, Math.floor(progress() * FRAME_COUNT));
  }

  // Ramp --scrub-exit from 0 to 1 across the last 8% so the hero dissolves
  // into the page instead of hard cutting. See .hero__fade in styles.css.
  function updateExit() {
    const v = Math.min(1, Math.max(0, (progress() - 0.92) / 0.08));
    section.style.setProperty('--scrub-exit', v.toFixed(3));
  }

  function resize() {
    // Capping DPR at 1 keeps the backing store near source resolution instead
    // of compositing into a 2x buffer on every scroll tick. At this size and
    // behind a scrim, the difference is not visible and the cost is large.
    canvas.width = Math.round(canvas.clientWidth);
    canvas.height = Math.round(canvas.clientHeight);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawNearest(currentFrame >= 0 ? currentFrame : targetFrame());
  }

  let raf = 0;
  function onScroll() {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      updateExit();
      const t = targetFrame();
      if (t !== currentFrame) drawNearest(t);
      queueAround(t);
    });
  }

  /* Progressive loading. Keep a window of frames around the playhead in
     flight, widening outward, rather than requesting all 145 up front. */
  const AHEAD = 24;
  const BEHIND = 8;
  let queued = 0;
  const MAX_IN_FLIGHT = 6;

  function queueAround(center) {
    if (queued >= MAX_IN_FLIGHT) return;
    for (let d = 0; d <= AHEAD; d++) {
      for (const i of (d === 0 ? [center] : [center + d, center - d])) {
        if (i < 0 || i >= FRAME_COUNT) continue;
        if (d > BEHIND && i < center) continue;
        if (images[i]) continue;
        queued++;
        loadFrame(i, () => {
          queued--;
          const t = targetFrame();
          // Only repaint if this frame is the one that should be showing.
          if (i === t) drawFrame(i);
          queueAround(t);
        });
        if (queued >= MAX_IN_FLIGHT) return;
      }
    }
  }

  loadFrame(0, () => { resize(); });
  resize();
  updateExit();
  queueAround(0);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', resize);

  // Once the page is idle, backfill the remaining frames at low priority so
  // a fast scroller later on does not hit gaps.
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 2500));
  idle(() => {
    let i = 0;
    (function backfill() {
      while (i < FRAME_COUNT && images[i]) i++;
      if (i >= FRAME_COUNT) return;
      loadFrame(i, () => idle(backfill));
      i++;
    })();
  });
})();
