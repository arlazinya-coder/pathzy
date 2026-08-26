begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'employment-documents',
  'employment-documents',
  false,
  8388608,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain'
  ]
)
on conflict (id) do update
set
  public = false,
  file_size_limit = 8388608,
  allowed_mime_types = array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain'
  ];

do $$
begin
  if to_regclass('public.user_documents') is not null then
    execute 'alter table public.user_documents drop constraint if exists user_documents_document_type_check';
    execute $constraint$
      alter table public.user_documents
      add constraint user_documents_document_type_check
      check (
        document_type in (
          'cv',
          'cover_letter',
          'linkedin_profile',
          'recruiter_message',
          'follow_up_email',
          'thank_you_email',
          'career_passport',
          'application_email',
          'linkedin_message',
          'uploaded_document',
          'supporting_document',
          'old_cv',
          'certificate',
          'diploma',
          'transcript',
          'licence',
          'reference',
          'portfolio_file',
          'id_work_document'
        )
      )
    $constraint$;
    execute $index$
      create index if not exists user_documents_user_vault_category_idx
      on public.user_documents (user_id, ((content_json ->> 'vault_category')), updated_at desc)
      where document_type in (
        'cv',
        'cover_letter',
        'old_cv',
        'uploaded_document',
        'supporting_document',
        'certificate',
        'diploma',
        'transcript',
        'licence',
        'reference',
        'portfolio_file',
        'id_work_document'
      )
    $index$;
  end if;
end
$$;

drop policy if exists "Users can read own employment documents" on storage.objects;
drop policy if exists "Users can upload own employment documents" on storage.objects;
drop policy if exists "Users can update own employment documents" on storage.objects;
drop policy if exists "Users can delete own employment documents" on storage.objects;

create policy "Users can read own employment documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can upload own employment documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update own employment documents"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own employment documents"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'employment-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

commit;

select
  'employment_document_bucket' as check_name,
  case when exists (
    select 1
    from storage.buckets
    where id = 'employment-documents'
      and public = false
      and file_size_limit = 8388608
      and allowed_mime_types @> array[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'text/plain'
      ]
  ) then 'PASS' else 'FAIL' end as status;

select
  'employment_document_user_documents_contract' as check_name,
  case when exists (
    select 1
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'user_documents'
      and c.conname = 'user_documents_document_type_check'
      and pg_get_constraintdef(c.oid) like '%licence%'
      and pg_get_constraintdef(c.oid) like '%portfolio_file%'
  ) then 'PASS' else 'FAIL' end as status;

select
  'employment_document_vault_category_index' as check_name,
  case when exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'user_documents'
      and indexname = 'user_documents_user_vault_category_idx'
  ) then 'PASS' else 'FAIL' end as status;

select
  'employment_document_storage_policies' as check_name,
  count(*) as policies_found,
  case when count(*) = 4 then 'PASS' else 'FAIL' end as status
from pg_policies
where schemaname = 'storage'
  and tablename = 'objects'
  and policyname in (
    'Users can read own employment documents',
    'Users can upload own employment documents',
    'Users can update own employment documents',
    'Users can delete own employment documents'
  );
