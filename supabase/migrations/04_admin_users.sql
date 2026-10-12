-- =============================================================================
-- Anthony Haydar Website - 04 Admin users
-- STEP 4 of 4. Run after 03_content.sql. Safe to re-run.
--
-- BEFORE running:
--   1. Supabase -> Authentication -> Users -> "Add user" for each admin
--      (email + strong password, tick "Auto confirm user").
--   2. Make sure every admin's email is in the list below (add or remove lines).
--
-- Only people in admin_users can sign in to /admin and edit content.
-- =============================================================================

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) in (
  'joesdevelopments@gmail.com',
  'anthony.h2719@gmail.com'      -- Anthony (confirm this is the email he signs in with)
)
on conflict (user_id) do nothing;

-- Check: every admin should appear here. A missing email means its user hasn't
-- been created in Authentication -> Users yet (create it, then run this again).
select a.email, a.created_at
from public.admin_users a
order by a.created_at;
