begin;

alter table public.employment_applications
add column if not exists application_readiness text not null default 'review_required',
add column if not exists canonical_profile_id uuid references public.canonical_professional_profiles(id) on delete set null,
add column if not exists canonical_profile_version integer,
add column if not exists job_understanding_id text references public.job_understandings(id) on delete set null,
add column if not exists job_understanding_version integer,
add column if not exists job_match_analysis_id text references public.job_match_analyses(id) on delete set null,
add column if not exists targeted_cv_document_id uuid references public.professional_documents(id) on delete set null,
add column if not exists cover_letter_document_id uuid references public.professional_documents(id) on delete set null,
add column if not exists optional_message_ids_json jsonb not null default '[]'::jsonb,
add column if not exists supporting_document_ids_json jsonb not null default '[]'::jsonb,
add column if not exists checklist_json jsonb not null default '[]'::jsonb,
add column if not exists warnings_json jsonb not null default '[]'::jsonb,
add column if not exists approvals_json jsonb not null default '{}'::jsonb,
add column if not exists status_history_json jsonb not null default '[]'::jsonb,
add column if not exists stale_state text not null default 'current',
add column if not exists archived_at timestamptz;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'employment_applications_status_check'
  ) then
    alter table public.employment_applications
    drop constraint employment_applications_status_check;
  end if;

  alter table public.employment_applications
  add constraint employment_applications_status_check
  check (
    status in (
      'saved',
      'planning',
      'preparing_documents',
      'review_required',
      'ready_to_apply',
      'applied',
      'interview',
      'rejected',
      'offer',
      'accepted',
      'archived'
    )
  );

  if not exists (
    select 1
    from pg_constraint
    where conname = 'employment_applications_readiness_check'
  ) then
    alter table public.employment_applications
    add constraint employment_applications_readiness_check
    check (application_readiness in ('blocked', 'review_required', 'ready_to_apply'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'employment_applications_stale_state_check'
  ) then
    alter table public.employment_applications
    add constraint employment_applications_stale_state_check
    check (stale_state in ('current', 'stale'));
  end if;
end $$;

create index if not exists employment_applications_job_match_idx
on public.employment_applications(user_id, job_match_analysis_id, updated_at desc)
where job_match_analysis_id is not null;

create index if not exists employment_applications_readiness_idx
on public.employment_applications(user_id, application_readiness, updated_at desc);

create index if not exists employment_applications_stale_idx
on public.employment_applications(user_id, stale_state, updated_at desc)
where stale_state = 'stale';

commit;
