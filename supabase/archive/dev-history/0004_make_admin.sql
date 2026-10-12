-- =============================================================================
-- Anthony Haydar Website - 0004 Grant admin access
-- 1. Supabase -> Authentication -> Users -> "Add user" (email + password,
--    tick "Auto confirm user").
-- 2. Replace the email below and run this script. Repeat for each admin
--    (e.g. Anthony and Sarah).
-- =============================================================================

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where email = 'joesdevelopments@gmail.com'
on conflict (user_id) do nothing;

-- Check who is an admin:
select * from public.admin_users;
