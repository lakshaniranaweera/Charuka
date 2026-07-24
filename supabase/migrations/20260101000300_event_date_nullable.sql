-- ============================================================================
-- Allow event_date to be NULL. Events without a date are treated as "Pending".
-- (Safe to run on an existing database that had event_date NOT NULL.)
-- ============================================================================
alter table public.events
  alter column event_date drop not null;
