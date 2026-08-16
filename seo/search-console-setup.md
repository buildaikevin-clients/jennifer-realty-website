# Search Console Setup. Jennifer Barragan

Ported from kevin-vaz-realty-website/seo/search-console-setup.md. Do this
after scripts/set-domain.js has run and the site is live on its real host.
Search Console is free, takes twenty minutes, and is the only way to see
what Google actually does with the site.

## Setup

1. search.google.com/search-console with Jennifer's Google account (the
   same one that owns the Business Profile, so everything lives together).
2. Add property. Use the **URL prefix** type with the full site URL.
3. Verification: choose **HTML tag**. Send the content value to Kevin, who
   adds `<meta name="google-site-verification" content="..." />` to
   index.html (same pattern as Kevin's own site). Deploy, then click Verify.
4. Sitemaps: submit `sitemap.xml`.
5. URL inspection > Request indexing, one by one, for:
   - the home page
   - guides.html
   - each of the four guide pages
   This is the difference between indexed this week and indexed next month.

## Bing, while you are at it

Bing Webmaster Tools has a one click import from Search Console. Bing feeds
Copilot and part of ChatGPT search, which matters for the AI visibility
goal. Import, done.

## What to look at monthly

- **Performance > filter page contains /guides/**: impressions are the
  leading indicator. Guides collect impressions on long tail questions for
  months before clicks arrive. Rising impressions mean it is working.
- **Indexing > Pages**: the g/ landing pages should show as excluded by
  noindex. That is correct, not a problem. Anything ELSE excluded needs a
  look.
- **Performance > Queries**: the questions people actually typed. Feed the
  good ones back into guide FAQs.
