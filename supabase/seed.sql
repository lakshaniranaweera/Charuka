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
