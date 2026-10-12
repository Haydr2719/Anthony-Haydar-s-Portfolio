-- =============================================================================
-- Anthony Haydar Website - 0005 Browser push notifications for new enquiries
-- Run after 0004 (safe to re-run).
--
-- One row per device/browser on which an admin clicked "Enable notifications".
-- Admins manage only their own devices. The server reads all rows with the
-- secret key when an enquiry arrives, and removes devices that have expired.
-- =============================================================================

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

alter table public.push_subscriptions enable row level security;

revoke all on public.push_subscriptions from anon;
grant select, insert, update, delete on public.push_subscriptions to authenticated;

drop policy if exists "Admins read own devices" on public.push_subscriptions;
create policy "Admins read own devices" on public.push_subscriptions for select to authenticated
  using ((select private.is_admin()) and user_id = (select auth.uid()));

drop policy if exists "Admins add own devices" on public.push_subscriptions;
create policy "Admins add own devices" on public.push_subscriptions for insert to authenticated
  with check ((select private.is_admin()) and user_id = (select auth.uid()));

drop policy if exists "Admins update own devices" on public.push_subscriptions;
create policy "Admins update own devices" on public.push_subscriptions for update to authenticated
  using ((select private.is_admin()) and user_id = (select auth.uid()))
  with check ((select private.is_admin()) and user_id = (select auth.uid()));

drop policy if exists "Admins remove own devices" on public.push_subscriptions;
create policy "Admins remove own devices" on public.push_subscriptions for delete to authenticated
  using ((select private.is_admin()) and user_id = (select auth.uid()));
