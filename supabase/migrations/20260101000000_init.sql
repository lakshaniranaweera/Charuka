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
  event_date         date not null,
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
