begin;

create extension if not exists pgcrypto;

create table if not exists public.job_intelligence_analyses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  profile_version integer not null,
  source_type text not null default 'manual',
  source_opportunity_id text,
  job_title text,
  company_name text,
  location text,
  language text not null default 'en',
  job_text_hash text not null,
  structured_job_json jsonb not null default '{}'::jsonb,
  match_json jsonb not null default '{}'::jsonb,
  suitability_status text not null default 'not_enough_information',
  readiness_score integer not null default 0,
  status text not null default 'review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint job_intelligence_source_type_check check (source_type in ('manual', 'opportunity_catalog', 'application_tracker', 'uploaded_job_ad', 'external_link')),
  constraint job_intelligence_language_check check (language in ('en', 'fr')),
  constraint job_intelligence_suitability_check check (suitability_status in ('strong_fit', 'potential_fit', 'stretch', 'not_enough_information', 'not_recommended_yet')),
  constraint job_intelligence_status_check check (status in ('review', 'accepted', 'dismissed', 'archived')),
  constraint job_intelligence_readiness_check check (readiness_score >= 0 and readiness_score <= 100)
);

create table if not exists public.job_intelligence_requirements (
  id uuid primary key default gen_random_uuid(),
  analysis_id text not null references public.job_intelligence_analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  requirement_key text not null,
  requirement_text text not null,
  normalized_text text not null,
  category text not null default 'unknown',
  importance text not null default 'context',
  confidence numeric not null default 0,
  source_line text,
  created_at timestamptz not null default now(),
  constraint job_intelligence_requirements_category_check check (category in ('role', 'skill', 'tool', 'technology', 'experience', 'education', 'certification', 'licence', 'language', 'location', 'work_authorization', 'availability', 'responsibility', 'culture', 'unknown')),
  constraint job_intelligence_requirements_importance_check check (importance in ('mandatory', 'preferred', 'context')),
  constraint job_intelligence_requirements_confidence_check check (confidence >= 0 and confidence <= 1),
  constraint job_intelligence_requirements_unique unique (analysis_id, requirement_key)
);

create table if not exists public.job_intelligence_evidence (
  id uuid primary key default gen_random_uuid(),
  analysis_id text not null references public.job_intelligence_analyses(id) on delete cascade,
  requirement_id uuid references public.job_intelligence_requirements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  canonical_entity_type text not null,
  canonical_entity_id text not null,
  evidence_status text not null default 'uncertain',
  evidence_strength numeric not null default 0,
  explanation text not null default '',
  source_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint job_intelligence_evidence_status_check check (evidence_status in ('matched', 'partial', 'missing', 'uncertain')),
  constraint job_intelligence_evidence_strength_check check (evidence_strength >= 0 and evidence_strength <= 100)
);

create index if not exists job_intelligence_analyses_user_updated_idx on public.job_intelligence_analyses(user_id, updated_at desc);
create index if not exists job_intelligence_analyses_profile_idx on public.job_intelligence_analyses(canonical_profile_id, profile_version);
create index if not exists job_intelligence_analyses_suitability_idx on public.job_intelligence_analyses(user_id, suitability_status);
create index if not exists job_intelligence_requirements_analysis_idx on public.job_intelligence_requirements(analysis_id);
create index if not exists job_intelligence_requirements_user_category_idx on public.job_intelligence_requirements(user_id, category, importance);
create index if not exists job_intelligence_evidence_analysis_idx on public.job_intelligence_evidence(analysis_id);
create index if not exists job_intelligence_evidence_user_entity_idx on public.job_intelligence_evidence(user_id, canonical_entity_type, canonical_entity_id);

create or replace function public.set_job_intelligence_updated_at()
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

drop trigger if exists set_job_intelligence_analyses_updated_at on public.job_intelligence_analyses;
create trigger set_job_intelligence_analyses_updated_at
before update on public.job_intelligence_analyses
for each row execute function public.set_job_intelligence_updated_at();

alter table public.job_intelligence_analyses enable row level security;
alter table public.job_intelligence_requirements enable row level security;
alter table public.job_intelligence_evidence enable row level security;

drop policy if exists "Users can manage own job intelligence analyses" on public.job_intelligence_analyses;
create policy "Users can manage own job intelligence analyses"
on public.job_intelligence_analyses
for all to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage own job intelligence requirements" on public.job_intelligence_requirements;
create policy "Users can manage own job intelligence requirements"
on public.job_intelligence_requirements
for all to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.job_intelligence_analyses analyses
    where analyses.id = job_intelligence_requirements.analysis_id
      and analyses.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.job_intelligence_analyses analyses
    where analyses.id = job_intelligence_requirements.analysis_id
      and analyses.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own job intelligence evidence" on public.job_intelligence_evidence;
create policy "Users can manage own job intelligence evidence"
on public.job_intelligence_evidence
for all to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.job_intelligence_analyses analyses
    where analyses.id = job_intelligence_evidence.analysis_id
      and analyses.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.job_intelligence_analyses analyses
    where analyses.id = job_intelligence_evidence.analysis_id
      and analyses.user_id = auth.uid()
  )
);

commit;
