/* =============================================================================
   Jennifer Realty — site behavior
   Vanilla, no dependencies, one IIFE. Scroll animation lives in js/reveal.js.
   ========================================================================== */
(function () {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------------------------------------------------------------------- */
  /* Single source of truth for contact details used inside generated markup
     (modal CTAs, mailto links). The visible copy in the HTML has its own
     copies; when the real details arrive, search the repo for [[FILL IN]]. */
  const CONTACT = {
    email: '[[FILL IN: jennifer email]]',
    phone: '[[FILL IN: jennifer phone]]',
    tel:   '[[FILL IN: +1XXXXXXXXXX]]',
    firm:  '[[FILL IN: brokerage licensed name]]',
  };

  const reveal = (root) => window.JR && window.JR.observeReveals
    ? window.JR.observeReveals(root) : null;

  /* --------------------------------------------------- Netlify form submit */
  // POST a form's fields to Netlify Forms. Netlify captures the submission
  // server side and emails Jennifer. The hidden `form-name` field in each form
  // tells Netlify which form it is. `extras` lets a caller add derived fields
  // such as a readable summary.
  function postForm(form, extras) {
    const data = new FormData(form);
    if (extras) Object.keys(extras).forEach((k) => data.set(k, extras[k]));
    return fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(data).toString(),
    }).then((res) => {
      if (!res.ok) throw new Error('Form submit failed: ' + res.status);
      return res;
    });
  }

  /* ----------------------------------------------------------- footer year */
  $$('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ------------------------------------------------------------------- nav */
  const nav = $('#nav');
  const hero = $('.hero, .page-hero');
  const burger = $('#burger');

  if (nav) {
    function onScroll() {
      const y = window.scrollY;
      // On the scrubbed hero, hold the over-hero treatment until the pinned
      // section is nearly released, so the nav flips once the exit fade has
      // already turned the backdrop light. 0.94 lands just before the release.
      const scrub = hero && hero.classList.contains('hero--scrub')
        ? (hero.offsetHeight - window.innerHeight) * 0.94
        : null;
      nav.classList.toggle('is-scrolled', y > (scrub !== null ? scrub : 40));
      const heroBottom = hero
        ? (scrub !== null ? scrub : hero.offsetHeight - 90)
        : 0;
      nav.classList.toggle('is-top', y < heroBottom && !nav.classList.contains('is-open'));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    if (burger) {
      burger.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
        onScroll();
      });
      $$('.nav__links a').forEach((a) =>
        a.addEventListener('click', () => {
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          onScroll();
        })
      );
      // Escape closes the mobile menu and returns focus to the toggle.
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && nav.classList.contains('is-open')) {
          nav.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
          burger.focus();
          onScroll();
        }
      });
    }
  }

  /* ------------------------------------------------- single step form init */
  // Contact and the relocation guide share this. `onDone` lets the guide form
  // reveal its download link once the lead is captured.
  function initSimpleForm({ formId, doneId, errorId, onDone }) {
    const form = $(formId);
    if (!form) return;
    const doneEl = $(doneId);
    const errorEl = $(errorId);
    const submitBtn = form.querySelector('button[type="submit"]');
    const label = submitBtn ? submitBtn.textContent : '';

    // Mark invalid fields on a blocked submit so the styling and the
    // aria-invalid state stay in step with the browser's own validation.
    form.addEventListener('invalid', (e) => {
      const wrap = e.target.closest('.field');
      if (wrap) wrap.classList.add('is-invalid');
      e.target.setAttribute('aria-invalid', 'true');
    }, true);

    form.addEventListener('input', (e) => {
      const wrap = e.target.closest('.field.is-invalid');
      if (wrap && e.target.checkValidity()) {
        wrap.classList.remove('is-invalid');
        e.target.removeAttribute('aria-invalid');
      }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending'; }
      postForm(form)
        .then(() => {
          // Inline display rather than the hidden attribute: the form carries
          // an author display:flex rule that outranks [hidden].
          form.style.display = 'none';
          if (doneEl) doneEl.hidden = false;
          if (typeof onDone === 'function') onDone();
        })
        .catch(() => {
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
          if (errorEl) errorEl.hidden = false;
        });
    });
  }

  initSimpleForm({
    formId: '#contact-form',
    doneId: '#contact-done',
    errorId: '#contact-error',
  });

  initSimpleForm({
    formId: '#guide-form',
    doneId: '#guide-done',
    errorId: '#guide-error',
  });

  /* --------------------------------------- multi step lead forms (shared) */
  // Buyers and Sellers are both 3 step .vform cards with the same skeleton.
  // `ids` supplies each form's element id prefix so the two never collide.
  // `buildSummary` turns the fields into a readable block that rides along
  // with the submission, so the notification email is legible.
  function initMultiStepForm({ formId, ids, titles, buildSummary }) {
    const form = $(formId);
    if (!form) return;
    const steps = $$('.vform__step', form);
    const total = steps.length;
    const backBtn = $(ids.back);
    const nextBtn = $(ids.next);
    const submitBtn = $(ids.submit);
    const submitLabel = submitBtn.textContent;
    const barFill = $(ids.barFill);
    const curEl = $(ids.cur);
    const titleEl = $(ids.title);
    const noteEl = $(ids.note);
    const doneEl = $(ids.done);
    const errorEl = $(ids.error);
    let cur = 1;

    function showStep(n) {
      cur = Math.min(Math.max(n, 1), total);
      steps.forEach((s) => s.classList.toggle('is-active', +s.dataset.step === cur));
      barFill.style.width = ((cur / total) * 100) + '%';
      curEl.textContent = cur;
      titleEl.textContent = titles[cur - 1];
      backBtn.hidden = cur === 1;
      nextBtn.hidden = cur === total;
      submitBtn.hidden = cur !== total;
      const first = steps[cur - 1].querySelector('input, select, textarea');
      if (first) first.focus({ preventScroll: true });
    }

    // Validate only the fields in the current step, using native constraints.
    function validateStep() {
      const fields = $$('input, select, textarea', steps[cur - 1]);
      let firstBad = null;
      fields.forEach((f) => {
        const wrap = f.closest('.vfield');
        const ok = f.checkValidity();
        if (wrap) wrap.classList.toggle('is-invalid', !ok);
        // aria-invalid is what a screen reader announces. Keep it in step
        // with the visual state rather than relying on color alone.
        if (ok) f.removeAttribute('aria-invalid');
        else f.setAttribute('aria-invalid', 'true');
        if (!ok && !firstBad) firstBad = f;
      });
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    form.addEventListener('input', (e) => {
      const wrap = e.target.closest('.vfield.is-invalid');
      if (wrap && e.target.checkValidity()) {
        wrap.classList.remove('is-invalid');
        e.target.removeAttribute('aria-invalid');
      }
    });

    nextBtn.addEventListener('click', () => { if (validateStep()) showStep(cur + 1); });
    backBtn.addEventListener('click', () => showStep(cur - 1));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateStep()) return;
      const d = new FormData(form);
      const g = (k) => (d.get(k) || '').toString().trim();

      if (errorEl) errorEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending';

      postForm(form, { summary: buildSummary(g) })
        .then(() => {
          // Inline display, not [hidden]: .vform__step.is-active and the flex
          // containers carry author display rules that outrank the attribute.
          steps.forEach((s) => { s.classList.remove('is-active'); s.style.display = 'none'; });
          const navEl = $('.vform__nav', form);
          const headEl = $('.vform__head', form);
          if (navEl) navEl.style.display = 'none';
          if (headEl) headEl.style.display = 'none';
          if (noteEl) noteEl.style.display = 'none';
          doneEl.hidden = false;
          doneEl.focus();
        })
        .catch(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
          if (errorEl) errorEl.hidden = false;
        });
    });

    showStep(1);
  }

  /* ------------------------------------------------ home valuation (sellers) */
  initMultiStepForm({
    formId: '#valuation-form',
    ids: {
      back: '#vform-back', next: '#vform-next', submit: '#vform-submit',
      barFill: '#vform-bar-fill', cur: '#vform-cur', title: '#vform-title',
      note: '#vform-note', done: '#vform-done', error: '#vform-error',
    },
    titles: ['The property', 'The details', 'You and timeline'],
    buildSummary(g) {
      const addr = [g('street'), [g('city'), g('zip')].filter(Boolean).join(' ')]
        .filter(Boolean).join(', ');
      const specs = [
        g('beds') && (g('beds') + ' bd'),
        g('baths') && (g('baths') + ' ba'),
        g('sqft') && (g('sqft') + ' sq ft'),
      ].filter(Boolean).join('  |  ');
      return [
        'PROPERTY: ' + (addr || '(not provided)'),
        'Type: ' + (g('type') || '(not specified)'),
        specs && ('Size: ' + specs),
        'Condition: ' + (g('condition') || '(not specified)'),
        g('updates') && ('Updates and features: ' + g('updates')),
        '',
        'FROM: ' + g('name'),
        'Email: ' + g('email'),
        g('phone') && ('Phone: ' + g('phone')),
        'Timeline to sell: ' + (g('timeline') || '(not specified)'),
      ].filter(Boolean).join('\n');
    },
  });

  /* -------------------------------------------------- buyer search (buyers) */
  initMultiStepForm({
    formId: '#buyer-form',
    ids: {
      back: '#bform-back', next: '#bform-next', submit: '#bform-submit',
      barFill: '#bform-bar-fill', cur: '#bform-cur', title: '#bform-title',
      note: '#bform-note', done: '#bform-done', error: '#bform-error',
    },
    titles: ['What you are looking for', 'Must haves', 'You and timeline'],
    buildSummary(g) {
      const budget = [
        g('budgetMin') && ('$' + num(+g('budgetMin'))),
        g('budgetMax') && ('$' + num(+g('budgetMax'))),
      ].filter(Boolean).join(' to ');
      const specs = [
        g('beds') && (g('beds') + ' bd'),
        g('baths') && (g('baths') + ' ba'),
        g('sqft') && (g('sqft') + '+ sq ft'),
      ].filter(Boolean).join('  |  ');
      return [
        'LOOKING FOR: ' + (g('type') || '(not specified)') +
          ' in ' + (g('areas') || '(area not specified)'),
        budget && ('Budget: ' + budget),
        specs && ('Size: ' + specs),
        'Financing: ' + (g('financing') || '(not specified)'),
        g('musthaves') && ('Must haves and deal breakers: ' + g('musthaves')),
        '',
        'FROM: ' + g('name'),
        'Email: ' + g('email'),
        g('phone') && ('Phone: ' + g('phone')),
        'Timeline to move: ' + (g('timeline') || '(not specified)'),
      ].filter(Boolean).join('\n');
    },
  });

  /* --------------------------------------------------- mortgage calculator */
  const mPrice = $('#mcalc-price');
  if (mPrice) {
    const mDown  = $('#mcalc-down');
    const mRate  = $('#mcalc-rate');
    const mTerm  = $('#mcalc-term');
    const mFlood = $('#mcalc-flood');
    const mHoa   = $('#mcalc-hoa');
    const out = {
      total: $('#mcalc-payment'),
      pi:    $('#mcalc-pi'),
      tax:   $('#mcalc-tax'),
      ins:   $('#mcalc-ins'),
      flood: $('#mcalc-flood-out'),
      hoa:   $('#mcalc-hoa-out'),
      pmi:   $('#mcalc-pmi'),
    };
    const rows = {
      flood: $('#mcalc-flood-row'),
      hoa:   $('#mcalc-hoa-row'),
      pmi:   $('#mcalc-pmi-row'),
    };

    // Manatee County ballpark figures, all clearly labeled as estimates in the
    // UI. Florida insurance is the number that surprises people moving here:
    // it runs several times what the same house costs to insure in most of the
    // country, which is exactly why it gets its own line rather than hiding
    // inside a single payment number.
    const TAX_RATE_YR = 0.0105;   // Manatee County effective, non homestead
    const INS_RATE_YR = 0.0120;   // wind and hazard, Gulf Coast
    const PMI_RATE_YR = 0.0060;   // of loan, only when down payment is under 20%
    // Annual flood premium by zone. Zone X is the low risk inland case.
    const FLOOD_YR = { none: 0, x: 700, ae: 3200 };

    function calcPayment() {
      const price   = Math.max(0, +mPrice.value || 0);
      const downPct = Math.min(100, Math.max(0, +mDown.value || 0));
      const rate    = Math.max(0, +mRate.value || 0);
      const years   = +mTerm.value || 30;
      const principal = price * (1 - downPct / 100);
      const monthly = rate / 100 / 12;
      const n = years * 12;

      let pi;
      if (principal <= 0) pi = 0;
      else if (monthly === 0) pi = principal / n;
      else pi = principal * (monthly * Math.pow(1 + monthly, n)) / (Math.pow(1 + monthly, n) - 1);

      const tax = (price * TAX_RATE_YR) / 12;
      const ins = (price * INS_RATE_YR) / 12;
      const hasPmi = downPct < 20 && principal > 0;
      const pmi = hasPmi ? (principal * PMI_RATE_YR) / 12 : 0;
      const flood = (FLOOD_YR[mFlood ? mFlood.value : 'none'] || 0) / 12;
      const hoa = Math.max(0, +(mHoa ? mHoa.value : 0) || 0);

      const total = pi + tax + ins + pmi + flood + hoa;

      out.pi.textContent  = '$' + num(Math.round(pi));
      out.tax.textContent = '$' + num(Math.round(tax));
      out.ins.textContent = '$' + num(Math.round(ins));
      rows.pmi.hidden = !hasPmi;
      if (hasPmi) out.pmi.textContent = '$' + num(Math.round(pmi));
      rows.flood.hidden = flood <= 0;
      if (flood > 0) out.flood.textContent = '$' + num(Math.round(flood));
      rows.hoa.hidden = hoa <= 0;
      if (hoa > 0) out.hoa.textContent = '$' + num(Math.round(hoa));
      out.total.textContent = '$' + num(Math.round(total));
    }

    [mPrice, mDown, mRate, mTerm, mFlood, mHoa]
      .filter(Boolean)
      .forEach((el) => el.addEventListener('input', calcPayment));
    calcPayment();
  }

  /* --------------------------------------------------------------- helpers */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])
    );
  }

  function num(n) {
    return typeof n === 'number' ? n.toLocaleString('en-US') : n;
  }

  // Trim a long listing blurb to a teaser that ends on a clean sentence break.
  function shorten(text, max) {
    const clean = String(text).replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    const slice = clean.slice(0, max);
    const stop = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('! '), slice.lastIndexOf('? '));
    if (stop > max * 0.5) return slice.slice(0, stop + 1);
    const sp = slice.lastIndexOf(' ');
    return slice.slice(0, sp > 0 ? sp : max).replace(/[,;:.\s]+$/, '') + '.';
  }

  function splitParas(text, size) {
    const sentences = String(text).split(/(?<=[.!?])\s+(?=["'A-Z0-9])/);
    const out = [];
    for (const s of sentences) {
      if (!out.length || (out[out.length - 1] + ' ' + s).length > size) out.push(s);
      else out[out.length - 1] += ' ' + s;
    }
    return out;
  }

  /* -------------------------------------------------------------- listings */
  const grid = $('#listings-grid');
  const viewport = $('#listings-viewport');
  const prevBtn = $('#listings-prev');
  const nextBtn = $('#listings-next');
  const tabsEl = $('#listings-tabs');
  const titleEl = $('#listings-title');
  const subEl = $('#listings-sub');
  const metaEl = $('#listings-meta');

  function updateNav() {
    if (!viewport) return;
    // Snap can settle a few px off exact 0 or max, so use a loose tolerance.
    const max = viewport.scrollWidth - viewport.clientWidth - 8;
    if (prevBtn) prevBtn.disabled = viewport.scrollLeft <= 8;
    if (nextBtn) nextBtn.disabled = viewport.scrollLeft >= max;
  }
  if (viewport) {
    const page = (dir) =>
      viewport.scrollBy({ left: dir * viewport.clientWidth, behavior: 'smooth' });
    if (prevBtn) prevBtn.addEventListener('click', () => page(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => page(1));
    viewport.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
  }

  function factChips(l, cls) {
    const facts = [];
    if (l.beds)  facts.push('<span class="' + cls + '__fact"><b>' + l.beds + '</b> bd</span>');
    if (l.baths) facts.push('<span class="' + cls + '__fact"><b>' + l.baths + '</b> ba</span>');
    if (l.sqft)  facts.push('<span class="' + cls + '__fact"><b>' + num(l.sqft) + '</b> sq ft</span>');
    return facts;
  }

  function cardHTML(l, tag, idx) {
    const facts = factChips(l, 'card');
    const price = l.priceFormatted || (l.price ? '$' + num(l.price) : 'Inquire');
    // Use the full size image, not a thumbnail. Cards render wide, especially
    // on retina, and a 300px source looks soft.
    const photoSrc = l.photoLarge || (l.photos && l.photos[0]) || l.photo;
    const photo = photoSrc
      ? '<img loading="lazy" src="' + esc(photoSrc) + '" alt="' + esc(l.address || 'Listing photo') +
        '" onerror="this.style.display=\'none\'">'
      : '';
    // href stays as a fallback so ctrl or cmd click still works. A plain click
    // opens the in page detail view instead of leaving the site.
    const link = l.link ? esc(l.link) : '#';
    const area = [l.city, l.state].filter(Boolean).join(', ') + (l.zip ? ' ' + l.zip : '');
    return '' +
      '<a class="card reveal reveal--scale" href="' + link + '" data-idx="' + idx + '" rel="noopener"' +
      '   aria-label="View ' + esc(l.address || 'listing') + (l.city ? ', ' + esc(l.city) : '') + ', ' + esc(price) + '">' +
      '  <div class="card__media">' + photo +
      (tag ? '<span class="card__tag">' + esc(tag) + '</span>' : '') +
      '    <span class="card__price">' + esc(price) + '</span>' +
      '  </div>' +
      '  <div class="card__body">' +
      '    <div class="card__addr">' + esc(l.address || 'Address on request') + '</div>' +
      '    <div class="card__city">' + esc(area) + '</div>' +
      (facts.length
        ? '<div class="card__facts">' + facts.join('') + '</div>'
        : '<div class="card__facts" style="border:0"></div>') +
      '    <div class="card__foot">' +
      '      <span class="card__dist">' + esc(l.area || '') + '</span>' +
      '      <span class="card__link">View Details</span>' +
      '    </div>' +
      '  </div>' +
      '</a>';
  }

  let currentList = [];
  function renderGrid(list, tag, key) {
    currentList = list || [];
    grid.classList.toggle('listings__grid--six', key === 'singleFamily');
    if (!list || !list.length) {
      grid.innerHTML =
        '<p class="listings__empty">New listings are being added. ' +
        'Reach out and I will send what is coming before it hits the market.</p>';
      return;
    }
    grid.innerHTML = list.map((l, i) => cardHTML(l, tag, i)).join('');
    if (viewport) viewport.scrollTo({ left: 0, behavior: 'instant' });
    requestAnimationFrame(updateNav);
    reveal(grid);
    $$('.card', grid).forEach((card) => {
      card.addEventListener('click', (e) => {
        // Let power users open the source in a new tab if they want it.
        if (e.metaKey || e.ctrlKey || e.button === 1) return;
        e.preventDefault();
        openModal(currentList[+card.dataset.idx], tag);
      });
    });
  }

  /* ----------------------------------------------------------- listing modal */
  let modal, lastFocus;
  let gPhotos = [], gIdx = 0, gFallback = '';

  function showPhoto(i) {
    if (!gPhotos.length) return;
    gIdx = (i + gPhotos.length) % gPhotos.length;
    const img = modal.querySelector('#modal-img');
    img.src = gPhotos[gIdx];
    img.onerror = () => { if (gFallback && img.src !== gFallback) img.src = gFallback; };
    modal.querySelector('#modal-counter').textContent = (gIdx + 1) + ' / ' + gPhotos.length;
    $$('.modal__thumb', modal).forEach((t, k) => t.classList.toggle('is-active', k === gIdx));
    const active = modal.querySelector('.modal__thumb.is-active');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }

  function initGallery(photos, alt, fallback) {
    gPhotos = photos.length ? photos : (fallback ? [fallback] : []);
    gFallback = fallback || '';
    gIdx = 0;
    const multi = gPhotos.length > 1;
    modal.querySelector('#modal-img').alt = alt;
    ['#modal-prev', '#modal-next', '#modal-counter'].forEach(
      (s) => (modal.querySelector(s).style.display = multi ? '' : 'none')
    );
    const strip = modal.querySelector('#modal-thumbs');
    strip.style.display = multi ? '' : 'none';
    strip.innerHTML = multi
      ? gPhotos.map((p, k) =>
          '<button class="modal__thumb" data-k="' + k + '" aria-label="Photo ' + (k + 1) + '">' +
          '<img loading="lazy" src="' + esc(p) + '" alt="" ' +
          'onerror="this.parentElement.style.display=\'none\'"></button>'
        ).join('')
      : '';
    $$('.modal__thumb', strip).forEach((t) =>
      t.addEventListener('click', () => showPhoto(+t.dataset.k))
    );
    showPhoto(0);
  }

  function ensureModal() {
    if (modal) return modal;
    modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'listing-modal';
    modal.setAttribute('aria-hidden', 'true');
    modal.innerHTML =
      '<div class="modal__backdrop" data-close></div>' +
      '<div class="modal__dialog" role="dialog" aria-modal="true" aria-labelledby="modal-addr">' +
      '  <button class="modal__close" data-close aria-label="Close">&times;</button>' +
      '  <div class="modal__media">' +
      '    <div class="modal__stage">' +
      '      <img id="modal-img" alt="">' +
      '      <span class="modal__tag" id="modal-tag"></span>' +
      '      <span class="modal__price" id="modal-price"></span>' +
      '      <button class="modal__nav modal__nav--prev" id="modal-prev" aria-label="Previous photo">&#8249;</button>' +
      '      <button class="modal__nav modal__nav--next" id="modal-next" aria-label="Next photo">&#8250;</button>' +
      '      <span class="modal__counter" id="modal-counter"></span>' +
      '    </div>' +
      '    <div class="modal__thumbs" id="modal-thumbs"></div>' +
      '  </div>' +
      '  <div class="modal__body">' +
      '    <h3 class="modal__addr" id="modal-addr"></h3>' +
      '    <div class="modal__city" id="modal-city"></div>' +
      '    <div class="modal__facts" id="modal-facts"></div>' +
      '    <div class="modal__desc" id="modal-desc"></div>' +
      '    <div class="modal__foot">' +
      '      <a class="btn btn--solid" id="modal-cta" href="#">Ask About This Home</a>' +
      '      <a class="modal__source" id="modal-source" target="_blank" rel="noopener">Full details and photos</a>' +
      '    </div>' +
      '    <p class="modal__disclaimer" id="modal-disclaimer"></p>' +
      '  </div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target.hasAttribute('data-close')) closeModal();
    });
    modal.querySelector('#modal-prev').addEventListener('click', () => showPhoto(gIdx - 1));
    modal.querySelector('#modal-next').addEventListener('click', () => showPhoto(gIdx + 1));
    modal.querySelector('#modal-img').addEventListener('click', () => {
      if (gPhotos.length > 1) showPhoto(gIdx + 1);
    });

    document.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeModal();
      else if (e.key === 'ArrowRight') showPhoto(gIdx + 1);
      else if (e.key === 'ArrowLeft') showPhoto(gIdx - 1);
      else if (e.key === 'Tab') {
        // Keep keyboard focus inside the dialog while it is open (WCAG 2.4.3).
        const items = [...modal.querySelectorAll(
          'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])'
        )].filter((el) => el.offsetParent !== null);
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return modal;
  }

  function openModal(l, tag) {
    if (!l) return;
    ensureModal();
    lastFocus = document.activeElement;

    const photos = (l.photos && l.photos.length)
      ? l.photos.slice()
      : [l.photoLarge || l.photo].filter(Boolean);
    initGallery(photos, l.address || 'Property photo', l.photo || l.photoLarge);

    const tagEl = modal.querySelector('#modal-tag');
    tagEl.textContent = tag || '';
    tagEl.style.display = tag ? '' : 'none';

    modal.querySelector('#modal-price').textContent =
      l.priceFormatted || (l.price ? '$' + num(l.price) : 'Inquire');
    modal.querySelector('#modal-addr').textContent = l.address || 'Address on request';
    modal.querySelector('#modal-city').textContent =
      [l.city, l.state].filter(Boolean).join(', ') + (l.zip ? ' ' + l.zip : '');
    modal.querySelector('#modal-facts').innerHTML = factChips(l, 'modal').join('');

    const subject = encodeURIComponent(
      'Interested in ' + (l.address || 'a listing') + (l.city ? ', ' + l.city : '')
    );
    const mailto = 'mailto:' + CONTACT.email + '?subject=' + subject;

    const descEl = modal.querySelector('#modal-desc');
    const teaser = l.description
      ? shorten(l.description, 520)
      : 'A ' + (l.beds ? l.beds + ' bedroom ' : '') + 'home in ' + (l.city || 'Manatee County') + '.';
    descEl.innerHTML =
      splitParas(teaser, 260).map((p) => '<p>' + esc(p) + '</p>').join('') +
      '<p class="modal__nudge">Want more photos, the full details, or a private showing? ' +
      '<a href="' + mailto + '">Send me a note and I will walk you through it.</a></p>';

    modal.querySelector('#modal-cta').href = mailto;
    const source = modal.querySelector('#modal-source');
    if (l.link) { source.href = l.link; source.style.display = ''; }
    else source.style.display = 'none';

    // Listing attribution. Required by MLS display rules and simply honest.
    const data = window.LISTINGS || {};
    modal.querySelector('#modal-disclaimer').textContent =
      'Listing courtesy of ' + (l.listingBroker || data.source || CONTACT.firm) + '. ' +
      'Information is deemed reliable but is not guaranteed and is subject to change or prior sale. ' +
      'Equal Housing Opportunity.';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    modal.querySelector('.modal__body').scrollTop = 0;
    modal.querySelector('.modal__close').focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function buildTabs(tabs, onPick) {
    // Toggle button group. A valid and screen reader friendly pattern for
    // filtering a grid, and simpler than a real tablist here.
    tabsEl.innerHTML = tabs.map((t, i) =>
      '<button class="tab ' + (i === 0 ? 'is-active' : '') + '" type="button" ' +
      'aria-pressed="' + (i === 0 ? 'true' : 'false') + '" data-key="' + esc(t.key) + '">' +
      esc(t.label) + '<span class="tab__count">' + t.items.length + '</span></button>'
    ).join('');
    $$('.tab', tabsEl).forEach((btn) =>
      btn.addEventListener('click', () => {
        $$('.tab', tabsEl).forEach((b) => {
          b.classList.remove('is-active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('is-active');
        btn.setAttribute('aria-pressed', 'true');
        onPick(btn.dataset.key);
      })
    );
  }

  function initListings() {
    if (!grid) return;   // no listings section on this page

    // Three tiers of fallback so the grid is never empty: her own listings,
    // then the brokerage feed, then the hand maintained seed file.
    const data = window.LISTINGS || window.LISTINGS_SEED;
    if (!data) {
      grid.innerHTML =
        '<p class="listings__empty">Listings will appear here once the feed runs.</p>';
      return;
    }

    const active = data.active || [];
    const sold = data.sold || [];
    const team = data.team || {};
    const labels = data.teamLabels || {};
    const tabs = [];
    let cardTag = null;

    if (active.length) {
      titleEl.textContent = 'My Listings';
      subEl.textContent = 'Homes I am representing right now across Manatee County.';
      tabs.push({ key: 'active', label: 'Active', items: active });
      cardTag = 'For Sale';
    } else {
      titleEl.textContent = 'Featured Properties';
      subEl.textContent =
        'A look at what is available across Bradenton, the barrier islands, and Lakewood Ranch. ' +
        'Ask me about any of these, or about something you have not seen listed yet.';
    }

    Object.keys(team).forEach((key) => {
      const items = team[key] || [];
      if (items.length) tabs.push({ key: key, label: labels[key] || key, items: items });
    });

    if (sold.length) tabs.push({ key: 'sold', label: 'Recently Sold', items: sold });

    if (!tabs.length) { renderGrid([]); return; }

    const byKey = {};
    tabs.forEach((t) => (byKey[t.key] = t));

    // Deal price sorted listings across the carousel pages so each scroll spans
    // the whole range instead of stacking every expensive home on page one.
    function mixByPrice(list, perPage) {
      const pages = Math.max(1, Math.ceil(list.length / perPage));
      const sorted = [...list].sort((a, b) => (b.price || 0) - (a.price || 0));
      const buckets = Array.from({ length: pages }, () => []);
      sorted.forEach((l, i) => buckets[i % pages].push(l));
      return buckets.flat();
    }

    function show(key) {
      const t = byKey[key];
      const tag = key === 'sold' ? 'Sold' : key === 'active' ? 'For Sale' : cardTag;
      const items = key === 'singleFamily' ? mixByPrice(t.items, 6) : t.items;
      renderGrid(items, tag, key);
    }

    if (tabs.length > 1) {
      tabsEl.style.display = '';
      buildTabs(tabs, show);
    } else {
      tabsEl.style.display = 'none';
    }
    show(tabs[0].key);

    if (metaEl) {
      const when = data.generatedAt
        ? new Date(data.generatedAt).toLocaleDateString('en-US',
            { month: 'long', day: 'numeric', year: 'numeric' })
        : null;
      metaEl.textContent =
        'Listing information is provided by ' + (data.source || CONTACT.firm) + '. ' +
        (when ? 'Updated ' + when + '. ' : '') +
        'Information is deemed reliable but is not guaranteed, and is subject to change or prior sale. ' +
        'This site is not intended to solicit properties already listed with another broker.';
    }
  }

  initListings();
})();
