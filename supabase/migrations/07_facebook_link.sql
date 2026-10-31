-- =============================================================================
-- Anthony Haydar Website - 07 Facebook link
-- Run on EXISTING databases (development and production) BEFORE deploying the
-- code that uses it. Safe to re-run. (New databases get it from 01_schema.sql.)
--
-- Adds Admin -> Settings -> Social links -> Facebook. When filled in, a Facebook
-- icon appears with the other social icons (footer, Contact page).
-- =============================================================================

alter table public.site_settings
  add column if not exists facebook_url text;

-- Check: should return one row with facebook_url = null (empty).
select id, facebook_url from public.site_settings;
