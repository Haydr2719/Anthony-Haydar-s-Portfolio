# Anthony Haydar — Website

Premium website and built-in CMS for **Anthony Haydar, Beverage & Operations Consultant**, built from the *Website Design & Development Brief* (Build by Sarah, October 2026).

**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Supabase (Postgres, Auth, Storage)

---

## Quick start (no database needed)

```bash
npm install
npm run dev
```

Open http://localhost:3000. Without Supabase the site shows the built-in placeholder content from `src/content/fallback.ts`, so you can review the design right away. The enquiry form and `/admin` need Supabase.

## Connecting Supabase

1. **Create a project** at https://supabase.com.
2. **Run the 4 SQL files** in Supabase → *SQL Editor*, one at a time, in this order:

   | Step | File | What it does |
   |---|---|---|
   | 1 | `supabase/migrations/01_schema.sql` | All tables, helper functions, triggers, indexes (incl. push devices and rate-limit counters) |
   | 2 | `supabase/migrations/02_security.sql` | Access rules (RLS), permissions, the `media` storage bucket, live enquiries (Realtime) |
   | 3 | `supabase/migrations/03_content.sql` | Real starting content: settings & contact details, page text, the 4 services, Anthony's career & credentials, 11 client projects. No sample data. |
   | 4 | `supabase/migrations/04_admin_users.sql` | Admin access. First create the users in *Authentication → Users → Add user* (tick *Auto confirm*), check the emails in the file, then run it. |

   All four files are safe to re-run. File 3 never overwrites content already edited in the admin.
   Later changes come as extra numbered files for databases that already exist (a new database already has them through files 1–4, and running them anyway is harmless):

   | File | What it does |
   |---|---|
   | `supabase/migrations/05_drink_categories.sql` | Adds the *Coffee Shop* and *Bar* drink categories |
   | `supabase/migrations/06_project_details_toggle.sql` | Adds *Settings → Portfolio → Show client project detail pages* (off by default) |
   | `supabase/migrations/07_facebook_link.sql` | Adds *Settings → Social links → Facebook* |
   The old step-by-step files used while building the site are in `supabase/archive/dev-history/` — **don't run them on production**.
3. **Turn off public sign-ups:** *Authentication → Sign In / Providers →* untick *Allow new users to sign up*. Admins are added by hand (step 2, file 4), so nobody needs to register. (Non-admin accounts can't see or change anything extra anyway — this just keeps the user list clean.)
4. **Environment variables:** copy `.env.example` to `.env` (or `.env.local`) and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL` — *Project Settings → Data API* (`https://<project-ref>.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — *Project Settings → API Keys*, the *publishable* key (`sb_publishable_…`)
   - `SUPABASE_SERVICE_ROLE_KEY` — same page, the *secret* key (`sb_secret_…`). Server only — never expose it.

   The URL and both keys must come from the **same** project, otherwise every request fails with *Invalid API key*. The legacy JWT keys (`eyJ…`) are disabled on this project — use the new keys. (The old variable name `NEXT_PUBLIC_SUPABASE_ANON_KEY` still works as a fallback.)
5. Restart `npm run dev` (environment variables are only read at startup) and sign in at **/admin**.

**Check the setup** in the SQL Editor — a fresh database should give:

| Table | Rows |
|---|---|
| `site_settings` | 1 |
| `pages` | 18 |
| `content_blocks` | 86 |
| `services` | 4 |
| `projects` | 11 (9 published, 2 drafts) |
| `experience` | 17 |
| `admin_users` | one per admin |

Then send a test enquiry from the contact page and check it appears in */admin → Enquiries*.

> **Never put real keys in `.env.example`** — it is committed, and the repository is public. Real values go only in `.env` / `.env.local` (git-ignored) and in the hosting settings.
>
> **Table access on new projects:** Supabase projects created since May 2026 don't give the API roles access to new tables automatically. `02_security.sql` grants it explicitly — `anon` / `authenticated` (limited further by RLS, which is on for every table) and `service_role` (the server's secret key: saving enquiries, banner clicks, push notifications). If a table is ever unreachable (*permission denied*), a missing grant is the first thing to check.

### Starting content (seed)

`03_content.sql` is the seed: real content from the brief and Anthony's CV, no sample data — site settings and contact details, SEO for every page, all page text, the 4 services, 11 client projects (Sira and Cherry on top stay drafts until the clients approve) and 17 career entries. Drinks, training, events, media, testimonials, partners and banners start empty and are added in `/admin`.

It is generated from `src/content/fallback.ts` with `npm run seed:generate` — edit that file, not the SQL. After launch, edit content in `/admin` instead; re-running the seed only fills in missing rows and never overwrites admin edits.

### Getting notified of new enquiries

**Browser push notifications** (recommended, plus email as a backup):
1. Run `npx web-push generate-vapid-keys` once and put the keys in `.env` and your hosting settings as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` and `VAPID_PRIVATE_KEY`, plus `VAPID_SUBJECT=mailto:consultancy@anthonyhaydar.com` (a real inbox, no space after `mailto:` — Apple rejects malformed subjects). Keep the same keys forever — new keys disconnect every device. The subject can be changed at any time.
2. In `/admin`, click **Enable notifications** (bottom of the sidebar) on each device — laptop, phone — and allow notifications. Use **Send test** to check.
   - **iPhone/iPad:** open the admin in Safari → Share → *Add to Home Screen*, open it from that icon, then enable notifications (Apple requirement, iOS 16.4+).
   - Clicking a notification opens that enquiry in the admin.

**Live inbox:** while any admin page is open, new / updated / deleted enquiries appear instantly (Supabase Realtime "Postgres Changes" on `leads`, restricted to admins by RLS). The page also re-syncs when the tab becomes visible, the internet returns or the connection reconnects, so nothing is missed. The sidebar shows *Enquiries: Live / Reconnecting… / Offline*.

**Email with a Gmail address (no domain needed):** create the Resend account with the same Gmail you set as `LEAD_NOTIFY_EMAIL`, and leave `LEAD_FROM_EMAIL` empty. Emails then come from `onboarding@resend.dev`; pressing *Reply* answers the visitor directly. (Sending to other addresses, or emailing visitors, requires verifying a domain in Resend.)

### Environment variables

All of them are listed, with comments, in `.env.example`. Variables starting with `NEXT_PUBLIC_` are sent to the browser — never use that prefix for a secret.

| Variable | Needed? | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Required | Connects the site and admin to Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Required | Secret key (server only): saves enquiries and banner clicks, sends push notifications |
| `NEXT_PUBLIC_SITE_URL` | Required in production | Canonical links, sitemap and social cards (`https://anthonyhaydar.com`) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` | Recommended | Browser push notifications for new enquiries |
| `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_WHATSAPP` | Recommended | Buttons on the "temporarily unavailable" page (see Notes) |
| `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, `LEAD_FROM_EMAIL` | Optional | Email notification for every enquiry (resend.com) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY` | Optional | Cloudflare Turnstile captcha on forms |
| `NEXT_PUBLIC_GA_ID` | Optional | Google Analytics 4 (loaded only after cookie consent) |
| `NEXT_PUBLIC_META_PIXEL_ID` | Optional | Meta Pixel (loaded only after cookie consent) |

When you add or rename a variable, update `.env.example` too (names and comments only — no real values).

## Deploying (Vercel recommended)

Import the repo in Vercel, add the same environment variables as in your `.env` (*Settings → Environment Variables*), deploy. `NEXT_PUBLIC_` values are built into the site, so redeploy after changing any of them. Public pages are static and refresh every 60 seconds (scheduled posts and banner dates go live on time); saving in the CMS refreshes them immediately.

---

## What's included (mapped to the brief)

**Public site**
- Sitemap from §3 with dropdown navigation, persistent *Book a Consultation* CTA (desktop header + mobile menu) and secondary CTAs (*Request Training*, *Book a Workshop*, *Discuss a Brand Partnership*, *Meet Anthony at HORECA*).
- Homepage with all 16 sections from §4 (hero photo **or** muted looping video, expertise strip, services, sponsor banner, methodology, sectors, about preview + credibility stats, selected work, drinks, training, HORECA callout, video/media, testimonials & logos *only when real entries exist*, quick form, footer with Build by Sarah credit toggle).
- About (story, mission & vision, approach, values, experience timeline, credentials).
- Consultancy overview + one page per pillar: problem, audience, what's included, approach, deliverables, related projects, media, FAQ (with FAQ rich results) and an enquiry form. No prices.
- Portfolio: projects (category filter, brief/role/work/outcome, highlights, before/after, gallery), Drinks & Concepts (category filter + detail pages), Brand Collaborations.
- Training & Events: training programs, corporate training, workshops/masterclasses (date, topic, trainer, venue, capacity, status: Upcoming / Registration Open / Sold Out / Completed), upcoming + past events.
- **Homepage events slideshow:** every *published, upcoming* event (status not *Completed* and end date not passed) appears as a slide; events ticked *Show first in homepage slideshow* come first, then soonest first. Auto-advances every 7 s (pauses on hover/focus; off for reduced-motion users), with arrows, dots and swipe. Past events drop out automatically. The **Also coming up** button links to the full Events page. With no upcoming events the section is hidden.
- **Event landing pages** (e.g. HORECA): tick *Landing page* on an event for the mobile-first QR layout (meeting CTA, booth, schedule, services, sponsor strip, meeting form). Short QR link: **`/e/<event-slug>`** (adds UTM tags automatically).
- Media: photo gallery with lightbox and video library (YouTube/Vimeo/MP4, vertical reels).
- **Videos auto-play when 25% visible:** every video card (`VideoCard` in `src/components/media-client.tsx`) starts playing muted and looping, with controls, once at least 25% of it is on screen, and pauses when scrolled away. Nothing is downloaded before that. Clicking the thumbnail first plays it with sound. No auto-play for visitors with *reduce motion* or *data saver* on. Change the threshold with `AUTOPLAY_VISIBLE`, or pass `autoPlayOnView={false}` to a card to keep click-to-play. Videos opened from a gallery lightbox are unchanged.
- Contact page with all fields from §12, pre-selected by `?type=` (consultation, training, workshop, partnership, event_invite, trade_meeting).
- Five CMS-controlled ad zones (§11): top bar, homepage banner, mid-content (per page), event sponsor strip, footer partners — desktop + mobile creatives, dates, active toggle, new-tab option, UTM tags, click tracking. Empty zones take no space.
- Optimised images (AVIF/WebP, lazy loading, mobile crops), subtle scroll reveals (respecting reduced motion), SEO metadata per page/entry, sitemap.xml, robots.txt, JSON-LD, cookie consent, discreet WhatsApp button, accessibility basics (skip link, labels, focus states, keyboard lightbox).

**Lead capture & spam protection** — honeypot field, minimum fill time, rate limiting, optional Turnstile, server-side validation; leads are stored in Supabase and optionally emailed.

**Rate limiting** (`src/lib/rate-limit.ts` + the `rate_limit` function in `01_schema.sql`) — counters are stored in Supabase (shared by every server instance; check-and-count is one atomic statement) and only the server can use them. IPs and emails are hashed. Limits (edit `LIMITS` to change):

| What | Limit |
|---|---|
| Admin login — failed attempts | 5 per IP / 15 min · 10 per email / hour (successful logins aren't counted) |
| Enquiry form | 5 per IP / 10 min · 3 per email / hour |
| Banner clicks | 1 counted click per IP per banner per hour (visitors are always redirected) |

If the SQL hasn't been run or Supabase is unreachable, requests are allowed and the problem is logged, so a setup issue never locks anyone out.

**Admin CMS (`/admin`)**
- Dashboard (new enquiries, banner clicks).
- Enquiries inbox with status, notes, reply/call/WhatsApp buttons and CSV export.
- Page text editor for every page's headlines and copy.
- Content types: Services, Projects, Drinks, Training & Workshops, Events, Media Library, Banners & Sponsors, Testimonials, Partners, Experience, Page SEO, Site Settings.
- Draft / publish, **scheduled publishing**, manual ordering, direct uploads to Supabase Storage, SEO fields (title, description, sharing image, slug).

## Project structure

```
src/
  app/(site)/        public pages
  app/admin/         CMS (login, dashboard, generic list/edit pages, leads)
  app/actions/       enquiry form server action
  components/        UI, media (gallery/lightbox/video), site & admin components
  content/fallback.ts  starting content (generates 03_content.sql; also the Page text definitions)
  lib/data.ts        all public data loading (Supabase or fallback)
  lib/cms/collections.ts  CMS field definitions — add a field here + a column in SQL
supabase/migrations/ the 4 SQL files to run on a new database (01 → 04)
supabase/archive/    old step-by-step SQL from development (don't run on production)
```

## Homepage hero (scroll animation)

`src/components/site/hero-scroll.tsx` — a pinned hero that plays an image sequence on a `<canvas>` as you scroll, with phrases that animate in/out and the CTA at the end (GSAP + ScrollTrigger).

- **Frames:** `public/frames/frame_0001.webp …` (desktop, 1080×1920) and `public/frames-mobile/…` (720×1280, phones under 768px). After replacing the desktop frames, run `npm run frames:mobile` to regenerate the mobile set.
- **Settings** (top of the file): `FRAME_COUNT`, `SCROLL_DISTANCE` (`"150vh"`), `SCRUB` (`0.3`), `MOBILE_BREAKPOINT`, frame folders, `DEFAULT_PHRASES`, and the in/hold/out split (`PHRASE_IN`, `PHRASE_OUT`) and `CTA_START`.
- **Text:** headline, paragraph and buttons come from Admin → Page text → Home (*Hero* fields). The phrases are the *Hero – scroll phrases* field (one per line; the last one stays on screen with the CTA).
- **Sizing:** the hero is always exactly *screen height minus the sticky header* (measured in JS — CSS `svh` was unreliable on iOS Safari) and pins right under the header, so the whole hero is visible while the frames play. Phones fill the screen with the frames ("cover", edges may be cropped slightly); desktop shows the whole frame ("contain"). Override with the `objectFit` prop. On short phones the paragraph is hidden so the text fits.
- With *reduce motion* turned on in the visitor's system settings there's no pinning or scrubbing: one still frame and all text visible.
- **Not editable in the admin:** the hero animation is a set of image files in the code, not an upload field. The old Site settings fields *Homepage hero image / mobile crop / video / poster* were removed from the admin because nothing used them any more (their database columns still exist, unused and harmless). The hero **text** stays editable in Page text.

### How to change the hero animation (developer task)

**Easiest — from a video clip** (needs [ffmpeg](https://ffmpeg.org) installed, e.g. `winget install Gyan.FFmpeg`):

1. Put the clip in the project (ideally a portrait **1080×1920** MP4, ~5–7 seconds) and run:
   `npm run frames:extract -- path/to/clip.mp4`
   This replaces every frame in `public/frames/` (WebP, 1080×1920, cropped to 9:16 if needed) and rebuilds `public/frames-mobile/` automatically. Add `--fps 20` for a longer clip to keep the frame count down (around 120–180 frames is ideal — more frames means more to download).
2. If the script warns that the frame count changed, update `FRAME_COUNT` at the top of `src/components/site/hero-scroll.tsx` to the number it prints.
3. Move the source clip out of `public/` afterwards — anything in `public/` is downloadable from the live site.

**Alternatively — from exported images:**

1. **Export the frames** from the video/animation tool as WebP images, **1080×1920 (portrait 9:16)**, numbered from 1 with 4 digits: `frame_0001.webp`, `frame_0002.webp`, …
2. **Replace the desktop frames:** delete the old files in `public/frames/` and copy the new ones in.
3. **Update the frame count** if it changed: `FRAME_COUNT` at the top of `src/components/site/hero-scroll.tsx`.
4. **Regenerate the mobile frames:** run `npm run frames:mobile`.

**Then, either way:**

1. **Check locally:** `npm run dev`, open the homepage on desktop and with the browser's phone view (or a real phone), and scroll through the hero — first frame visible immediately, smooth scrubbing, last frame at the end.
2. **Optional tweaks** in `hero-scroll.tsx`: `SCROLL_DISTANCE` (longer/shorter hero, e.g. `"100vh"`–`"200vh"`), `SCRUB` (smoothing), and the phrases in Admin → Page text → Home.
3. **Deploy** (commit + push; Vercel rebuilds the site). Visitors may need a refresh to drop cached frames.

The previous frames are in Git history if you ever need them back: `git checkout -- public/frames public/frames-mobile` (before committing the new ones).

## Logo

The master logo is `public/Official Logo.svg` (a Canva SVG export). Run `npm run logo:build` after replacing it: `scripts/build-logo.mjs` drops the background and text shadows, keeps the name and subtitle as vectors, and creates every logo file the site uses:
`public/logo/full.svg` (stacked), `mark.svg` (AH monogram), `wordmark.svg` (name + subtitle), `name.svg` (name only), plus the favicon `src/app/icon.svg` and the admin app icon `public/admin-icon.svg`.
The `Logo` component (`src/components/logo.tsx`) uses these as CSS masks, so one file shows dark on light backgrounds and light on dark ones: `<Logo />` (header), `<Logo stacked />` (footer, login, 404), `<Logo compact />` (monogram only). The script measures the crops itself and writes the matching aspect ratios into `logo.tsx`.

## Before launch — content still needed (§15)
A vector version of the AH monogram from the designer (in the current master it is a 668 × 373 px bitmap), real photography/video, approved bio/mission/vision, verified experience, client approval to publish the Sira and Cherry on top projects (drafts), the public contact email in *Site settings* (the seed uses `anthony.h2719@gmail.com`; the env files use `consultancy@anthonyhaydar.com`), legal texts (Privacy / Terms / Cookies are placeholders in *Page text → Legal pages*).

## Notes
- Brand colours live in `src/app/globals.css`. Buttons use a slightly deeper olive (`#5F6552`) than the brand olive (`#747B65`) so white button text meets WCAG AA contrast; the brand olive is used for lines, icons and accents.
- Uploads go to the `media` storage bucket, grouped by where they are used: `services/`, `projects/`, `drinks/`, `training-workshops/`, `events/`, `media-library/`, `banners/`, `testimonials/`, `partners/`, `experience/`, `seo/`, `site-settings/`, `page-text/<page>/`. To add a folder for a new content type, set `storageFolder` in `src/lib/cms/collections.ts` (it defaults to the type's key).
- **Photos are compressed in the browser before upload** (`src/lib/compress-image.ts`): longest side max 2,400 px, converted to WebP at 85% quality (visually identical on screen), rotation fixed, and metadata such as GPS location removed. SVGs, GIFs and videos are uploaded unchanged. Tweak `MAX_SIDE` / `QUALITY` in that file. Keep original high-resolution photos elsewhere (e.g. Google Drive) if they're needed for print.
- This applies to every image field in the admin (all content types, Site settings and Page text), because they all use the same upload component (`UploadField` in `src/components/admin/fields.tsx`) — new image fields get it automatically.
- **Pasted image links:** if an image *link* is pasted into a field instead of uploading a file, nothing is uploaded, so nothing is compressed — the image stays on the other website. The site still optimises it when displaying it (resized, AVIF/WebP) if its host is allowed in `next.config.ts` (Supabase, YouTube thumbnails, Unsplash); images from any other host are shown as-is, at full size. Prefer uploading files over pasting links.
- Uploads are limited to 50 MB (Supabase free plan) — checked after compression, so in practice this only affects videos. For longer videos use YouTube/Vimeo links.
- After editing `src/content/fallback.ts`, run `npm run seed:generate` to regenerate `03_content.sql`.
- **Future database changes** (new table or column): add a new numbered file (`05_…sql`) to `supabase/migrations/` and run it on both the development and production databases.
- **If the database is unavailable:** placeholder content is only used when Supabase is *not configured* (local development). Once it is configured, a failed query never shows placeholders: pages that were already generated keep being served in their last good version, and otherwise visitors see a branded "temporarily unavailable" page with *Try again*, email and WhatsApp buttons. Set `NEXT_PUBLIC_CONTACT_EMAIL` and `NEXT_PUBLIC_CONTACT_WHATSAPP` so those buttons appear (they deliberately don't come from the database).
