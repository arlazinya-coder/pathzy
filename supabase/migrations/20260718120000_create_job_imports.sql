begin;

create extension if not exists pgcrypto;

create table if not exists public.job_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source_type text not null,
  source_label text,
  source_url text,
  source_document_id uuid references public.user_documents(id) on delete set null,
  opportunity_id text,
  status text not null default 'review_required',
  language text not null default 'unknown',
  raw_text text,
  normalized_text text,
  preliminary_details_json jsonb not null default '{}'::jsonb,
  inspection_json jsonb not null default '{}'::jsonb,
  warnings_json jsonb not null default '[]'::jsonb,
  missing_fields_json jsonb not null default '[]'::jsonb,
  user_corrections_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint job_imports_source_type_check
    check (source_type in ('pasted_text', 'manual_entry', 'uploaded_document', 'public_url', 'existing_opportunity')),
  constraint job_imports_status_check
    check (status in ('processing', 'review_required', 'ready', 'ocr_required', 'failed')),
  constraint job_imports_language_check
    check (language in ('en', 'fr', 'unknown'))
);

alter table public.job_imports
  add column if not exists source_type text;

alter table public.job_imports
  add column if not exists source_label text;

alter table public.job_imports
  add column if not exists source_url text;

alter table public.job_imports
  add column if not exists source_document_id uuid references public.user_documents(id) on delete set null;

alter table public.job_imports
  add column if not exists opportunity_id text;

alter table public.job_imports
  add column if not exists status text default 'review_required';

alter table public.job_imports
  add column if not exists language text default 'unknown';

alter table public.job_imports
  add column if not exists raw_text text;

alter table public.job_imports
  add column if not exists normalized_text text;

alter table public.job_imports
  add column if not exists preliminary_details_json jsonb default '{}'::jsonb;

alter table public.job_imports
  add column if not exists inspection_json jsonb default '{}'::jsonb;

alter table public.job_imports
  add column if not exists warnings_json jsonb default '[]'::jsonb;

alter table public.job_imports
  add column if not exists missing_fields_json jsonb default '[]'::jsonb;

alter table public.job_imports
  add column if not exists user_corrections_json jsonb default '{}'::jsonb;

alter table public.job_imports
  add column if not exists created_at timestamptz default now();

alter table public.job_imports
  add column if not exists updated_at timestamptz default now();

alter table public.job_imports
  add column if not exists archived_at timestamptz;

alter table public.job_imports
  alter column source_type set default 'pasted_text';

alter table public.job_imports
  alter column status set default 'review_required';

alter table public.job_imports
  alter column language set default 'unknown';

alter table public.job_imports
  alter column preliminary_details_json set default '{}'::jsonb;

alter table public.job_imports
  alter column inspection_json set default '{}'::jsonb;

alter table public.job_imports
  alter column warnings_json set default '[]'::jsonb;

alter table public.job_imports
  alter column missing_fields_json set default '[]'::jsonb;

alter table public.job_imports
  alter column user_corrections_json set default '{}'::jsonb;

alter table public.job_imports
  alter column created_at set default now();

alter table public.job_imports
  alter column updated_at set default now();

create index if not exists job_imports_user_updated_idx
  on public.job_imports(user_id, updated_at desc);

create index if not exists job_imports_user_status_idx
  on public.job_imports(user_id, status, updated_at desc);

create index if not exists job_imports_user_source_idx
  on public.job_imports(user_id, source_type, updated_at desc);

create index if not exists job_imports_source_document_idx
  on public.job_imports(source_document_id);

create or replace function public.set_job_imports_updated_at()
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

drop trigger if exists set_job_imports_updated_at on public.job_imports;

create trigger set_job_imports_updated_at
before update on public.job_imports
for each row execute function public.set_job_imports_updated_at();

alter table public.job_imports enable row level security;

drop policy if exists "Users can select own job imports" on public.job_imports;
create policy "Users can select own job imports"
on public.job_imports
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own job imports" on public.job_imports;
create policy "Users can insert own job imports"
on public.job_imports
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update own job imports" on public.job_imports;
create policy "Users can update own job imports"
on public.job_imports
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own job imports" on public.job_imports;
create policy "Users can delete own job imports"
on public.job_imports
for delete
to authenticated
using (auth.uid() = user_id);

commit;
