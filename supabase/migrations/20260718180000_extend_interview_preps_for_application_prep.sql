begin;

alter table public.interview_preps
add column if not exists application_id uuid references public.employment_applications(id) on delete set null,
add column if not exists job_understanding_id text references public.job_understandings(id) on delete set null,
add column if not exists job_understanding_version integer,
add column if not exists job_match_analysis_id text references public.job_match_analyses(id) on delete set null,
add column if not exists canonical_profile_id uuid references public.canonical_professional_profiles(id) on delete set null,
add column if not exists canonical_profile_version integer,
add column if not exists targeted_cv_document_id uuid references public.professional_documents(id) on delete set null,
add column if not exists interview_type text not null default 'unknown',
add column if not exists questions_json jsonb not null default '[]'::jsonb,
add column if not exists star_stories_json jsonb not null default '[]'::jsonb,
add column if not exists gap_responses_json jsonb not null default '[]'::jsonb,
add column if not exists employer_questions_json jsonb not null default '[]'::jsonb,
add column if not exists practice_responses_json jsonb not null default '[]'::jsonb,
add column if not exists feedback_json jsonb not null default '[]'::jsonb,
add column if not exists status text not null default 'draft';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'interview_preps_interview_type_check'
  ) then
    alter table public.interview_preps
    add constraint interview_preps_interview_type_check
    check (interview_type in ('screening', 'behavioural', 'technical', 'panel', 'case_study', 'presentation', 'final', 'unknown'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'interview_preps_status_check'
  ) then
    alter table public.interview_preps
    add constraint interview_preps_status_check
    check (status in ('draft', 'in_progress', 'completed', 'archived'));
  end if;
end $$;

create index if not exists interview_preps_application_idx
on public.interview_preps(user_id, application_id, updated_at desc)
where application_id is not null;

create index if not exists interview_preps_job_match_idx
on public.interview_preps(user_id, job_match_analysis_id, updated_at desc)
where job_match_analysis_id is not null;

create index if not exists interview_preps_status_idx
on public.interview_preps(user_id, status, updated_at desc);

commit;
