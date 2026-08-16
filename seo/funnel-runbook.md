# The Video Funnel Runbook. Jennifer Barragan

How the comment to DM funnel works, what Jennifer says, and what happens to
every lead. This is the operating manual; the machinery lives in
scripts/build-guides.js, js/main.js, netlify/functions/lead.mjs, and
apps-script/Code.gs.

## The play

1. Jennifer posts a video on any platform. Somewhere in it she says:
   "Comment RELOCATE and I will send you my free relocation guide."
2. Someone comments the keyword.
3. She replies to the comment ("Sent you a DM!") and DMs them the link.
   Replying publicly matters: it shows others the offer is real and feeds
   the platform's ranking of the post.
4. They open the link, land on a one purpose page, and trade name, phone,
   and email for the guide.
5. The guide opens instantly, a copy reaches their email, the lead reaches
   the CRM labeled with which guide they wanted, and a row lands in the
   sheet.
6. She follows up the same day. Speed decides whether the lead closes.

## The keywords and the links

| Comment keyword | DM link | Guide |
|---|---|---|
| RELOCATE | [site]/g/relocate | Relocating to the Bradenton Area |
| INVEST | [site]/g/invest | Buying a Gulf Coast Investment Property |
| BUYER | [site]/g/buyer | Your First Home, Start to Finish |
| SELL | [site]/g/sell | Getting Your Home Ready to Sell |

The links only work once the domain is set (scripts/set-domain.js). Add
platform tags when pasting so the sheet shows where each lead came from:

    [site]/g/relocate?utm_source=instagram
    [site]/g/relocate?utm_source=tiktok

The landing page passes the full URL through, and it shows in the sheet's
page column.

## The DM script

> Hey [name]! Here is the guide you asked about: [link]
> It opens right away, and if any part of your situation is specific, just
> reply here. Happy to help.

Short, no pitch, link does the work. The landing page handles consent and
capture.

## Video hook lines that match each guide

- RELOCATE: "Moving to Florida? Comment RELOCATE and I will send you the
  guide I wrote for people relocating to the Bradenton area."
- INVEST: "I own rentals here myself. Comment INVEST and I will send you
  how I run the numbers before I buy anything."
- BUYER: "First house? Comment BUYER and I will send you the whole process
  in plain language, including what nobody warns you about in Florida."
- SELL: "Thinking of selling? Comment SELL and I will send you what to fix,
  what to skip, and what it all costs, before you talk to any agent."

## When a lead arrives

Three places light up at once, on purpose, so no single failure loses one:

1. **Netlify Forms** captures it always (the backup record) and emails the
   notification address once notifications are switched on.
2. **The lead's inbox** gets the guide link from the delivery function.
3. **The CRM intake address and Jennifer's email** get a plain text lead
   whose subject names the guide: "New Lead: Jane Doe (Relocating to the
   Bradenton Area)". Reply goes to the lead directly.
4. **The Google Sheet** gets a row with guide, source, and page columns.

## The five minute rule

Call or text the lead the same hour, ideally within minutes. The sheet
stamps contacted_ts the first time a row's status changes, so the speed
from row to contact is measured, not guessed. A guide lead who hears from
Jennifer while still reading the guide converts at a different order of
magnitude than one called on Thursday.

Suggested first text:

> Hi [name], Jennifer Barragan here at Preferred SHORE. Your [guide name]
> just went out by email. While it is fresh, is there anything about your
> situation the guide does not cover? Happy to answer by text if that is
> easier.

## One time setup still required (in order)

1. Run scripts/set-domain.js with the live host, regenerate, deploy.
2. Netlify > Forms > enable notifications to Jennifer's email.
3. Resend account: verify the sending domain, create an API key.
4. Netlify env vars: RESEND_API_KEY, MAIL_FROM, JENNIFER_EMAIL,
   CRM_INTAKE_EMAIL, ALERT_EMAIL, SITE_URL, SHEET_WEBHOOK_URL,
   SHEET_TOKEN. See netlify/functions/lead.mjs header.

## The CRM leg: BoldTrail, and why it is email rather than API

Her brokerage runs BoldTrail, which is kvCORE rebranded, by Inside Real
Estate. Leads reach it through the **Lead Dropbox**: a per account parsing
address found under Lead Engine > Lead Dropbox. Anything emailed to it
becomes a contact, labeled source "Other Dropbox". That address is what
CRM_INTAKE_EMAIL holds.

**The address is a write endpoint into the brokerage's CRM.** Anyone who
has it can create contacts. It lives in Netlify environment variables and
in the Obsidian vault, and it is never committed here. Obtained from
Jennifer 2026-08-16.

The API was researched and rejected on 2026-08-16, for reasons worth
keeping:

- The account belongs to Preferred SHORE, not to Jennifer. A full scope
  token exposes the brokerage's contact database, which is a conversation
  with her broker rather than a setting she can flip.
- Inside Real Estate's own token documentation says "Inside Real Estate
  cannot assist with this" and directs you to your vendor. Here, we are
  the vendor.
- Tokens cap at three per account and expire after a year.
- It buys nothing for this job. The funnel pushes one direction. The API
  earns its complexity only for reading contacts back or syncing state.

Same conclusion generalizes: email intake works at every brokerage on
every CRM without anyone's permission. An API integration has to be
renegotiated per client.

**Open question, answered only by testing:** the dropbox is built to parse
known vendors like Realtor.com and Zillow. Whether it parses our format
into real fields or into a notes blob is undocumented. Send a test lead and
look at the resulting contact record before trusting this leg. If parsing
is poor, reshape the plain text body in lead.mjs to match a format it
recognizes. Confirm three things on the test contact: fields landed
correctly, source reads as expected, and it is assigned to Jennifer rather
than to the office.
5. Google Sheet + Apps Script: follow the header of apps-script/Code.gs.
6. Test end to end BEFORE the first video, per the checklist below.

## The end to end test (run on every deploy that touches the funnel)

- [ ] Submit /g/relocate with real details. Confirm all five: Netlify Forms
      shows the submission, the browser lands on the guide page, the guide
      email arrives, the CRM email names the right guide in the subject,
      the sheet grew a row.
- [ ] Repeat with JavaScript disabled: the native post still captures the
      lead and still ends on the guide page.
- [ ] Send a test guide email to a Gmail, an Outlook, and an iCloud address
      and confirm none land in spam. If they do, the sending domain DNS is
      not right yet, and every "delivered" lead email is silently lost.
- [ ] Temporarily rename the function locally and confirm the visitor still
      reaches the guide (the Netlify leg alone should carry it).

## What can silently lose a lead (watch list)

- Netlify form notifications switched off (the default!).
- A NEW Apps Script deployment instead of a new VERSION of the existing
  one: it mints a new URL and orphans the sheet leg while emails keep
  working. See the warning in apps-script/Code.gs.
- Unverified sending domain in Resend: everything reports delivered, all
  of it lands in spam.
- CRM_INTAKE_EMAIL unset or stale: the function alerts on every lead until
  it is set. Do not mute that alert, fix the variable.
