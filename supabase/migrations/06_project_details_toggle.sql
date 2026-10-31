-- =============================================================================
-- Anthony Haydar Website - 06 "Show project detail pages" setting
-- Run on EXISTING databases (development and production) BEFORE deploying the
-- code that uses it. Safe to re-run. (New databases get it from 01_schema.sql.)
--
-- Adds an on/off switch in Admin -> Settings -> Portfolio. Off (default): client
-- project cards are shown but not clickable and the detail pages redirect to the
-- Projects list. On: the detail pages are public.
-- =============================================================================

alter table public.site_settings
  add column if not exists show_project_details boolean not null default false;

-- Check: should return one row with show_project_details = false.
select id, show_project_details from public.site_settings;
