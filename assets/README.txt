ASSETS — what is here and what is still needed
===============================================

STILL NEEDED
------------

jennifer-headshot.jpg     REQUIRED. Portrait, 4:5 ratio, about 1600x2000.
                          Used on the home page about band, the About page,
                          and as the social preview for About.
                          If missing, the page hides the photo block rather
                          than showing a broken image, so the site still
                          looks intentional. But it needs to be there.

jennifer-working.jpg      Optional second photo for the About page. 4:3,
                          about 1600x1200. Something candid at a property
                          rather than a second studio headshot.

guides/moving-to-bradenton.pdf
                          REQUIRED for the relocation guide form to deliver
                          anything. The form captures the lead either way,
                          but the success state links to this file.
                          Jennifer needs to write or approve the content,
                          since it carries her name and her market claims.

favicon.svg               Present, but it is a placeholder J monogram in the
                          palette colors. Replace with her real mark when she
                          has one, keeping the same filename so no page
                          markup has to change.


ALREADY HERE
------------

hero-source.mp4           The master hero video. 1920x1080, 12 seconds,
                          silent, no watermark. Committed so the frames can
                          always be regenerated.

hero-frames/              145 WebP frames at 12fps, about 7 MB total.
                          Generated from hero-source.mp4 by
                          scripts/build-hero-frames.js. Committed on purpose:
                          Netlify runs no build step, so generated output is
                          the deployed asset.

hero-mobile.mp4           1.1 MB loop served to phones instead of the frame
                          sequence, because iOS Safari cannot scrub reliably.

hero-poster.webp          First frame. Video poster and og:image.

card-buy.webp             The three Start Here cards on the home page.
card-sell.webp            All pulled from the hero footage, so they are
card-relocate.webp        already licensed and visually consistent.

hero-buyers.webp          Page heroes for the interior pages, also pulled
hero-sellers.webp         from the hero footage.
hero-relocate.webp
hero-neighborhoods.webp   Still used by the neighborhoods hub page. The 20
                          individual area pages now have their own photos.

neighborhoods/            One hero per neighborhood page, 1800x1013 WebP.
                          Real photographs from Wikimedia Commons, freely
                          licensed, NOT the AI footage. Each one carries a
                          visible credit in the bottom left of the hero
                          because CC BY and CC BY-SA require attribution.
                          See neighborhoods/CREDITS.md before swapping any
                          of them, and keep the PHOTOS block in
                          scripts/build-neighborhoods.js in sync.

                          Rebuild with:
                            npm install sharp
                            node scripts/build-neighborhood-heroes.js
                          Originals are fetched on demand into
                          scripts/.hero-cache/ and are not committed.

                          NOTE ON CROPPING: the hero box is about 3:1 on
                          desktop, so only the middle ~55% of a 16:9 file is
                          ever visible. The crop of each image is chosen to
                          put the subject in that band, via `focus` in the
                          build script. Judge any change by loading the page,
                          not by opening the file.

                          Four of the twenty are representative Florida
                          images rather than the actual area, because no
                          free photograph of those communities exists.
                          They are labeled as such in CREDITS.md and their
                          credit line names the real location. Jennifer's
                          own photos would replace them cleanly.


REGENERATING
------------

Needs ffmpeg:  winget install Gyan.FFmpeg
Then:          node scripts/build-hero-frames.js

If you replace hero-source.mp4 with a clip of a different length, check
FRAME_COUNT in js/hero-scrub.js. It is currently 145 and the build script
warns if the output does not match.


A NOTE ON THE HERO
------------------

The footage is AI generated. The home in it does not exist. That is fine as
atmosphere, the same way agent sites use stock photography, but only as long
as nothing on the site implies it is a real listing or one of Jennifer's
sales. Keep the alt text generic. See COMPLIANCE.md.
