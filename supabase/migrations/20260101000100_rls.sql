-- ============================================================================
-- Row Level Security policies
-- ============================================================================
-- Model:
--   * Public (anon) users may READ events + settings (read-only dashboard).
--   * Only authenticated users (admins) may INSERT / UPDATE / DELETE.
-- ============================================================================

alter table public.events            enable row level security;
alter table public.dashboard_settings enable row level security;

-- ---- events ---------------------------------------------------------------
drop policy if exists "events_select_public"      on public.events;
drop policy if exists "events_insert_auth"        on public.events;
drop policy if exists "events_update_auth"        on public.events;
drop policy if exists "events_delete_auth"        on public.events;

create policy "events_select_public"
  on public.events for select
  to anon, authenticated
  using (true);

create policy "events_insert_auth"
  on public.events for insert
  to authenticated
  with check (true);

create policy "events_update_auth"
  on public.events for update
  to authenticated
  using (true)
  with check (true);

create policy "events_delete_auth"
  on public.events for delete
  to authenticated
  using (true);

-- ---- dashboard_settings ---------------------------------------------------
drop policy if exists "settings_select_public" on public.dashboard_settings;
drop policy if exists "settings_update_auth"   on public.dashboard_settings;

create policy "settings_select_public"
  on public.dashboard_settings for select
  to anon, authenticated
  using (true);

create policy "settings_update_auth"
  on public.dashboard_settings for update
  to authenticated
  using (true)
  with check (true);
