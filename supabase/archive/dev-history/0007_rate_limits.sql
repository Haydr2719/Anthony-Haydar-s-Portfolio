-- =============================================================================
-- Anthony Haydar Website - 0007 Rate limiting (login, enquiry form, banner clicks)
-- Run after 0006 (safe to re-run).
--
-- Counters live in the PRIVATE schema (not reachable through the Data API).
-- The check-and-count happens in ONE statement, so simultaneous requests
-- cannot slip past the limit. Only the Next.js server (secret / service-role
-- key) may call the function - visitors and admins cannot.
-- =============================================================================

create table if not exists private.rate_limits (
  key          text        not null,  -- e.g. "login:ip:<hash>" (IPs/emails are hashed by the app)
  window_start timestamptz not null,
  count        int         not null default 0,
  primary key (key, window_start)
);

create index if not exists rate_limits_window_idx on private.rate_limits (window_start);

-- Belt and braces: even though the schema is private, keep RLS on with no policies.
alter table private.rate_limits enable row level security;

-- -----------------------------------------------------------------------------
-- rate_limit(key, limit, window_seconds, increment)
--   increment = true  -> count this attempt, then report whether it is allowed
--   increment = false -> only report whether the next attempt would be allowed
-- Returns: allowed, current count, and when the window resets.
--
-- In the public schema so the server can call it via RPC, but EXECUTE is granted
-- to service_role only. SECURITY DEFINER lets it write the private table.
-- -----------------------------------------------------------------------------
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

revoke all on function public.rate_limit(text, int, int, boolean) from public, anon, authenticated;
grant execute on function public.rate_limit(text, int, int, boolean) to service_role;
