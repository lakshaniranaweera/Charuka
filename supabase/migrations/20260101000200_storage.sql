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
