# Setting Up Hosting. What Jennifer Does, What Kevin Does

The arrangement: **Kevin builds and updates the site. Jennifer hosts it.**
Her Netlify account carries the site so the running cost sits with the site's
owner, and Kevin keeps the code and pushes updates whenever something changes.

Once this is set up once, it runs itself. Kevin pushes a change, her site
rebuilds and goes live in about a minute. Nobody has to do anything.

---

## Why it is arranged this way

A private repository owned by a personal GitHub account has only two levels,
owner and collaborator, and **only the owner can install a GitHub App**.
Netlify deploys through its GitHub App. So while the code sits under Kevin's
personal account, Jennifer cannot connect it to her own Netlify at all, no
matter what access he grants her.

A GitHub **organization** solves it. Organization repositories support read
only roles, and the organization owner installs the app once. Kevin keeps
ownership of the code, Jennifer gets read access and hosts it.

Also worth knowing before starting: **Netlify's free plan cannot add team
member seats.** It allows unlimited "Reviewers," who can leave feedback but
cannot set environment variables, manage domains, or change build settings.
So for the few console tasks below, either Jennifer clicks while Kevin talks
her through it, or they share the login. There is no third option on the free
plan.

---

## Part 1. Kevin, before Jennifer does anything

1. Create a free GitHub organization if one does not exist yet. One
   organization holds every client site, one repository each.
2. Move this repository into it: repository **Settings > General > Transfer
   ownership**, destination the organization. History, branches, and privacy
   all carry over.
3. Add Jennifer as an **outside collaborator** on this repository, with the
   **Read** role. Repository **Settings > Collaborators and teams > Add
   people**, entering her email address. Inviting by email works whether or
   not she already has a GitHub account.

   **Outside collaborator, not organization member.** An org member can see
   the organization's repository list, so once Carlos's and Roy's sites live
   here too, each client would be able to see that the others exist. An
   outside collaborator sees only the one repository shared with them. Same
   access, real isolation between clients.

   Read is also deliberate. She never needs to change anything, and read
   access means she cannot break the site by accident.
4. Install the **Netlify GitHub App** on the organization, scoped to this
   repository. Do this as the organization owner. This is the step that is
   impossible while the repo is under a personal account.
5. Send her Part 2.

If Netlify refuses to list the repository for her in Part 2, raise her to
**Write** on this repository alone and try again. Do not grant Admin.

Done on 2026-08-16: organization `buildaikevin-clients` created, this
repository transferred into it, and the Netlify GitHub App installed on the
organization scoped to this repository. The local clone's remote was
repointed and a push verified the same day.

---

## Part 2. Jennifer, about fifteen minutes

You will need the GitHub invitation email from Kevin. Accept it first.

### 1. Make a Netlify account

Go to **netlify.com** and sign up. Choose **Sign up with GitHub**, which
saves a step later. The free plan is the right one and covers this site
comfortably.

### 2. Create the site

- Select **Add new site**, then **Import an existing project**
- Choose **GitHub**, and pick the site repository from the list
- **Leave the build command empty** and set the publish directory to a single
  dot: `.`

That last part matters. This site has no build step, so there is nothing to
run. If Netlify tries to guess and fills something in, clear it. The correct
settings are already stored in the repository, in a file called
`netlify.toml`.

Select **Deploy**. It takes about a minute.

### 3. Turn on form notifications. Do not skip this one.

**Site configuration > Forms > Form notifications > Add notification >
Email notification.**

Add your own email address here.

This is the single most important click in the whole setup. Netlify records
every enquiry from the website automatically, but **it will not tell anyone
until this is switched on.** Left off, every lead arrives silently and sits
in a dashboard nobody opens.

Kevin will give you a second address to add here as well, which files leads
straight into your BoldTrail CRM.

### 4. Tell Kevin the site is up

Send him the address Netlify gives you. It will look something like
`something-random-12345.netlify.app`. He handles the rest: pointing
jenniferbarragan.com at it, the email delivery settings, and the final
testing.

---

## Part 3. Kevin, to finish

1. Point the GoDaddy DNS for jenniferbarragan.com at her Netlify site, and
   set it as the primary domain with www redirecting to the apex.
2. Add the BoldTrail Lead Dropbox address as a second form notification. Its
   value lives in the vault and in Netlify environment variables, never in
   this repository.
3. Set the delivery function environment variables when Resend is ready.
   These are listed in the header of `netlify/functions/lead.mjs`. Setting
   some without `RESEND_API_KEY` accomplishes nothing, so set all of them or
   none.
4. Run the end to end test in `funnel-runbook.md` before Jennifer posts her
   first keyword video.

---

## After setup, who does what

| | Who |
|---|---|
| Changing anything on the site | Kevin, by pushing to the repository. Deploys automatically |
| Hosting cost | Jennifer's account. The free plan is expected to cover this site |
| The domain | Kevin owns and points it |
| Leads arriving | Straight to Jennifer's email and her CRM |
| Netlify console tasks | Jennifer's login, since the free plan has no member seats |

Jennifer never has to touch the code, and Kevin never has to pay for hosting
on a site that is not his. That is the whole point of the arrangement.
