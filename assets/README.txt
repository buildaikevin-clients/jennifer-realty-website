ASSETS — what is here and what is still needed
===============================================

STILL NEEDED
------------

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

jennifer-source.jpg       Her master portrait, 4672x7008. Supplied 2026-07-27.
                          Never referenced by the site directly. It is kept so
                          the three crops below can be recut.

jennifer-headshot.jpg     4:5, 1600x2000. Home page about band and the About
                          page. The crop deliberately holds her face in the
                          upper third and leaves headroom, because
                          .about__photo oversizes the image by 42px for the
                          parallax drift and a tight crop would travel the top
                          of her hair out of frame on scroll.

jennifer-working.jpg      4:3, 1600x1200. Second About photo, wider, keeping
                          the surf artwork in frame behind her.

og-jennifer.jpg           1200x630. Social preview for the About page.

                          Recut any of them with:
                            ffmpeg -i assets/jennifer-source.jpg \
                              -vf "crop=3760:4700:912:1500,scale=1600:2000" \
                              -q:v 3 assets/jennifer-headshot.jpg
                          The crop is x=912 y=1500, 3760x4700 for the 4:5.
                          Judge any change by loading the page, not by opening
                          the file, because of the parallax oversize.

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

workwith-bg.webp          Background for the Ways To Work band on the home
                          page. 2200x1410.

                          NOT from the hero footage. This one is a real
                          photograph of a Florida waterfront mansion, from
                          Pexels photo 15334535.

                          Pexels licence: free for commercial use, no
                          attribution required, no credit line needed on the
                          page. That is why this file carries no visible
                          credit while assets/neighborhoods/ does, since
                          those are Wikimedia CC BY and CC BY-SA which do
                          require it.

                          Source is 3200x4800 portrait. The crop takes the
                          full width from y=2350, height 2050, which drops
                          most of the sky and keeps the house, palms,
                          seawall and water. Then scaled to 2200 wide.

                          Kept at quality 62 on purpose. Palm foliage does
                          not compress well and it was 773 KB at the sizes
                          tried first. It sits behind a heavy scrim, so the
                          quality is not visible and the weight is.

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
