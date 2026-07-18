begin;

alter table public.professional_documents
add column if not exists job_understanding_id text,
add column if not exists job_understanding_version integer,
add column if not exists job_match_analysis_id text,
add column if not exists target_package_id text,
add column if not exists targeted_canonical_profile_version integer,
add column if not exists selected_target_entity_ids_json jsonb not null default '{}'::jsonb,
add column if not exists excluded_target_entity_ids_json jsonb not null default '{}'::jsonb,
add column if not exists targeting_strategy_json jsonb not null default '{}'::jsonb,
add column if not exists content_version text,
add column if not exists targeting_strategy_version text,
add column if not exists approval_state text,
add column if not exists stale_state text,
add column if not exists approved_at timestamptz;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'professional_documents_type_check'
  ) then
    alter table public.professional_documents
    drop constraint professional_documents_type_check;
  end if;

  alter table public.professional_documents
  add constraint professional_documents_type_check
  check (
    document_type in (
      'cv',
      'cover_letter',
      'professional_bio',
      'linkedin_profile',
      'application_summary',
      'application_email',
      'linkedin_message',
      'recruiter_message'
    )
  );

  if not exists (
    select 1
    from pg_constraint
    where conname = 'professional_documents_approval_state_check'
  ) then
    alter table public.professional_documents
    add constraint professional_documents_approval_state_check
    check (approval_state is null or approval_state in ('draft', 'review_required', 'approved', 'changes_requested', 'archived'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'professional_documents_stale_state_check'
  ) then
    alter table public.professional_documents
    add constraint professional_documents_stale_state_check
    check (stale_state is null or stale_state in ('current', 'stale'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'professional_documents_job_understanding_fk'
  ) then
    alter table public.professional_documents
    add constraint professional_documents_job_understanding_fk
    foreign key (job_understanding_id)
    references public.job_understandings(id)
    on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'professional_documents_job_match_analysis_fk'
  ) then
    alter table public.professional_documents
    add constraint professional_documents_job_match_analysis_fk
    foreign key (job_match_analysis_id)
    references public.job_match_analyses(id)
    on delete set null;
  end if;
end $$;

create index if not exists professional_documents_target_job_idx
on public.professional_documents(user_id, job_understanding_id, updated_at desc);

create index if not exists professional_documents_match_analysis_idx
on public.professional_documents(user_id, job_match_analysis_id, updated_at desc);

create index if not exists professional_documents_approval_idx
on public.professional_documents(user_id, approval_state, updated_at desc)
where approval_state is not null;

create index if not exists professional_documents_stale_target_idx
on public.professional_documents(user_id, stale_state, updated_at desc)
where stale_state = 'stale';

commit;
