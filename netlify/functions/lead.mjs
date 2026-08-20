/* =============================================================================
   lead.mjs — the delivery leg of the guide funnel.

   The browser POSTs here (same origin, so the site's CSP needs no change)
   after a guide form submits. Netlify Forms has ALREADY captured the lead by
   the time this runs; this function only does what Netlify Forms cannot:

     1. Email the LEAD the guide link. Netlify notifications only ever email
        the site owner, never the submitter.
     2. Email the brokerage CRM intake address a plain text, parseable lead
        notification whose subject names the guide requested.
     3. Optionally append a row to the lead sheet via Apps Script, server to
        server (see apps-script/Code.gs).

   Design rule that must not be broken: THIS FUNCTION NEVER DECIDES WHETHER
   THE VISITOR GETS THE GUIDE. The browser redirects on the Netlify capture,
   with a timeout ceiling, and this function returns ok even when email
   fails, alerting the operator instead. A failed email must not look like a
   failed capture.

   Environment variables (Netlify UI > Site configuration > Environment
   variables; never in netlify.toml, which is committed):

     RESEND_API_KEY     Resend transactional email key. Unset = email legs
                        are skipped and the alert leg reports it.
     MAIL_FROM          e.g.  Jennifer Barragan <guides@jenniferbarragan.com>
                        The domain must be verified in Resend or every email
                        silently lands in spam.
     JENNIFER_EMAIL     jenniferbarragan.re@gmail.com
     CRM_INTAKE_EMAIL   The brokerage CRM's lead parse address. Unset = the
                        CRM leg is skipped and the operator is alerted on
                        every lead until it is set, loudly on purpose.
     ALERT_EMAIL        Where failure alerts go (Kevin). Falls back to
                        JENNIFER_EMAIL.
     SHEET_WEBHOOK_URL  Apps Script /exec URL. Unset = sheet leg skipped.
     SHEET_TOKEN        Shared secret the Apps Script checks.
     SITE_URL           https://<host>, no trailing slash.
   ========================================================================== */

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const GUIDES = {
  relocate: { title: 'Relocating to Lakewood Ranch, Sarasota and Bradenton', path: '/guides/relocating-to-lakewood-ranch.html' },
  invest:   { title: 'Buying a Gulf Coast Investment Property', path: '/guides/gulf-coast-investment-property.html' },
  buyer:    { title: 'Your First Home, Start to Finish', path: '/guides/first-time-home-buyer-florida.html' },
  sell:     { title: 'Getting Your Home Ready to Sell', path: '/guides/preparing-your-home-to-list.html' },
};

async function sendEmail(env, { to, subject, text, replyTo }) {
  if (!env.RESEND_API_KEY || !env.MAIL_FROM) {
    throw new Error('email not configured: RESEND_API_KEY or MAIL_FROM missing');
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to: [to],
      subject,
      text,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`resend ${res.status}: ${await res.text()}`);
}

async function postSheet(env, row) {
  if (!env.SHEET_WEBHOOK_URL) return 'skipped: SHEET_WEBHOOK_URL unset';
  const res = await fetch(env.SHEET_WEBHOOK_URL, {
    method: 'POST',
    // No custom headers: Apps Script web apps 302 to googleusercontent and a
    // preflight free "simple request" body survives that redirect intact.
    body: JSON.stringify({ token: env.SHEET_TOKEN || '', ...row }),
  });
  if (!res.ok) throw new Error(`sheet ${res.status}`);
  return 'ok';
}

export default async (req) => {
  if (req.method !== 'POST') return json({ ok: false }, 405);

  let d;
  try { d = await req.json(); } catch { return json({ ok: false, error: 'bad json' }, 400); }

  // Same honeypot rule Netlify applies: a filled bot-field is a bot. Return
  // ok so the bot learns nothing.
  if (d['bot-field']) return json({ ok: true });

  const name = String(d.name || '').trim().slice(0, 200);
  const email = String(d.email || '').trim().slice(0, 200);
  const phone = String(d.phone || '').trim().slice(0, 50);
  const guideKey = String(d.guide || '').trim().toLowerCase();
  // Set by js/main.js from the page's own lang attribute, so a lead who filled
  // the form in on a /es/ page is flagged before Jennifer opens the email.
  const lang = String(d.lang || '').trim().slice(0, 20) || 'English';
  const guide = GUIDES[guideKey];
  if (!name || !email || !phone || !guide) return json({ ok: false, error: 'missing fields' }, 400);

  const env = process.env;
  const site = (env.SITE_URL || new URL(req.url).origin).replace(/\/+$/, '');
  const url = site + guide.path;
  const received = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });

  const signature =
    'Jennifer Barragan, REALTOR®\n' +
    'Preferred SHORE Real Estate\n' +
    '(205) 790-7560 | jenniferbarragan.re@gmail.com\n' +
    'Florida License SL3586445';

  /* Email 1: the lead. Short, personal, one link, and the firm name adjacent
     to the contact details as 61J2-10.025 requires. */
  const leadText =
`Hi ${name.split(' ')[0]},

Here is your guide, as promised:

${guide.title}
${url}

Read it whenever suits you. I will reach out once to see if you have
questions, and you can call or text me anytime at (205) 790-7560.

${signature}`;

  /* Email 2: the CRM. Plain text, one field per line, the guide in the
     subject, Reply-To set to the lead so replying reaches them.

     NO SIGNATURE HERE, DELIBERATELY, and do not add one back.

     This body is read by a machine: the BoldTrail Lead Dropbox parses it into
     a contact record. Jennifer's signature block carries her own phone number
     and email address, and a parser that scans a body for contact patterns
     rather than trusting the labels, or one that takes the last match it
     finds, would store HER details as the lead's. She would call herself and
     the real lead would be unreachable. It could also name the contact after
     her. The lead's own copy above keeps the signature, because a person
     reads that one.

     Same reason the field labels come first and the metadata last: the
     identity fields should be the first three patterns in the body. */
  const crmText =
`Name: ${name}
Email: ${email}
Phone: ${phone}
Source: Website guide request
Guide: ${guide.title}
Landing page: ${String(d.source || '').slice(0, 200)}
Page: ${String(d.page || '').slice(0, 300)}
Referrer: ${String(d.ref || '').slice(0, 300)}
Language: ${lang}
Received: ${received} US Eastern`;

  const legs = {
    leadEmail: sendEmail(env, {
      to: email,
      subject: `Your guide: ${guide.title}`,
      text: leadText,
    }),
    crmEmail: env.CRM_INTAKE_EMAIL
      ? sendEmail(env, {
          to: env.CRM_INTAKE_EMAIL,
          subject: `New Lead: ${name} (${guide.title})`,
          text: crmText,
          replyTo: email,
        })
      : Promise.reject(new Error('CRM_INTAKE_EMAIL unset, lead reached only Netlify and Jennifer')),
    jenniferEmail: env.JENNIFER_EMAIL
      ? sendEmail(env, {
          to: env.JENNIFER_EMAIL,
          subject: `New Lead: ${name} (${guide.title})`,
          text: crmText,
          replyTo: email,
        })
      : Promise.resolve('skipped'),
    sheet: postSheet(env, {
      name, email, phone,
      guide: guideKey,
      guideTitle: guide.title,
      source: String(d.source || ''),
      page: String(d.page || ''),
      referrer: String(d.ref || ''),
      lang,
    }),
  };

  const results = await Promise.allSettled(Object.values(legs));
  const names = Object.keys(legs);
  const failures = results
    .map((r, i) => (r.status === 'rejected' ? `${names[i]}: ${r.reason && r.reason.message}` : null))
    .filter(Boolean);

  /* Failures are never silent. The one place silence is acceptable is the
     alert itself failing, because there is nobody left to tell. */
  if (failures.length) {
    const alertTo = env.ALERT_EMAIL || env.JENNIFER_EMAIL;
    if (alertTo) {
      try {
        await sendEmail(env, {
          to: alertTo,
          subject: `Guide funnel: ${failures.length} leg(s) failed for lead ${name}`,
          text:
`A lead came through and part of the delivery failed. The lead IS captured
in Netlify Forms either way. Details:

${failures.join('\n')}

The lead:
${crmText}`,
        });
      } catch { /* alerting is best effort */ }
    }
    console.error('lead.mjs failures:', failures);
  }

  // Always ok: the browser's redirect decision rides on Netlify's capture,
  // and a delivery failure is an operator problem, not a visitor problem.
  return json({ ok: true });
};

export const config = { path: '/.netlify/functions/lead' };
