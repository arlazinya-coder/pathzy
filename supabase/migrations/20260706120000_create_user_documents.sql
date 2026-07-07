begin;

create extension if not exists pgcrypto;

create table if not exists public.user_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_type text not null,
  document_title text not null,
  template_name text,
  content_json jsonb not null default '{}'::jsonb,
  content_text text,
  file_url text,
  status text not null default 'draft',
  version_number integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_downloaded_at timestamptz,
  constraint user_documents_status_check
    check (status in ('draft', 'ready', 'downloaded', 'archived')),
  constraint user_documents_document_type_check
    check (
      document_type in (
        'cv',
        'cover_letter',
        'linkedin_profile',
        'recruiter_message',
        'follow_up_email',
        'thank_you_email',
        'career_passport',
        'uploaded_document',
        'supporting_document',
        'old_cv',
        'certificate',
        'diploma',
        'transcript',
        'reference',
        'portfolio_file',
        'id_work_document'
      )
    )
);

alter table public.user_documents
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table public.user_documents
  add column if not exists document_type text;

alter table public.user_documents
  add column if not exists document_title text;

alter table public.user_documents
  add column if not exists template_name text;

alter table public.user_documents
  add column if not exists content_json jsonb default '{}'::jsonb;

alter table public.user_documents
  add column if not exists content_text text;

alter table public.user_documents
  add column if not exists file_url text;

alter table public.user_documents
  add column if not exists status text default 'draft';

alter table public.user_documents
  add column if not exists version_number integer default 1;

alter table public.user_documents
  add column if not exists created_at timestamptz default now();

alter table public.user_documents
  add column if not exists updated_at timestamptz default now();

alter table public.user_documents
  add column if not exists last_downloaded_at timestamptz;

alter table public.user_documents
  alter column content_json set default '{}'::jsonb;

alter table public.user_documents
  alter column status set default 'draft';

alter table public.user_documents
  alter column version_number set default 1;

alter table public.user_documents
  alter column created_at set default now();

alter table public.user_documents
  alter column updated_at set default now();

create index if not exists user_documents_user_type_idx
  on public.user_documents (user_id, document_type, updated_at desc);

create index if not exists user_documents_user_status_idx
  on public.user_documents (user_id, status, updated_at desc);

create index if not exists user_documents_user_created_idx
  on public.user_documents (user_id, created_at desc);

create or replace function public.set_user_documents_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_documents_updated_at on public.user_documents;

create trigger set_user_documents_updated_at
before update on public.user_documents
for each row
execute function public.set_user_documents_updated_at();

alter table public.user_documents enable row level security;

drop policy if exists "Users can select their own documents" on public.user_documents;
drop policy if exists "Users can insert their own documents" on public.user_documents;
drop policy if exists "Users can update their own documents" on public.user_documents;
drop policy if exists "Users can delete their own documents" on public.user_documents;

create policy "Users can select their own documents"
on public.user_documents
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own documents"
on public.user_documents
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own documents"
on public.user_documents
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own documents"
on public.user_documents
for delete
to authenticated
using (auth.uid() = user_id);

commit;
