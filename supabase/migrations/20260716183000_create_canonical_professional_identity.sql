begin;

create extension if not exists pgcrypto;

create table if not exists public.canonical_professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'draft',
  current_version integer not null default 1,
  primary_language text not null default 'en',
  overall_confidence numeric not null default 0,
  completion_percentage integer not null default 0,
  last_confirmed_at timestamptz,
  identity_json jsonb not null default '{}'::jsonb,
  contact_json jsonb not null default '{}'::jsonb,
  professional_profile_json jsonb not null default '{}'::jsonb,
  career_preferences_json jsonb not null default '{}'::jsonb,
  completion_json jsonb not null default '{}'::jsonb,
  confidence_json jsonb not null default '{}'::jsonb,
  unresolved_issues_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint canonical_professional_profiles_user_unique unique (user_id),
  constraint canonical_professional_profiles_status_check check (status in ('draft', 'active', 'needs_review', 'archived')),
  constraint canonical_professional_profiles_language_check check (primary_language in ('en', 'fr')),
  constraint canonical_professional_profiles_confidence_check check (overall_confidence >= 0 and overall_confidence <= 1),
  constraint canonical_professional_profiles_completion_check check (completion_percentage >= 0 and completion_percentage <= 100)
);

create table if not exists public.canonical_employments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_title text,
  employer_name text,
  location text,
  employment_type text,
  department text,
  start_date_json jsonb not null default '{}'::jsonb,
  end_date_json jsonb not null default '{}'::jsonb,
  is_current boolean not null default false,
  status text not null default 'needs_review',
  confidence numeric not null default 0,
  reasoning_case_id uuid references public.career_reasoning_cases(id) on delete set null,
  user_decision_id uuid references public.career_reasoning_user_decisions(id) on delete set null,
  entity_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint canonical_employments_status_check check (status in ('confirmed', 'needs_review', 'disputed', 'archived')),
  constraint canonical_employments_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.canonical_education (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  qualification text,
  normalized_qualification text,
  degree_level text,
  field_of_study text,
  institution text,
  start_date_json jsonb not null default '{}'::jsonb,
  end_date_json jsonb not null default '{}'::jsonb,
  graduation_date_json jsonb not null default '{}'::jsonb,
  education_status text not null default 'unknown',
  result text,
  confidence numeric not null default 0,
  reasoning_case_id uuid references public.career_reasoning_cases(id) on delete set null,
  user_decision_id uuid references public.career_reasoning_user_decisions(id) on delete set null,
  entity_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint canonical_education_status_check check (education_status in ('completed', 'in_progress', 'incomplete', 'unknown')),
  constraint canonical_education_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.canonical_certifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_name text,
  issuer text,
  issue_date_json jsonb not null default '{}'::jsonb,
  expiry_date_json jsonb not null default '{}'::jsonb,
  credential_id text,
  credential_url text,
  active_status text not null default 'unknown',
  status text not null default 'needs_review',
  confidence numeric not null default 0,
  reasoning_case_id uuid references public.career_reasoning_cases(id) on delete set null,
  user_decision_id uuid references public.career_reasoning_user_decisions(id) on delete set null,
  entity_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint canonical_certifications_active_status_check check (active_status in ('active', 'expired', 'unknown')),
  constraint canonical_certifications_status_check check (status in ('confirmed', 'needs_review', 'disputed', 'archived')),
  constraint canonical_certifications_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.canonical_licences (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_name text,
  issuer text,
  licence_number text,
  jurisdiction text,
  issue_date_json jsonb not null default '{}'::jsonb,
  expiry_date_json jsonb not null default '{}'::jsonb,
  status text not null default 'needs_review',
  confidence numeric not null default 0,
  entity_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint canonical_licences_status_check check (status in ('confirmed', 'needs_review', 'disputed', 'archived')),
  constraint canonical_licences_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.canonical_skills (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_name text not null,
  category text not null default 'unknown',
  proficiency text,
  years_experience numeric,
  explicitness text not null default 'explicit',
  status text not null default 'needs_review',
  confidence numeric not null default 0,
  reasoning_case_id uuid references public.career_reasoning_cases(id) on delete set null,
  user_decision_id uuid references public.career_reasoning_user_decisions(id) on delete set null,
  entity_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint canonical_skills_category_check check (category in ('technical', 'software', 'tool', 'platform', 'programming_language', 'framework', 'laboratory', 'business', 'management', 'communication', 'leadership', 'interpersonal', 'industry', 'unknown')),
  constraint canonical_skills_explicitness_check check (explicitness in ('explicit', 'confirmed_implied', 'unconfirmed_implied')),
  constraint canonical_skills_status_check check (status in ('confirmed', 'needs_review', 'archived')),
  constraint canonical_skills_confidence_check check (confidence >= 0 and confidence <= 1),
  constraint canonical_skills_user_profile_name_unique unique (user_id, profile_id, canonical_name)
);

create table if not exists public.canonical_languages (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null,
  proficiency text,
  normalized_proficiency text,
  status text not null default 'needs_review',
  confidence numeric not null default 0,
  entity_json jsonb not null default '{}'::jsonb,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint canonical_languages_normalized_check check (normalized_proficiency is null or normalized_proficiency in ('native', 'fluent', 'advanced', 'intermediate', 'basic', 'unknown')),
  constraint canonical_languages_status_check check (status in ('confirmed', 'needs_review', 'archived')),
  constraint canonical_languages_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.canonical_timeline_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  related_entity_type text not null,
  related_entity_id uuid,
  title text not null,
  description text,
  sort_date date,
  date_json jsonb not null default '{}'::jsonb,
  date_range_json jsonb not null default '{}'::jsonb,
  status text not null default 'needs_review',
  confidence numeric not null default 0,
  event_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint canonical_timeline_events_status_check check (status in ('confirmed', 'needs_review')),
  constraint canonical_timeline_events_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.canonical_entity_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  source_type text not null,
  document_id uuid references public.user_documents(id) on delete set null,
  semantic_entity_id text,
  reasoning_case_id uuid references public.career_reasoning_cases(id) on delete set null,
  user_decision_id uuid references public.career_reasoning_user_decisions(id) on delete set null,
  original_value text,
  source_confidence numeric,
  source_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint canonical_entity_sources_source_type_check check (source_type in ('uploaded_document', 'semantic_entity', 'reasoning_case', 'user_entry', 'user_correction', 'import', 'existing_profile')),
  constraint canonical_entity_sources_confidence_check check (source_confidence is null or (source_confidence >= 0 and source_confidence <= 1))
);

create table if not exists public.canonical_entity_aliases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  entity_type text not null,
  entity_id uuid,
  alias_type text not null,
  alias_value text not null,
  source_reference_id uuid references public.canonical_entity_sources(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint canonical_entity_aliases_unique unique (user_id, profile_id, entity_type, entity_id, alias_type, alias_value)
);

create table if not exists public.canonical_profile_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  version_number integer not null,
  change_type text not null,
  changed_by text not null,
  change_summary text not null,
  change_set_json jsonb not null default '{}'::jsonb,
  snapshot_json jsonb,
  reasoning_case_id uuid references public.career_reasoning_cases(id) on delete set null,
  user_decision_id uuid references public.career_reasoning_user_decisions(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint canonical_profile_versions_unique unique (profile_id, version_number),
  constraint canonical_profile_versions_change_type_check check (change_type in ('field_added', 'field_updated', 'entity_merged', 'entity_split', 'entity_archived', 'reasoning_applied', 'user_correction', 'import_confirmed', 'rollback')),
  constraint canonical_profile_versions_changed_by_check check (changed_by in ('user', 'system', 'reasoning_confirmation', 'migration'))
);

create table if not exists public.professional_identity_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  view_type text not null,
  name text,
  language text,
  target_role text,
  target_job_id text,
  profile_version integer not null,
  configuration_json jsonb not null default '{}'::jsonb,
  generated_content_json jsonb not null default '{}'::jsonb,
  freshness_status text not null default 'current',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint professional_identity_views_type_check check (view_type in ('master_profile', 'cv', 'cover_letter', 'linkedin', 'professional_bio', 'job_application', 'portfolio', 'career_timeline', 'skills_profile', 'interview_profile')),
  constraint professional_identity_views_freshness_check check (freshness_status in ('current', 'stale', 'partially_stale'))
);

create index if not exists canonical_professional_profiles_user_status_idx on public.canonical_professional_profiles(user_id, status);
create index if not exists canonical_employments_user_profile_status_idx on public.canonical_employments(user_id, profile_id, status);
create index if not exists canonical_employments_reasoning_case_idx on public.canonical_employments(reasoning_case_id);
create index if not exists canonical_education_user_profile_status_idx on public.canonical_education(user_id, profile_id, education_status);
create index if not exists canonical_certifications_user_profile_status_idx on public.canonical_certifications(user_id, profile_id, status);
create index if not exists canonical_licences_user_profile_status_idx on public.canonical_licences(user_id, profile_id, status);
create index if not exists canonical_skills_user_profile_status_idx on public.canonical_skills(user_id, profile_id, status);
create index if not exists canonical_skills_user_category_idx on public.canonical_skills(user_id, category);
create index if not exists canonical_languages_user_profile_status_idx on public.canonical_languages(user_id, profile_id, status);
create index if not exists canonical_timeline_events_user_profile_date_idx on public.canonical_timeline_events(user_id, profile_id, sort_date);
create index if not exists canonical_entity_sources_user_entity_idx on public.canonical_entity_sources(user_id, entity_type, entity_id);
create index if not exists canonical_entity_sources_document_idx on public.canonical_entity_sources(document_id);
create index if not exists canonical_entity_sources_reasoning_idx on public.canonical_entity_sources(reasoning_case_id);
create index if not exists canonical_entity_aliases_user_entity_idx on public.canonical_entity_aliases(user_id, entity_type, entity_id);
create index if not exists canonical_profile_versions_user_profile_idx on public.canonical_profile_versions(user_id, profile_id, version_number desc);
create index if not exists professional_identity_views_user_type_idx on public.professional_identity_views(user_id, view_type, updated_at desc);
create index if not exists professional_identity_views_profile_version_idx on public.professional_identity_views(profile_id, profile_version);

create or replace function public.set_canonical_profile_updated_at()
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

drop trigger if exists set_canonical_professional_profiles_updated_at on public.canonical_professional_profiles;
create trigger set_canonical_professional_profiles_updated_at
before update on public.canonical_professional_profiles
for each row execute function public.set_canonical_profile_updated_at();

drop trigger if exists set_canonical_employments_updated_at on public.canonical_employments;
create trigger set_canonical_employments_updated_at
before update on public.canonical_employments
for each row execute function public.set_canonical_profile_updated_at();

drop trigger if exists set_canonical_education_updated_at on public.canonical_education;
create trigger set_canonical_education_updated_at
before update on public.canonical_education
for each row execute function public.set_canonical_profile_updated_at();

drop trigger if exists set_canonical_certifications_updated_at on public.canonical_certifications;
create trigger set_canonical_certifications_updated_at
before update on public.canonical_certifications
for each row execute function public.set_canonical_profile_updated_at();

drop trigger if exists set_canonical_licences_updated_at on public.canonical_licences;
create trigger set_canonical_licences_updated_at
before update on public.canonical_licences
for each row execute function public.set_canonical_profile_updated_at();

drop trigger if exists set_canonical_skills_updated_at on public.canonical_skills;
create trigger set_canonical_skills_updated_at
before update on public.canonical_skills
for each row execute function public.set_canonical_profile_updated_at();

drop trigger if exists set_canonical_languages_updated_at on public.canonical_languages;
create trigger set_canonical_languages_updated_at
before update on public.canonical_languages
for each row execute function public.set_canonical_profile_updated_at();

drop trigger if exists set_professional_identity_views_updated_at on public.professional_identity_views;
create trigger set_professional_identity_views_updated_at
before update on public.professional_identity_views
for each row execute function public.set_canonical_profile_updated_at();

alter table public.canonical_professional_profiles enable row level security;
alter table public.canonical_employments enable row level security;
alter table public.canonical_education enable row level security;
alter table public.canonical_certifications enable row level security;
alter table public.canonical_licences enable row level security;
alter table public.canonical_skills enable row level security;
alter table public.canonical_languages enable row level security;
alter table public.canonical_timeline_events enable row level security;
alter table public.canonical_entity_sources enable row level security;
alter table public.canonical_entity_aliases enable row level security;
alter table public.canonical_profile_versions enable row level security;
alter table public.professional_identity_views enable row level security;

drop policy if exists "Users can manage own canonical profiles" on public.canonical_professional_profiles;
create policy "Users can manage own canonical profiles"
on public.canonical_professional_profiles
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical employments" on public.canonical_employments;
create policy "Users can manage own canonical employments"
on public.canonical_employments
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical education" on public.canonical_education;
create policy "Users can manage own canonical education"
on public.canonical_education
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical certifications" on public.canonical_certifications;
create policy "Users can manage own canonical certifications"
on public.canonical_certifications
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical licences" on public.canonical_licences;
create policy "Users can manage own canonical licences"
on public.canonical_licences
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical skills" on public.canonical_skills;
create policy "Users can manage own canonical skills"
on public.canonical_skills
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical languages" on public.canonical_languages;
create policy "Users can manage own canonical languages"
on public.canonical_languages
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical timeline events" on public.canonical_timeline_events;
create policy "Users can manage own canonical timeline events"
on public.canonical_timeline_events
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical entity sources" on public.canonical_entity_sources;
create policy "Users can manage own canonical entity sources"
on public.canonical_entity_sources
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical entity aliases" on public.canonical_entity_aliases;
create policy "Users can manage own canonical entity aliases"
on public.canonical_entity_aliases
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own canonical profile versions" on public.canonical_profile_versions;
create policy "Users can manage own canonical profile versions"
on public.canonical_profile_versions
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own professional identity views" on public.professional_identity_views;
create policy "Users can manage own professional identity views"
on public.professional_identity_views
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

commit;

