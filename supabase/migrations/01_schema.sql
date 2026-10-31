-- =============================================================================
-- Anthony Haydar Website - 01 Schema
-- STEP 1 of 4 for a new (production) database. Supabase -> SQL Editor -> Run.
-- Safe to re-run.
--
-- Creates every table, helper function, trigger and index:
--   content (settings, pages, page text, services, projects, drinks, programs,
--   events, testimonials, partners, experience, media, banners), enquiries
--   (leads), admins, push-notification devices and rate-limit counters.
-- =============================================================================

create extension if not exists pgcrypto with schema extensions;

-- Private schema: NOT exposed through the Data API. Holds helper functions.
create schema if not exists private;

-- -----------------------------------------------------------------------------
-- Helpers
-- -----------------------------------------------------------------------------
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admins (people allowed to use the /admin CMS)
-- -----------------------------------------------------------------------------
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  created_at timestamptz not null default now()
);

-- Security definer so RLS policies can check membership without exposing the
-- table. Lives in the private (non-exposed) schema and only answers for the
-- calling user.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users where user_id = (select auth.uid())
  );
$$;

-- -----------------------------------------------------------------------------
-- Site settings (single row) and page-level SEO / editable text blocks
-- -----------------------------------------------------------------------------
create table if not exists public.site_settings (
  id                      int primary key default 1 check (id = 1),
  site_name               text not null default 'Anthony Haydar',
  tagline                 text default 'Beverage & Operations Consultant',
  email                   text,
  phone                   text,
  whatsapp                text,          -- international format, digits only e.g. 9613123456
  location                text,
  instagram_url           text,
  facebook_url            text,
  linkedin_url            text,
  youtube_url             text,
  tiktok_url              text,
  booking_url             text,          -- optional external calendar (Calendly, Cal.com...)
  hero_image              text,
  hero_mobile_image       text,
  hero_video              text,          -- muted looping background video (mp4)
  hero_poster             text,
  about_image             text,
  about_video             text,
  default_seo_title       text,
  default_seo_description text,
  default_og_image        text,
  show_whatsapp_button    boolean not null default true,
  show_build_credit       boolean not null default true,
  show_project_details    boolean not null default false, -- client project detail pages public?
  updated_at              timestamptz not null default now()
);

create table if not exists public.pages (
  slug            text primary key,      -- 'home', 'about', 'consultancy', ...
  title           text not null,
  seo_title       text,
  seo_description text,
  og_image        text,
  updated_at      timestamptz not null default now()
);

create table if not exists public.content_blocks (
  id         uuid primary key default gen_random_uuid(),
  page       text not null,
  key        text not null,
  label      text not null,
  value      text not null default '',
  kind       text not null default 'text' check (kind in ('text', 'textarea', 'image', 'url')),
  help       text,
  sort_order int not null default 0,
  updated_at timestamptz not null default now(),
  unique (page, key)
);

-- -----------------------------------------------------------------------------
-- Consultancy services (the four pillars)
-- -----------------------------------------------------------------------------
create table if not exists public.services (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  tagline         text,
  summary         text,
  problem         text,                  -- the problem it solves
  audience        text,                  -- who it is for
  included        text[] not null default '{}',
  approach        text,                  -- how Anthony works
  deliverables    text[] not null default '{}',
  faqs            jsonb  not null default '[]'::jsonb,  -- [{question, answer}]
  cta_label       text,
  icon            text,
  cover_image     text,
  cover_video     text,
  seo_title       text,
  seo_description text,
  og_image        text,
  status          text not null default 'draft' check (status in ('draft', 'published')),
  publish_at      timestamptz not null default now(),
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Portfolio projects
-- -----------------------------------------------------------------------------
create table if not exists public.projects (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  category        text not null default 'hospitality_operations' check (category in (
                    'hospitality_operations', 'beverage_programs', 'coffee_concepts',
                    'bar_cocktail', 'brand_collaborations', 'openings',
                    'training_workshops', 'events_trade')),
  client_name     text,
  location        text,
  year            text,
  summary         text,
  brief           text,
  role            text,
  work_done       text,
  outcome         text,
  highlights      text[] not null default '{}',
  service_slugs   text[] not null default '{}',  -- links to services.slug
  cover_image     text,
  cover_video     text,
  before_image    text,
  after_image     text,
  featured        boolean not null default false,
  seo_title       text,
  seo_description text,
  og_image        text,
  status          text not null default 'draft' check (status in ('draft', 'published')),
  publish_at      timestamptz not null default now(),
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Drinks & beverage concepts
-- -----------------------------------------------------------------------------
create table if not exists public.drinks (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  category        text not null default 'signature' check (category in (
                    'coffee', 'cocktail', 'non_alcoholic', 'signature', 'seasonal', 'brand_collaboration',
                    'coffee_shop', 'bar')),
  concept         text,
  context         text,
  venue_brand     text,
  role            text,
  image           text,
  video_url       text,
  featured        boolean not null default false,
  seo_title       text,
  seo_description text,
  og_image        text,
  status          text not null default 'draft' check (status in ('draft', 'published')),
  publish_at      timestamptz not null default now(),
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Training programs, workshops & masterclasses
-- -----------------------------------------------------------------------------
create table if not exists public.programs (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  kind              text not null default 'workshop' check (kind in ('training', 'workshop', 'masterclass', 'corporate')),
  title             text not null,
  topic             text,
  summary           text,
  description       text,
  learning_outcomes text[] not null default '{}',
  format            text,
  duration          text,
  trainer           text default 'Anthony Haydar',
  venue             text,
  city              text,
  start_at          timestamptz,
  end_at            timestamptz,
  capacity          int,
  price_label       text,                -- leave empty to hide prices
  event_status      text check (event_status in ('upcoming', 'registration_open', 'sold_out', 'completed')),
  booking_url       text,                -- optional external booking link
  cover_image       text,
  featured          boolean not null default false,
  seo_title         text,
  seo_description   text,
  og_image          text,
  status            text not null default 'draft' check (status in ('draft', 'published')),
  publish_at        timestamptz not null default now(),
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Events (incl. HORECA / trade-event landing pages)
-- -----------------------------------------------------------------------------
create table if not exists public.events (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             text not null,
  event_type        text not null default 'industry_event' check (event_type in (
                      'trade_show', 'industry_event', 'pop_up', 'competition', 'talk', 'other')),
  event_status      text not null default 'upcoming' check (event_status in (
                      'upcoming', 'registration_open', 'sold_out', 'completed')),
  start_at          timestamptz,
  end_at            timestamptz,
  venue             text,
  city              text,
  country           text,
  summary           text,
  description       text,
  cover_image       text,
  cover_video       text,
  is_landing        boolean not null default false,  -- enables the QR landing-page layout
  booth             text,
  schedule          jsonb not null default '[]'::jsonb, -- [{time, title, detail}]
  meeting_cta_label text default 'Book a Meeting',
  external_url      text,
  featured          boolean not null default false,
  seo_title         text,
  seo_description   text,
  og_image          text,
  status            text not null default 'draft' check (status in ('draft', 'published')),
  publish_at        timestamptz not null default now(),
  sort_order        int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Testimonials & partners / brands
-- -----------------------------------------------------------------------------
create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  quote        text not null,
  author_name  text not null,
  author_role  text,
  company      text,
  avatar       text,
  featured     boolean not null default true,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  publish_at   timestamptz not null default now(),
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.partners (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  kind         text not null default 'client' check (kind in ('client', 'partner', 'sponsor')),
  logo         text,
  website_url  text,
  show_on_home boolean not null default true,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  publish_at   timestamptz not null default now(),
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Experience timeline & credentials
-- -----------------------------------------------------------------------------
create table if not exists public.experience (
  id           uuid primary key default gen_random_uuid(),
  kind         text not null default 'role' check (kind in ('role', 'certification', 'milestone')),
  title        text not null,
  organization text,
  location     text,
  start_label  text,
  end_label    text,
  description  text,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  publish_at   timestamptz not null default now(),
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Media library (photos & videos)
-- -----------------------------------------------------------------------------
create table if not exists public.media_items (
  id           uuid primary key default gen_random_uuid(),
  type         text not null default 'photo' check (type in ('photo', 'video')),
  title        text,
  caption      text,
  alt_text     text,
  credit       text,
  category     text,                     -- e.g. behind-the-scenes, training, events, drinks, press
  tags         text[] not null default '{}',
  url          text,                     -- image URL, or self-hosted video file URL
  video_url    text,                     -- YouTube / Vimeo / Instagram link (alternative to url)
  poster_url   text,                     -- video thumbnail
  mobile_url   text,                     -- optional mobile crop
  orientation  text not null default 'landscape' check (orientation in ('landscape', 'portrait', 'square')),
  featured     boolean not null default false,
  project_id   uuid references public.projects (id) on delete set null,
  drink_id     uuid references public.drinks (id) on delete set null,
  event_id     uuid references public.events (id) on delete set null,
  program_id   uuid references public.programs (id) on delete set null,
  status       text not null default 'draft' check (status in ('draft', 'published')),
  publish_at   timestamptz not null default now(),
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Advertising / sponsor banners
-- -----------------------------------------------------------------------------
create table if not exists public.banners (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,         -- internal name
  sponsor_name    text,
  placement       text not null check (placement in (
                    'top_bar', 'home_horizontal', 'mid_content', 'event_sponsor', 'footer_partner')),
  message         text,                  -- text for the top bar / text-only banners
  cta_label       text,
  desktop_image   text,
  mobile_image    text,
  alt_text        text,
  destination_url text,
  open_in_new_tab boolean not null default true,
  utm_source      text,
  utm_medium      text,
  utm_campaign    text,
  target_pages    text[] not null default '{}',  -- mid_content: consultancy, portfolio, training-events, media (empty = all)
  event_id        uuid references public.events (id) on delete cascade,  -- event_sponsor: limit to one event
  is_active       boolean not null default false,
  starts_at       timestamptz,
  ends_at         timestamptz,
  sort_order      int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  check (ends_at is null or starts_at is null or ends_at > starts_at)
);

create table if not exists public.banner_clicks (
  id         bigint generated always as identity primary key,
  banner_id  uuid not null references public.banners (id) on delete cascade,
  page       text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Leads / enquiries (written by the server only, after spam checks)
-- -----------------------------------------------------------------------------
create table if not exists public.leads (
  id               uuid primary key default gen_random_uuid(),
  lead_type        text not null default 'consultation' check (lead_type in (
                     'consultation', 'training', 'workshop', 'partnership',
                     'event_invite', 'trade_meeting', 'general')),
  name             text not null,
  company          text,
  job_title        text,
  email            text not null,
  phone            text,
  country          text,
  business_type    text check (business_type in (
                     'hotel', 'restaurant', 'cafe', 'bar', 'resort', 'beverage_brand',
                     'distributor', 'hospitality_group', 'other')),
  service_interest text,
  message          text,
  source_page      text,
  event_id         uuid references public.events (id) on delete set null,
  program_id       uuid references public.programs (id) on delete set null,
  consent          boolean not null default false,
  consent_at       timestamptz,
  status           text not null default 'new' check (status in (
                     'new', 'contacted', 'qualified', 'won', 'lost', 'archived')),
  notes            text,
  ip_hash          text,
  user_agent       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'site_settings', 'pages', 'content_blocks', 'services', 'projects', 'drinks',
    'programs', 'events', 'testimonials', 'partners', 'experience', 'media_items',
    'banners', 'leads'
  ]
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function private.set_updated_at()', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------
create index if not exists services_public_idx     on public.services (status, publish_at, sort_order);
create index if not exists projects_public_idx     on public.projects (status, publish_at, sort_order);
create index if not exists projects_category_idx   on public.projects (category);
create index if not exists drinks_public_idx       on public.drinks (status, publish_at, sort_order);
create index if not exists drinks_category_idx     on public.drinks (category);
create index if not exists programs_public_idx     on public.programs (status, publish_at, start_at);
create index if not exists events_public_idx       on public.events (status, publish_at, start_at);
create index if not exists testimonials_public_idx on public.testimonials (status, publish_at, sort_order);
create index if not exists partners_public_idx     on public.partners (status, publish_at, sort_order);
create index if not exists experience_public_idx   on public.experience (status, sort_order);
create index if not exists media_public_idx        on public.media_items (status, publish_at, type, sort_order);
create index if not exists media_project_idx       on public.media_items (project_id) where project_id is not null;
create index if not exists media_drink_idx         on public.media_items (drink_id) where drink_id is not null;
create index if not exists media_event_idx         on public.media_items (event_id) where event_id is not null;
create index if not exists media_program_idx       on public.media_items (program_id) where program_id is not null;
create index if not exists banners_placement_idx   on public.banners (placement, is_active);
create index if not exists banners_event_idx       on public.banners (event_id) where event_id is not null;
create index if not exists banner_clicks_idx       on public.banner_clicks (banner_id, created_at desc);
create index if not exists leads_created_idx       on public.leads (created_at desc);
create index if not exists leads_status_idx        on public.leads (status);
create index if not exists leads_ip_idx            on public.leads (ip_hash, created_at desc);
create index if not exists leads_event_idx         on public.leads (event_id) where event_id is not null;
create index if not exists leads_program_idx       on public.leads (program_id) where program_id is not null;

-- -----------------------------------------------------------------------------
-- Browser push notifications: one row per admin device that enabled them
-- -----------------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  endpoint     text not null unique,   -- the browser's push address
  p256dh       text not null,          -- browser encryption keys
  auth         text not null,
  user_agent   text,                   -- helps identify the device
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists push_subscriptions_user_idx on public.push_subscriptions (user_id);

-- -----------------------------------------------------------------------------
-- Rate limiting (admin login, enquiry form, banner clicks)
-- Counters live in the PRIVATE schema (not reachable through the Data API).
-- -----------------------------------------------------------------------------
create table if not exists private.rate_limits (
  key          text        not null,  -- e.g. "login:ip:<hash>" (IPs/emails are hashed by the app)
  window_start timestamptz not null,
  count        int         not null default 0,
  primary key (key, window_start)
);

create index if not exists rate_limits_window_idx on private.rate_limits (window_start);

-- rate_limit(key, limit, window_seconds, increment)
--   increment = true  -> count this attempt, then report whether it is allowed
--   increment = false -> only report whether the next attempt would be allowed
-- Check and count happen in ONE statement, so parallel requests can't slip through.
-- In the public schema so the server can call it via RPC; EXECUTE is granted to
-- service_role only (see 02_security.sql). SECURITY DEFINER lets it write the private table.
create or replace function public.rate_limit(
  p_key            text,
  p_limit          int,
  p_window_seconds int,
  p_increment      boolean default true
)
returns table (allowed boolean, current_count int, reset_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  v_count  int;
begin
  if p_key is null or p_limit < 1 or p_window_seconds < 1 then
    raise exception 'invalid rate limit arguments';
  end if;

  if p_increment then
    insert into private.rate_limits as r (key, window_start, count)
    values (p_key, v_window, 1)
    on conflict (key, window_start) do update set count = r.count + 1
    returning r.count into v_count;
  else
    select r.count into v_count
    from private.rate_limits r
    where r.key = p_key and r.window_start = v_window;
    v_count := coalesce(v_count, 0);
  end if;

  -- Housekeeping: occasionally delete old windows (keeps the table tiny).
  if random() < 0.02 then
    delete from private.rate_limits where window_start < now() - interval '1 day';
  end if;

  return query select
    case when p_increment then v_count <= p_limit else v_count < p_limit end,
    v_count,
    v_window + make_interval(secs => p_window_seconds);
end;
$$;
