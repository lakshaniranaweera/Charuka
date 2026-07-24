-- ============================================================================
-- Activation Planner — Initial schema
-- ============================================================================
-- Enable required extensions
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- events
-- ----------------------------------------------------------------------------
create table if not exists public.events (
  id                 uuid primary key default gen_random_uuid(),
  event_date         date,
  event_name         text not null check (char_length(event_name) between 1 and 200),
  cost               numeric(14, 2) not null default 0 check (cost >= 0),
  previsit_date      date,
  production_date    date,
  setup_date         date,
  location           text check (char_length(location) <= 200),
  activation_manager text check (char_length(activation_manager) <= 120),
  remarks            text check (char_length(remarks) <= 2000),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

comment on table public.events is 'Activation events. Records are retained permanently; never auto-deleted.';

-- Indexes for common query patterns (sort, search, date filtering)
create index if not exists events_event_date_idx        on public.events (event_date desc);
create index if not exists events_created_at_idx         on public.events (created_at desc);
create index if not exists events_activation_manager_idx on public.events (activation_manager);
create index if not exists events_location_idx           on public.events (location);
-- Trigram-style full-text search on event name
create index if not exists events_event_name_idx         on public.events using gin (to_tsvector('simple', event_name));

-- ----------------------------------------------------------------------------
-- dashboard_settings — branding / theme (single row, id = 1)
-- ----------------------------------------------------------------------------
create table if not exists public.dashboard_settings (
  id                 int primary key default 1 check (id = 1),
  title              text not null default 'Activation Planner',
  background_url     text,
  logo_url           text,
  theme              text not null default 'system' check (theme in ('light', 'dark', 'system')),
  primary_color      text not null default '221 83% 53%',
  accent_color       text not null default '262 83% 58%',
  updated_at         timestamptz not null default now()
);

insert into public.dashboard_settings (id) values (1)
on conflict (id) do nothing;

-- ----------------------------------------------------------------------------
-- updated_at trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists events_set_updated_at on public.events;
create trigger events_set_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

drop trigger if exists settings_set_updated_at on public.dashboard_settings;
create trigger settings_set_updated_at
  before update on public.dashboard_settings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Realtime
-- ----------------------------------------------------------------------------
alter publication supabase_realtime add table public.events;
alter publication supabase_realtime add table public.dashboard_settings;


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


-- ============================================================================
-- Storage buckets for branding assets (background image + logo)
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('branding', 'branding', true)
on conflict (id) do nothing;

-- Public read of branding assets
drop policy if exists "branding_public_read" on storage.objects;
create policy "branding_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'branding');

-- Only authenticated admins can upload / update / delete branding
drop policy if exists "branding_auth_insert" on storage.objects;
create policy "branding_auth_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'branding');

drop policy if exists "branding_auth_update" on storage.objects;
create policy "branding_auth_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'branding')
  with check (bucket_id = 'branding');

drop policy if exists "branding_auth_delete" on storage.objects;
create policy "branding_auth_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'branding');


-- ============================================================================
-- Allow event_date to be NULL. Events without a date are treated as "Pending".
-- (Safe to run on an existing database that had event_date NOT NULL.)
-- ============================================================================
alter table public.events
  alter column event_date drop not null;


-- Optional sample data
-- ============================================================================
-- Seed data (optional) — sample activation events for local development
-- ============================================================================
insert into public.events
  (event_date, event_name, cost, previsit_date, production_date, setup_date, location, activation_manager, remarks)
values
  ('2026-07-23', 'Downtown Product Launch', 12500.00, '2026-07-10', '2026-07-18', '2026-07-22', 'Colombo City Center', 'Nadia Perera', 'VIP guest list confirmed'),
  ('2026-07-30', 'Summer Brand Roadshow', 8200.50, '2026-07-15', '2026-07-25', '2026-07-29', 'Kandy Arena', 'Ravi Fernando', 'Awaiting stage vendor'),
  ('2026-08-12', 'Retail Pop-up Activation', 4300.00, '2026-08-01', '2026-08-08', '2026-08-11', 'Galle Fort', 'Sanduni Silva', NULL),
  ('2026-06-05', 'Corporate Gala Night', 21000.00, '2026-05-20', '2026-05-30', '2026-06-04', 'Grand Ballroom', 'Nadia Perera', 'Completed successfully'),
  ('2026-09-01', 'University Tech Expo', 6700.00, '2026-08-18', '2026-08-27', '2026-08-31', 'Peradeniya Campus', 'Ravi Fernando', 'Sponsor booths x12')
on conflict do nothing;
