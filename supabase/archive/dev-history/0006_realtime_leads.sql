-- =============================================================================
-- Anthony Haydar Website - 0006 Live enquiries in the admin (Realtime)
-- Run after 0005 (safe to re-run).
--
-- Adds the leads table to Supabase Realtime ("Postgres Changes"), so the open
-- admin pages are told instantly when an enquiry is created, updated or deleted.
-- Realtime applies the table's RLS policies: only admins receive these events.
-- =============================================================================

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'leads'
  ) then
    alter publication supabase_realtime add table public.leads;
  end if;
end;
$$;
