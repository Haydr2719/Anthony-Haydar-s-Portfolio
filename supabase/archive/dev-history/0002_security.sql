-- =============================================================================
-- Anthony Haydar Website - 0002 Row Level Security, grants & storage
-- Run after 0001_schema.sql (safe to re-run).
--
-- Access model
--   * Visitors (anon) can READ published content whose publish_at has passed,
--     and active banners inside their date window. Nothing else.
--   * Admins (rows in public.admin_users) can read and write everything.
--   * Leads and banner clicks are INSERTED by the Next.js server using the
--     secret/service-role key (which bypasses RLS) after spam checks, so the
--     public cannot write to the database directly.
-- =============================================================================

-- Helper functions live in the private schema; roles need usage to evaluate policies.
grant usage on schema private to anon, authenticated;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated;

-- -----------------------------------------------------------------------------
-- Enable RLS everywhere
-- -----------------------------------------------------------------------------
alter table public.admin_users    enable row level security;
alter table public.site_settings  enable row level security;
alter table public.pages          enable row level security;
alter table public.content_blocks enable row level security;
alter table public.services       enable row level security;
alter table public.projects       enable row level security;
alter table public.drinks         enable row level security;
alter table public.programs       enable row level security;
alter table public.events         enable row level security;
alter table public.testimonials   enable row level security;
alter table public.partners       enable row level security;
alter table public.experience     enable row level security;
alter table public.media_items    enable row level security;
alter table public.banners        enable row level security;
alter table public.banner_clicks  enable row level security;
alter table public.leads          enable row level security;

-- -----------------------------------------------------------------------------
-- Table privileges (Data API exposure). RLS still filters the rows.
-- -----------------------------------------------------------------------------
revoke all on all tables in schema public from anon;

grant select on
  public.site_settings, public.pages, public.content_blocks, public.services,
  public.projects, public.drinks, public.programs, public.events,
  public.testimonials, public.partners, public.experience, public.media_items,
  public.banners
to anon, authenticated;

grant insert, update, delete on
  public.site_settings, public.pages, public.content_blocks, public.services,
  public.projects, public.drinks, public.programs, public.events,
  public.testimonials, public.partners, public.experience, public.media_items,
  public.banners
to authenticated;

grant select, update, delete on public.leads to authenticated;
grant select on public.banner_clicks to authenticated;
grant select on public.admin_users to authenticated;

-- -----------------------------------------------------------------------------
-- Publishable content: public reads published rows, admins manage everything
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array[
    'services', 'projects', 'drinks', 'programs', 'events',
    'testimonials', 'partners', 'experience', 'media_items'
  ]
  loop
    execute format('drop policy if exists "Public reads published" on public.%I', t);
    execute format(
      'create policy "Public reads published" on public.%I for select to anon, authenticated
         using (status = ''published'' and publish_at <= now())', t);

    execute format('drop policy if exists "Admins read all" on public.%I', t);
    execute format(
      'create policy "Admins read all" on public.%I for select to authenticated
         using ((select private.is_admin()))', t);

    execute format('drop policy if exists "Admins insert" on public.%I', t);
    execute format(
      'create policy "Admins insert" on public.%I for insert to authenticated
         with check ((select private.is_admin()))', t);

    execute format('drop policy if exists "Admins update" on public.%I', t);
    execute format(
      'create policy "Admins update" on public.%I for update to authenticated
         using ((select private.is_admin())) with check ((select private.is_admin()))', t);

    execute format('drop policy if exists "Admins delete" on public.%I', t);
    execute format(
      'create policy "Admins delete" on public.%I for delete to authenticated
         using ((select private.is_admin()))', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Always-public tables (settings, page SEO, text blocks): public read, admin write
-- -----------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['site_settings', 'pages', 'content_blocks']
  loop
    execute format('drop policy if exists "Public reads" on public.%I', t);
    execute format(
      'create policy "Public reads" on public.%I for select to anon, authenticated using (true)', t);

    execute format('drop policy if exists "Admins insert" on public.%I', t);
    execute format(
      'create policy "Admins insert" on public.%I for insert to authenticated
         with check ((select private.is_admin()))', t);

    execute format('drop policy if exists "Admins update" on public.%I', t);
    execute format(
      'create policy "Admins update" on public.%I for update to authenticated
         using ((select private.is_admin())) with check ((select private.is_admin()))', t);

    execute format('drop policy if exists "Admins delete" on public.%I', t);
    execute format(
      'create policy "Admins delete" on public.%I for delete to authenticated
         using ((select private.is_admin()))', t);
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Banners: public sees only active banners inside their date window
-- -----------------------------------------------------------------------------
drop policy if exists "Public reads live banners" on public.banners;
create policy "Public reads live banners" on public.banners for select to anon, authenticated
  using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at   is null or ends_at   >  now())
  );

drop policy if exists "Admins read all" on public.banners;
create policy "Admins read all" on public.banners for select to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins insert" on public.banners;
create policy "Admins insert" on public.banners for insert to authenticated
  with check ((select private.is_admin()));

drop policy if exists "Admins update" on public.banners;
create policy "Admins update" on public.banners for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admins delete" on public.banners;
create policy "Admins delete" on public.banners for delete to authenticated
  using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Leads & banner clicks: admins only (server inserts with the secret key)
-- -----------------------------------------------------------------------------
drop policy if exists "Admins read leads" on public.leads;
create policy "Admins read leads" on public.leads for select to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins update leads" on public.leads;
create policy "Admins update leads" on public.leads for update to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

drop policy if exists "Admins delete leads" on public.leads;
create policy "Admins delete leads" on public.leads for delete to authenticated
  using ((select private.is_admin()));

drop policy if exists "Admins read clicks" on public.banner_clicks;
create policy "Admins read clicks" on public.banner_clicks for select to authenticated
  using ((select private.is_admin()));

-- Admins can see who the other admins are (adding admins is done in SQL, see README).
drop policy if exists "Admins read admins" on public.admin_users;
create policy "Admins read admins" on public.admin_users for select to authenticated
  using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Storage: public "media" bucket. Anyone can view files by URL; only admins upload.
-- 50 MB per file (Supabase free-plan limit). Raise it on paid plans if needed.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml',
        'video/mp4', 'video/webm', 'video/quicktime', 'application/pdf']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins read media" on storage.objects;
create policy "Admins read media" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));

drop policy if exists "Admins upload media" on storage.objects;
create policy "Admins upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and (select private.is_admin()));

drop policy if exists "Admins update media" on storage.objects;
create policy "Admins update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and (select private.is_admin()))
  with check (bucket_id = 'media' and (select private.is_admin()));

drop policy if exists "Admins delete media" on storage.objects;
create policy "Admins delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and (select private.is_admin()));
