/* =============================================================================
   chrome.js — the shared page chrome: head(), nav(), footer(), esc(), jsonEsc().

   Extracted from build-neighborhoods.js so build-guides.js can emit the same
   nav and footer without keeping a second copy. Two generators, one chrome.
   A change here regenerates both the neighborhood pages and the guide pages,
   which is the point: they can never drift apart again.

   This is a factory. Both callers pass their own DOMAIN constant so the two
   scripts stay runnable independently:

     const chrome = require('./lib/chrome')({ DOMAIN });

   Output contract: for the neighborhoods generator this module must produce
   byte identical pages to the pre extraction script. Verified on extraction
   day with a clean git diff over neighborhoods/ and neighborhoods.html. If you
   edit anything here, regenerate BOTH generators before committing.

   nav() notes:
   - `current` names the nav link that gets aria-current="page". It defaults to
     'neighborhoods' because that was the only generated section when the
     chrome lived in build-neighborhoods.js, and the default keeps that
     script's call sites unchanged. Pass null for pages with no nav home.
   - head() hardcodes ../ on the favicon and stylesheet because every generated
     page lives one directory deep. The hub pages at the root strip it with
     .replace(/\.\.\//g, ''), same trick hubPage() has always used. Do not
     "fix" this into a parameter without regenerating everything and checking
     the diff, it changes bytes.
   ========================================================================== */

'use strict';

module.exports = function chrome({ DOMAIN }) {

  const esc = (s) => String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const jsonEsc = (s) => JSON.stringify(String(s)).slice(1, -1);

  /* altEs: the path of this page's Spanish twin, relative to the site root,
     e.g. 'es/vecindarios.html'. Pass it ONLY when the twin actually exists.
     hreflang naming a page nobody wrote is worse than emitting nothing, which
     is why this is opt in per page rather than derived from the slug. */
  function head({ title, description, canonical, image, imageAlt, extraLd, altEs }) {
    const alternates = altEs ? `
  <!-- The Spanish twin of this page. Reciprocal: es/ points back here. -->
  <link rel="alternate" hreflang="en" href="https://${DOMAIN}/${canonical}" />
  <link rel="alternate" hreflang="es" href="https://${DOMAIN}/${altEs}" />
  <link rel="alternate" hreflang="x-default" href="https://${DOMAIN}/${canonical}" />` : '';
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
  <!-- iOS ignores an SVG icon on the home screen, so the touch icon is
       a raster. Both are generated from brand/build/emit.py. -->
  <link rel="apple-touch-icon" href="../assets/apple-touch-icon.png" />
  <meta name="description" content="${esc(description)}" />

  <link rel="canonical" href="https://${DOMAIN}/${canonical}" />${alternates}
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
  <meta name="author" content="Jennifer Barragan" />
  <meta name="geo.region" content="US-FL" />
  <meta name="geo.placename" content="Lakewood Ranch, Florida" />

  <meta property="og:site_name" content="Jennifer Barragan, Real Estate" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://${DOMAIN}/${canonical}" />
  <meta property="og:locale" content="en_US" />
  <meta property="og:image" content="https://${DOMAIN}/${image}" />
  <meta property="og:image:alt" content="${esc(imageAlt)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="https://${DOMAIN}/${image}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Montserrat:wght@300;400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/styles.css" />

  <!-- The Spanish offer bar. Head, not deferred: it has to settle before the
       header paints, or it shoves the nav down under the reader's eye.
       NO hreflang pair is emitted for generated pages, because none of them
       has a Spanish twin yet. lang.js falls back to the nav switch below, so
       a Spanish speaker still learns the Spanish site exists without the head
       claiming an alternate that was never written. -->
  <script src="../js/lang.js"></script>
${extraLd}
</head>`;
  }

  function nav(prefix, current = 'neighborhoods') {
    const cur = (key) => (current === key ? ' aria-current="page"' : '');
    return `
  <a class="skip-link" href="#main">Skip to content</a>

  <header class="nav" id="nav">
    <div class="nav__inner">
      <a href="${prefix}index.html" class="nav__brand">
        <span class="nav__brand-mark" aria-hidden="true"></span>
        <span class="nav__brand-text">
          <span class="nav__brand-name">Jennifer Barragan</span>
          <span class="nav__brand-sub">Preferred SHORE Real Estate</span>
        </span>
      </a>
      <nav class="nav__links" aria-label="Primary">
        <a href="${prefix}index.html#listings">Listings</a>
        <a href="${prefix}buyers.html"${cur('buyers')}>Buyers</a>
        <a href="${prefix}sellers.html"${cur('sellers')}>Sellers</a>
        <a href="${prefix}neighborhoods.html"${cur('neighborhoods')}>Neighborhoods</a>
        <a href="${prefix}relocate.html"${cur('relocate')}>Relocating</a>
        <a href="${prefix}index.html#about">About</a>
        <a href="${prefix}index.html#contact">Contact</a>
      </nav>
      <a class="nav__lang" href="${prefix}es/index.html" lang="es" hreflang="es"
         data-lang-switch="es" aria-label="Ver esta página en español">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>
        <span>Español</span>
      </a>
      <a href="tel:+12057907560" class="nav__cta">
        <span class="nav__cta-num">(205) 790-7560</span>
        <span class="nav__cta-firm">Preferred SHORE Real Estate</span>
      </a>
      <button class="nav__burger" id="burger" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>`;
  }

  function footer(prefix) {
    return `
  <footer class="footer">
    <div class="wrap">
      <div class="footer__top">
        <div class="reveal" style="--d:0s">
          <img class="footer__logo" src="${prefix}assets/logo-reversed.svg"
               width="280" height="116" loading="lazy"
               alt="Jennifer Barragan, Preferred SHORE Real Estate" />
          <p class="footer__tagline">
            Buying and selling across Lakewood&nbsp;Ranch, Sarasota, Bradenton,
            and the barrier islands.
          </p>
        </div>
        <div class="reveal" style="--d:.08s">
          <p class="footer__title">Explore</p>
          <ul class="footer__list">
            <li><a href="${prefix}buyers.html">Buyers</a></li>
            <li><a href="${prefix}sellers.html">Sellers</a></li>
            <li><a href="${prefix}neighborhoods.html">Neighborhoods</a></li>
            <li><a href="${prefix}relocate.html">Relocating</a></li>
          </ul>
        </div>
        <div class="reveal" style="--d:.16s">
          <p class="footer__title">More</p>
          <ul class="footer__list">
            <li><a href="${prefix}index.html#about">About</a></li>
            <li><a href="${prefix}index.html#listings">Listings</a></li>
            <li><a href="${prefix}guides.html">Guides</a></li>
            <li><a href="${prefix}accessibility.html">Accessibility</a></li>
            <li><a href="${prefix}index.html#contact">Contact</a></li>
          </ul>
        </div>
        <div class="footer__contact reveal" style="--d:.24s">
          <p class="footer__title">Contact</p>
          <address>
            <a href="tel:+12057907560">(205) 790-7560</a><br />
            <a href="mailto:jenniferbarragan.re@gmail.com">jenniferbarragan.re@gmail.com</a><br />
            50 S. Lemon Ave. Ste 302<br />
            Sarasota, FL 34236
          </address>
          <span class="footer__firm">
            <b>Preferred SHORE Real Estate</b><br />
            Jennifer Barragan, REALTOR®<br />
            Florida License SL3586445
          </span>
        </div>
      </div>

      <div class="footer__bottom">
        <p class="footer__legal reveal">
          &copy; <span class="js-year"></span> Jennifer Barragan, Licensed Real
          Estate Agent. Florida License SL3586445. Brokered by Preferred SHORE Real Estate.
          Neighborhood descriptions are general guidance about places and are
          not a representation about price, schools, or availability. Listing
          information is deemed reliable but is not guaranteed and is subject to
          change or prior sale. This site is not intended to solicit properties
          already listed with another broker.
        </p>
        <p class="footer__legal footer__eho reveal" style="--d:.1s">
          <span class="eho-mark" aria-hidden="true"></span>
          <span>
            Equal Housing Opportunity. I am committed to the letter and the
            spirit of the Fair Housing Act, and I do not discriminate on the
            basis of race, color, religion, sex, familial status, national
            origin, disability, or any other class protected by federal or
            Florida law.
          </span>
        </p>
      </div>
    </div>
  </footer>

  <script src="${prefix}js/reveal.js"></script>
  <script src="${prefix}js/main.js"></script>
</body>
</html>
`;
  }

  return { esc, jsonEsc, head, nav, footer };
};
