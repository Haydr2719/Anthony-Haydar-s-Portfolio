# TODO — Anthony Haydar Website

Everything still to do, grouped by feature. Tick items off as you go (`- [x]`).
Setup details for most items are in `README.md`.

---

## 1. Supabase (database, login, storage)
- [ ] Create the **production** Supabase project.
- [ ] Run the 4 SQL files in Supabase → SQL Editor, **one by one, in order**:
  - [ ] `supabase/migrations/01_schema.sql` — all tables & functions
  - [ ] `supabase/migrations/02_security.sql` — access rules, `media` storage bucket, live enquiries
  - [ ] `supabase/migrations/03_content.sql` — real starting content (no samples)
  - [ ] Authentication → Users → **Add user** for each admin (strong password, tick *Auto confirm*)
  - [ ] `supabase/migrations/04_admin_users.sql` — **check the emails in the file first**, then run
- [ ] Don't run anything from `supabase/archive/` on production (that's the old development history).
- [ ] Authentication → URL Configuration → set **Site URL** to the live domain.
- [ ] Check Storage shows the `media` bucket.
- [ ] Check Integrations → Data API is enabled (tables must be reachable from the API).
- [ ] Decide on backups (brief §13): the free plan has no downloadable daily backups — the Pro plan does.

## 2. Environment variables (`.env.local` + hosting settings)
Copy `.env.example` → `.env.local`, then fill in:
- [ ] `NEXT_PUBLIC_SITE_URL` — the live domain (e.g. `https://anthonyhaydar.com`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable key (`sb_publishable_…`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` — secret key, **server only, never share**
- [ ] `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_WHATSAPP` — shown on the "temporarily unavailable" page
- [ ] Push keys (see §3)
- [ ] Email keys (see §3)
- [ ] Optional: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, Turnstile keys (see §8)

## 3. Enquiry notifications
**Browser push**
- [ ] Run `npx web-push generate-vapid-keys` **once** → set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT=mailto:...`. Never change them later (it disconnects every device).
- [ ] In `/admin` → sidebar → **Enable notifications** on Anthony's laptop and phone → **Send test**.
- [ ] iPhone: Safari → Share → *Add to Home Screen* → open from the icon → enable notifications.

**Email backup (works with Gmail, no domain needed)**
- [ ] Create a Resend account **with the same Gmail** that will receive the emails.
- [ ] Set `RESEND_API_KEY` and `LEAD_NOTIFY_EMAIL=<that Gmail>`; leave `LEAD_FROM_EMAIL` empty.
- [ ] Later, if a domain is bought: verify it in Resend and set `LEAD_FROM_EMAIL` (needed to email other people, e.g. Sarah or visitor auto-replies).

## 4. Brand assets
- [x] Official logo — header, footer, admin, login and 404 pages use the real logo (built from `public/Official Logo.svg` with `npm run logo:build`).
- [x] Browser favicon — `src/app/icon.svg` (AH monogram).
- [ ] **Ask the designer for a vector AH monogram** (AI / EPS / PDF / SVG). In `public/Official Logo.svg` the name and subtitle are vectors, but the monogram is a 668 × 373 px bitmap: fine on screen, but soft when printed large (business cards, stand signage). With a vector version, update the master file and the monogram part of `scripts/build-logo.mjs`, then run `npm run logo:build`.
- [ ] iPhone home-screen icon: add `src/app/apple-icon.png` (180×180 PNG — Apple doesn't accept SVG). Export it from `src/app/icon.svg`.
- [ ] Admin app icon: also export a 512×512 PNG of `public/admin-icon.svg` for phones that don't show SVG icons; update `public/admin.webmanifest`, `public/sw.js` and `src/app/admin/layout.tsx`.
- [ ] Default social sharing image (1200×630) → Admin → Site settings → *Default sharing image*.

## 5. Content to replace before launch (all in `/admin`)
`03_content.sql` starts production with real data from the brief and the CV. What's still missing or needs approval:

**Site settings**
- [ ] Email and phone are from the CV — confirm. Add WhatsApp (left empty on purpose).
- [ ] Instagram / LinkedIn profile links (empty — not on the CV); YouTube / TikTok if used.
- [ ] Booking link (Calendly etc.) if Anthony uses one.
- [x] Homepage hero — now a scroll animation from `public/frames` (not set in the admin). To change it, follow "How to change the hero animation" in the README.
- [ ] About photo / video.
- [ ] Default SEO title and description.

**Content that starts empty on production — add in /admin**
- [ ] Drinks & Concepts (none yet)
- [ ] Training & Workshops (none yet — e.g. barista / bar training programs, masterclasses with dates)
- [ ] Events (none yet — e.g. HORECA with real dates, venue, booth, schedule; tick *Landing page*)

**From the CV — review**
- [ ] Career & Credentials — Anthony to review wording.
- [ ] The 2 draft projects (Sira, Cherry on top): confirm the clients agree to be named, add photos, then publish. (The homepage shows *featured* projects; until one is featured and published it shows the 3 most recent published projects.)
- [ ] Write up the 9 consulting projects (Sama Judy, Traction, Mountain Mud, Dice and Bites, Consiglio, Coffee & Co., Lemonade Chahine, Railway Coffee Station, Croissant Bar): brief, what was done, outcome, photos — and confirm each client agrees to be named. They start published with minimal info; unpublish any that won't be written up.

**Page text**
- [ ] Home: headline, value proposition, credibility numbers (from the CV: "5+ Years in Hospitality", "11 Consulting Projects"), about preview.
- [ ] About: story (written from the CV — Anthony to approve), mission, vision, approach, values.
- [ ] Contact: intro, thank-you message, consent wording.
- [ ] **Legal pages: Privacy, Terms, Cookies** — currently placeholders, must be real before launch.

**Services**
- [ ] Review all four services: summary, problem, audience, included items, approach, deliverables, FAQs, cover images.

**Media & social proof**
- [ ] Upload photos and videos (Media Library) — tick *Featured* for homepage/About.
- [ ] Testimonials — only real, approved ones.
- [ ] Partner / client logos — only with permission.
- [ ] Page SEO → title, description and sharing image for important pages.

## 6. Events & QR codes
- [ ] For each trade show: create the event, tick **Landing page**, add booth + schedule.
- [ ] Generate a QR code pointing to `https://<domain>/e/<event-slug>` for business cards / stands (adds UTM tracking automatically).
- [ ] Optional: add event sponsors (Banners → placement *Event sponsor strip*).

## 7. Deployment
- [ ] **Hosting plans** (recommended for launch, ~$45/month):
  - [ ] **Vercel Pro** ($20/mo) — required by Vercel's terms for a business/commercial site (Hobby is non-commercial only).
  - [ ] **Supabase Pro** ($25/mo) — no pausing after 7 days of inactivity, daily backups (brief §13), 100 GB file storage instead of 1 GB.
  - Free plans are fine during development and client review.
- [ ] Optional: buy a domain (~$10–15/year) — professional URL + branded email sender in Resend.
- [ ] Push the project to a Git repository.
- [ ] Import it in Vercel (or similar), add **all** environment variables from §2–3.
- [ ] Connect the domain (HTTPS is automatic on Vercel).
- [ ] Update `NEXT_PUBLIC_SITE_URL` and Supabase *Site URL* to the final domain.
- [ ] Submit `https://<domain>/sitemap.xml` in Google Search Console.

## 8. Optional features / decisions
- [ ] Google Analytics 4 (`NEXT_PUBLIC_GA_ID`) — the cookie banner appears automatically once set.
- [ ] Meta Pixel (`NEXT_PUBLIC_META_PIXEL_ID`).
- [ ] Cloudflare Turnstile captcha (`NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`) — honeypot + rate limit already active.
- [ ] Auto-reply email to visitors after an enquiry (needs a verified domain).
- [ ] Daily reminder email for enquiries still marked *New*.
- [ ] Sticky "Book a Consultation" button on mobile (brief §14 says optional).
- [ ] Banner ads: create banners when there are sponsors (empty zones stay hidden).
- [ ] `src/content/fallback.ts` is the source of `03_content.sql` — if the final copy is ready before production is created, update it there and run `npm run seed:generate`.

## 9. Testing before launch (brief: "QA performance, forms, mobile, SEO and tracking")
These were **not** tested end-to-end yet because they need the live Supabase project:
- [ ] Admin login; non-admin user is refused.
- [ ] Create / edit / delete / reorder in each content type; draft vs published; scheduled publishing goes live on time.
- [ ] Image and video uploads land in the right folder in the `media` bucket.
- [ ] Logged out, the API can't read drafts or enquiries (security rules).
- [ ] Enquiry form: submission saved, confirmation shown, push + email received, appears in the admin, CSV export works.
- [ ] Rate limits: 6 wrong passwords in a row → "Too many failed sign-in attempts"; 6 quick enquiries → "Too many enquiries"; repeated banner clicks count once per hour.
- [ ] Live inbox: with `/admin/leads` open, send an enquiry from another browser → it appears without refreshing; sidebar shows *Enquiries: Live*; turn Wi-Fi off/on → it re-syncs.
- [ ] Banners: each placement shows, start/end dates respected, clicks counted, empty zones collapse.
- [ ] "Temporarily unavailable" page shows if the database is unreachable.
- [ ] Mobile check on a real phone (especially the QR / event landing page).
- [ ] Lighthouse (performance, accessibility, SEO) on the live site.
- [ ] Cookie banner + analytics only load after consent.
