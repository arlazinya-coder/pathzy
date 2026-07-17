begin;

create extension if not exists pgcrypto;

create table if not exists public.professional_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  profile_version integer not null,
  document_type text not null,
  name text not null,
  status text not null default 'draft',
  language text not null default 'en',
  purpose text,
  target_role text,
  target_job_id text,
  template_id text not null,
  template_version text not null,
  configuration_json jsonb not null default '{}'::jsonb,
  content_json jsonb not null default '{}'::jsonb,
  selected_entities_json jsonb not null default '{}'::jsonb,
  freshness_status text not null default 'current',
  warnings_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint professional_documents_type_check check (document_type in ('cv', 'cover_letter', 'professional_bio', 'linkedin_profile', 'application_summary')),
  constraint professional_documents_status_check check (status in ('draft', 'generating', 'ready', 'ready_with_warnings', 'stale', 'archived', 'failed')),
  constraint professional_documents_language_check check (language in ('en', 'fr')),
  constraint professional_documents_purpose_check check (purpose is null or purpose in ('master', 'general', 'targeted', 'one_page', 'early_career', 'experienced', 'career_change', 'academic', 'custom')),
  constraint professional_documents_freshness_check check (freshness_status in ('current', 'partially_stale', 'stale'))
);

create table if not exists public.professional_document_fields (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.professional_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_entity_id uuid,
  canonical_field_path text,
  field_type text not null,
  presentation_value text not null default '',
  source_type text not null default 'canonical',
  user_approved boolean not null default false,
  generated_for_target_job_id text,
  generation_metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_document_fields_source_type_check check (source_type in ('canonical', 'user_override', 'generated', 'targeted_generated'))
);

create table if not exists public.professional_document_exports (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.professional_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_version integer not null,
  export_type text not null,
  template_version text not null,
  storage_path text,
  checksum text,
  created_at timestamptz not null default now(),
  constraint professional_document_exports_type_check check (export_type in ('pdf', 'docx'))
);

create index if not exists professional_documents_user_type_idx on public.professional_documents(user_id, document_type, updated_at desc);
create index if not exists professional_documents_profile_version_idx on public.professional_documents(canonical_profile_id, profile_version);
create index if not exists professional_documents_freshness_idx on public.professional_documents(user_id, freshness_status);
create index if not exists professional_document_fields_document_idx on public.professional_document_fields(document_id);
create index if not exists professional_document_fields_user_entity_idx on public.professional_document_fields(user_id, canonical_entity_id);
create index if not exists professional_document_exports_document_idx on public.professional_document_exports(document_id, created_at desc);
create index if not exists professional_document_exports_user_idx on public.professional_document_exports(user_id, created_at desc);

create or replace function public.set_professional_documents_updated_at()
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

drop trigger if exists set_professional_documents_updated_at on public.professional_documents;
create trigger set_professional_documents_updated_at
before update on public.professional_documents
for each row execute function public.set_professional_documents_updated_at();

drop trigger if exists set_professional_document_fields_updated_at on public.professional_document_fields;
create trigger set_professional_document_fields_updated_at
before update on public.professional_document_fields
for each row execute function public.set_professional_documents_updated_at();

alter table public.professional_documents enable row level security;
alter table public.professional_document_fields enable row level security;
alter table public.professional_document_exports enable row level security;

drop policy if exists "Users can manage own professional documents" on public.professional_documents;
create policy "Users can manage own professional documents"
on public.professional_documents
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own professional document fields" on public.professional_document_fields;
create policy "Users can manage own professional document fields"
on public.professional_document_fields
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own professional document exports" on public.professional_document_exports;
create policy "Users can manage own professional document exports"
on public.professional_document_exports
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

commit;

