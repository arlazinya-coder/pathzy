begin;

create extension if not exists pgcrypto;

create table if not exists public.job_understandings (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_import_id uuid not null references public.job_imports(id) on delete cascade,
  version_number integer not null default 1,
  status text not null default 'review_required',
  language text not null default 'unknown',
  job_title text not null,
  organization text,
  location text,
  employment_type text,
  work_arrangement text,
  seniority text,
  industry text,
  department text,
  summary text not null default '',
  responsibilities_json jsonb not null default '[]'::jsonb,
  requirements_json jsonb not null default '[]'::jsonb,
  benefits_json jsonb not null default '[]'::jsonb,
  salary_json jsonb not null default '{}'::jsonb,
  application_details_json jsonb not null default '{}'::jsonb,
  warnings_json jsonb not null default '[]'::jsonb,
  source_evidence_json jsonb not null default '[]'::jsonb,
  system_extraction_json jsonb not null default '{}'::jsonb,
  user_approved_json jsonb not null default '{}'::jsonb,
  overall_confidence numeric not null default 0 check (overall_confidence >= 0 and overall_confidence <= 1),
  model_version text,
  prompt_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  archived_at timestamptz,
  constraint job_understandings_status_check check (status in ('processing', 'review_required', 'confirmed', 'failed')),
  constraint job_understandings_language_check check (language in ('en', 'fr', 'unknown')),
  constraint job_understandings_user_import_unique unique (user_id, job_import_id, version_number)
);

alter table public.job_understandings
  add column if not exists version_number integer default 1;

alter table public.job_understandings
  add column if not exists user_approved_json jsonb default '{}'::jsonb;

alter table public.job_understandings
  add column if not exists confirmed_at timestamptz;

create index if not exists job_understandings_user_updated_idx
  on public.job_understandings(user_id, updated_at desc);

create index if not exists job_understandings_user_status_idx
  on public.job_understandings(user_id, status, updated_at desc);

create index if not exists job_understandings_import_idx
  on public.job_understandings(job_import_id);

create or replace function public.set_job_understandings_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  if new.status = 'confirmed' and old.status is distinct from 'confirmed' then
    new.confirmed_at = now();
  end if;
  return new;
end;
$$;

drop trigger if exists set_job_understandings_updated_at on public.job_understandings;

create trigger set_job_understandings_updated_at
before update on public.job_understandings
for each row execute function public.set_job_understandings_updated_at();

alter table public.job_understandings enable row level security;

drop policy if exists "Users can select own job understandings" on public.job_understandings;
create policy "Users can select own job understandings"
on public.job_understandings
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own job understandings" on public.job_understandings;
create policy "Users can insert own job understandings"
on public.job_understandings
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.job_imports imports
    where imports.id = job_understandings.job_import_id
      and imports.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own job understandings" on public.job_understandings;
create policy "Users can update own job understandings"
on public.job_understandings
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.job_imports imports
    where imports.id = job_understandings.job_import_id
      and imports.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own job understandings" on public.job_understandings;
create policy "Users can delete own job understandings"
on public.job_understandings
for delete
to authenticated
using (auth.uid() = user_id);

commit;
