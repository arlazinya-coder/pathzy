begin;

create extension if not exists pgcrypto;

create table if not exists public.job_match_analyses (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_understanding_id text not null references public.job_understandings(id) on delete cascade,
  job_understanding_version integer not null default 1,
  canonical_profile_id uuid not null references public.canonical_professional_profiles(id) on delete cascade,
  canonical_profile_version integer not null,
  status text not null default 'current',
  requirement_matches_json jsonb not null default '[]'::jsonb,
  strengths_json jsonb not null default '[]'::jsonb,
  partial_matches_json jsonb not null default '[]'::jsonb,
  gaps_json jsonb not null default '[]'::jsonb,
  uncertainties_json jsonb not null default '[]'::jsonb,
  blockers_json jsonb not null default '[]'::jsonb,
  fit_score integer check (fit_score is null or (fit_score >= 0 and fit_score <= 100)),
  fit_band text not null default 'insufficient_information',
  analysis_confidence numeric not null default 0 check (analysis_confidence >= 0 and analysis_confidence <= 1),
  readiness text not null default 'information_needed',
  score_explanation_json jsonb not null default '{}'::jsonb,
  recommendations_json jsonb not null default '[]'::jsonb,
  clarification_questions_json jsonb not null default '[]'::jsonb,
  targeted_cv_route text not null default '/professional-identity/cv',
  scoring_version text not null,
  freshness_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz,
  constraint job_match_analyses_status_check check (status in ('current', 'stale', 'archived')),
  constraint job_match_analyses_fit_band_check check (fit_band in ('strong_match', 'good_potential', 'possible_match', 'significant_gaps', 'insufficient_information')),
  constraint job_match_analyses_readiness_check check (readiness in ('ready_to_prepare_application', 'review_recommended', 'information_needed', 'eligibility_concern', 'not_recommended_without_changes')),
  constraint job_match_analyses_unique unique (user_id, job_understanding_id, canonical_profile_version, job_understanding_version, scoring_version)
);

create index if not exists job_match_analyses_user_updated_idx
  on public.job_match_analyses(user_id, updated_at desc);

create index if not exists job_match_analyses_user_status_idx
  on public.job_match_analyses(user_id, status, updated_at desc);

create index if not exists job_match_analyses_understanding_idx
  on public.job_match_analyses(job_understanding_id);

create index if not exists job_match_analyses_profile_idx
  on public.job_match_analyses(canonical_profile_id, canonical_profile_version);

create or replace function public.set_job_match_analyses_updated_at()
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

drop trigger if exists set_job_match_analyses_updated_at on public.job_match_analyses;

create trigger set_job_match_analyses_updated_at
before update on public.job_match_analyses
for each row execute function public.set_job_match_analyses_updated_at();

alter table public.job_match_analyses enable row level security;

drop policy if exists "Users can select own job match analyses" on public.job_match_analyses;
create policy "Users can select own job match analyses"
on public.job_match_analyses
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own job match analyses" on public.job_match_analyses;
create policy "Users can insert own job match analyses"
on public.job_match_analyses
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.job_understandings understanding
    where understanding.id = job_match_analyses.job_understanding_id
      and understanding.user_id = auth.uid()
  )
  and exists (
    select 1 from public.canonical_professional_profiles profile
    where profile.id = job_match_analyses.canonical_profile_id
      and profile.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own job match analyses" on public.job_match_analyses;
create policy "Users can update own job match analyses"
on public.job_match_analyses
for update
to authenticated
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.job_understandings understanding
    where understanding.id = job_match_analyses.job_understanding_id
      and understanding.user_id = auth.uid()
  )
  and exists (
    select 1 from public.canonical_professional_profiles profile
    where profile.id = job_match_analyses.canonical_profile_id
      and profile.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own job match analyses" on public.job_match_analyses;
create policy "Users can delete own job match analyses"
on public.job_match_analyses
for delete
to authenticated
using (auth.uid() = user_id);

commit;
