-- Professional Photo storage setup.
-- Safe to rerun: the bucket is upserted and only the exact PATHZY photo policies below are replaced.
-- Rollback, if ever needed for development only: remove these four policies and the empty
-- professional-photos bucket after confirming no user-owned photo objects need to be preserved.

begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'professional-photos',
  'professional-photos',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

drop policy if exists "Users can read own professional photos" on storage.objects;
drop policy if exists "Users can upload own professional photos" on storage.objects;
drop policy if exists "Users can update own professional photos" on storage.objects;
drop policy if exists "Users can delete own professional photos" on storage.objects;

create policy "Users can read own professional photos"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can upload own professional photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own professional photos"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own professional photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'professional-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;

select
  'professional_photo_bucket' as check_name,
  case when exists (
    select 1
    from storage.buckets
    where id = 'professional-photos'
      and name = 'professional-photos'
      and public = false
      and file_size_limit = 5242880
      and allowed_mime_types @> array['image/jpeg', 'image/png', 'image/webp']
  ) then 'PASS' else 'FAIL' end as status;

select
  'professional_photo_storage_policies' as check_name,
  count(*) as matching_policy_count,
  case when count(*) = 4 then 'PASS' else 'FAIL' end as status
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in (
    'Users can read own professional photos',
    'Users can upload own professional photos',
    'Users can update own professional photos',
    'Users can delete own professional photos'
  );
