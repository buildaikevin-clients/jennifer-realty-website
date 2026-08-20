/* =============================================================================
   lang.js: the Spanish offer, and nothing else.

   The site is bilingual as two sets of static pages: English at the root,
   Spanish under /es/. Every page carries a link to its counterpart in the nav
   and a pair of hreflang tags in the head. That link is the switch, and it
   works with this file absent. This file only adds the OFFER: a slim bar that
   asks a visitor whose browser is set to Spanish whether they would rather
   read the Spanish page.

   Three rules it must not break.

   1. IT OFFERS, IT NEVER REDIRECTS. Sending someone to /es/ because their
      browser said es traps every bilingual reader who wanted the English page
      and hides the English page from a shared computer. Google advises
      against it for the same reason. The bar asks. The visitor answers.

   2. IT ASKS ONCE. The answer is stored, and after that neither the bar nor
      anything else raises the subject again. A banner that returns on every
      page load reads as a defect.

   3. IT LOADS FIRST AND RUNS SYNCHRONOUSLY, in the head, before the nav
      paints. Deferring it means the bar appears a moment after the page
      settles and pushes the whole header down under the reader's eye.

   The counterpart URL is read from the <link rel="alternate"> already in the
   head rather than being derived here, so the pairing lives in exactly one
   place per page and a page with no Spanish twin simply never offers one.
   ========================================================================== */
(function () {
  'use strict';

  var KEY = 'jb-lang';           // 'es' or 'en' once the visitor has answered
  var doc = document.documentElement;
  var pageLang = (doc.getAttribute('lang') || 'en').slice(0, 2).toLowerCase();

  /* Remember an explicit choice. Any click on the nav switch is one, and so
     is either button on the bar. */
  function remember(lang) {
    try { localStorage.setItem(KEY, lang); } catch (e) { /* private mode */ }
  }

  function answered() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-lang-switch]');
    if (a) remember(a.getAttribute('data-lang-switch'));
  });

  // Only the English pages ever offer. Someone already reading /es/ has what
  // the bar would be suggesting.
  if (pageLang !== 'en') return;
  if (answered()) return;

  // navigator.languages is the full Accept-Language list, so a reader whose
  // browser is set to English first and Spanish second is NOT offered the
  // switch. That ordering is the visitor stating a preference.
  var langs = navigator.languages && navigator.languages.length
    ? navigator.languages
    : [navigator.language || ''];
  var first = (langs[0] || '').slice(0, 2).toLowerCase();
  if (first !== 'es') return;

  /* Where to send them. The hreflang alternate is the truthful pairing and is
     preferred, but only the five translated pages have one. Everywhere else
     the nav switch already points at the Spanish home page, so fall back to
     that rather than staying silent: a visitor on an untranslated page still
     deserves to learn the Spanish site exists. What must NOT happen is
     hreflang claiming a twin that was never written, which is why the
     fallback reads the link and not the head. */
  var alt = document.querySelector('link[rel="alternate"][hreflang="es"]')
    || document.querySelector('[data-lang-switch="es"]');
  if (!alt) return;
  var target = alt.getAttribute('href');
  if (!target) return;

  function build() {
    var bar = document.createElement('div');
    bar.className = 'langbar';
    bar.setAttribute('lang', 'es');
    // Announced when it appears, but it does not steal focus: the visitor may
    // well be reading the English page on purpose.
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cambiar de idioma');

    var p = document.createElement('p');
    p.className = 'langbar__text';
    p.textContent = 'Esta página también está en español.';

    var go = document.createElement('a');
    go.className = 'langbar__go';
    go.href = target;
    go.setAttribute('hreflang', 'es');
    go.setAttribute('data-lang-switch', 'es');
    go.textContent = 'Ver en español';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'langbar__close';
    close.setAttribute('aria-label', 'Seguir en inglés');
    close.innerHTML = '&times;';
    close.addEventListener('click', function () {
      remember('en');
      bar.remove();
      document.body.classList.remove('has-langbar');
    });

    bar.appendChild(p);
    bar.appendChild(go);
    bar.appendChild(close);
    document.body.appendChild(bar);
    document.body.classList.add('has-langbar');
  }

  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
