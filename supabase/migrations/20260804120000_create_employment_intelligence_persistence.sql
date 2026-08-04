begin;

create extension if not exists pgcrypto;

create table if not exists public.employment_intelligence_recompute_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  idempotency_key text not null,
  trigger text not null default 'manual',
  input_snapshot_hash text not null,
  engine_version text not null,
  status text not null default 'RUNNING' check (status in ('RUNNING', 'SUCCEEDED', 'FAILED', 'SKIPPED')),
  safe_error_code text,
  safe_error_message text,
  retryable boolean not null default true,
  metadata_json jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint employment_intelligence_attempt_idempotency_unique unique (user_id, idempotency_key)
);

create table if not exists public.employment_intelligence_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_version integer not null default 1,
  engine_version text not null,
  input_snapshot_version text not null,
  input_snapshot_hash text not null,
  identity_version text not null,
  country_code text not null default 'GENERIC',
  country_context_version text not null,
  diagnosis_version text,
  generated_at timestamptz not null default now(),
  status text not null default 'DRAFT' check (status in ('DRAFT', 'CURRENT', 'SUPERSEDED', 'STALE', 'RECOMPUTING', 'FAILED', 'ARCHIVED')),
  stale_status text not null default 'CURRENT' check (
    stale_status in (
      'CURRENT',
      'STALE_IDENTITY_CHANGED',
      'STALE_DIAGNOSIS_CHANGED',
      'STALE_INTELLIGENCE_CHANGED',
      'STALE_ACTION_HISTORY_CHANGED',
      'STALE_COUNTRY_CONTEXT_CHANGED',
      'STALE_ENGINE_CHANGED',
      'RECOMPUTING',
      'FAILED_RECOMPUTE'
    )
  ),
  stale_reason text,
  confidence_json jsonb not null default '{}'::jsonb,
  payload_json jsonb not null default '{}'::jsonb,
  summary_json jsonb not null default '{}'::jsonb,
  previous_valid_record_id uuid references public.employment_intelligence_profiles(id) on delete set null,
  recompute_attempt_id uuid references public.employment_intelligence_recompute_attempts(id) on delete set null,
  failure_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employment_action_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intelligence_profile_id uuid not null references public.employment_intelligence_profiles(id) on delete cascade,
  recommendation_version integer not null default 1,
  action_engine_version text not null,
  input_snapshot_hash text not null,
  primary_action_code text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'CURRENT', 'SUPERSEDED', 'STALE', 'RECOMPUTING', 'FAILED', 'ARCHIVED')),
  stale_status text not null default 'CURRENT',
  stale_reason text,
  action_set_json jsonb not null default '{}'::jsonb,
  confidence_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employment_career_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intelligence_profile_id uuid not null references public.employment_intelligence_profiles(id) on delete cascade,
  action_recommendation_id uuid not null references public.employment_action_recommendations(id) on delete cascade,
  plan_version integer not null default 1,
  career_plan_engine_version text not null,
  input_snapshot_hash text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'CURRENT', 'SUPERSEDED', 'STALE', 'RECOMPUTING', 'FAILED', 'ARCHIVED')),
  stale_status text not null default 'CURRENT',
  stale_reason text,
  plan_json jsonb not null default '{}'::jsonb,
  progress_json jsonb not null default '{"completedSteps":0,"totalSteps":0}'::jsonb,
  confidence_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employment_action_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_code text not null,
  state text not null default 'NOT_STARTED' check (state in ('NOT_STARTED', 'READY', 'BLOCKED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'EXPIRED')),
  source_recommendation_id uuid references public.employment_action_recommendations(id) on delete set null,
  source_engine_version text,
  started_at timestamptz,
  completed_at timestamptz,
  skipped_at timestamptz,
  skip_reason text,
  last_recommended_at timestamptz,
  recommendation_count integer not null default 0,
  evidence_json jsonb not null default '[]'::jsonb,
  completion_proof_json jsonb not null default '[]'::jsonb,
  user_feedback text check (user_feedback is null or user_feedback in ('HELPFUL', 'NOT_NOW', 'NOT_RELEVANT', 'CONFUSING')),
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists employment_intelligence_one_current_idx
on public.employment_intelligence_profiles(user_id)
where status = 'CURRENT';

create unique index if not exists employment_intelligence_input_version_idx
on public.employment_intelligence_profiles(user_id, input_snapshot_hash, engine_version, country_context_version, coalesce(diagnosis_version, 'none'))
where status in ('DRAFT', 'CURRENT', 'SUPERSEDED', 'STALE');

create unique index if not exists employment_action_recommendations_current_idx
on public.employment_action_recommendations(user_id, intelligence_profile_id)
where status = 'CURRENT';

create unique index if not exists employment_career_plans_current_idx
on public.employment_career_plans(user_id, intelligence_profile_id)
where status = 'CURRENT';

create unique index if not exists employment_action_history_user_action_idx
on public.employment_action_history(user_id, action_code);

create index if not exists employment_intelligence_user_status_idx
on public.employment_intelligence_profiles(user_id, status, updated_at desc);

create index if not exists employment_intelligence_user_stale_idx
on public.employment_intelligence_profiles(user_id, stale_status, updated_at desc);

create index if not exists employment_action_recommendations_user_status_idx
on public.employment_action_recommendations(user_id, status, updated_at desc);

create index if not exists employment_career_plans_user_status_idx
on public.employment_career_plans(user_id, status, updated_at desc);

create index if not exists employment_action_history_user_state_idx
on public.employment_action_history(user_id, state, updated_at desc);

create or replace function public.set_employment_intelligence_updated_at()
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

drop trigger if exists set_employment_intelligence_profiles_updated_at on public.employment_intelligence_profiles;
create trigger set_employment_intelligence_profiles_updated_at
before update on public.employment_intelligence_profiles
for each row execute function public.set_employment_intelligence_updated_at();

drop trigger if exists set_employment_action_recommendations_updated_at on public.employment_action_recommendations;
create trigger set_employment_action_recommendations_updated_at
before update on public.employment_action_recommendations
for each row execute function public.set_employment_intelligence_updated_at();

drop trigger if exists set_employment_career_plans_updated_at on public.employment_career_plans;
create trigger set_employment_career_plans_updated_at
before update on public.employment_career_plans
for each row execute function public.set_employment_intelligence_updated_at();

drop trigger if exists set_employment_action_history_updated_at on public.employment_action_history;
create trigger set_employment_action_history_updated_at
before update on public.employment_action_history
for each row execute function public.set_employment_intelligence_updated_at();

drop trigger if exists set_employment_intelligence_attempts_updated_at on public.employment_intelligence_recompute_attempts;
create trigger set_employment_intelligence_attempts_updated_at
before update on public.employment_intelligence_recompute_attempts
for each row execute function public.set_employment_intelligence_updated_at();

alter table public.employment_intelligence_profiles enable row level security;
alter table public.employment_action_recommendations enable row level security;
alter table public.employment_career_plans enable row level security;
alter table public.employment_action_history enable row level security;
alter table public.employment_intelligence_recompute_attempts enable row level security;

drop policy if exists "Users can view own employment intelligence profiles" on public.employment_intelligence_profiles;
drop policy if exists "Users can insert own employment intelligence profiles" on public.employment_intelligence_profiles;
drop policy if exists "Users can update own employment intelligence profiles" on public.employment_intelligence_profiles;

create policy "Users can view own employment intelligence profiles"
on public.employment_intelligence_profiles for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own employment intelligence profiles"
on public.employment_intelligence_profiles for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own employment intelligence profiles"
on public.employment_intelligence_profiles for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own employment action recommendations" on public.employment_action_recommendations;
drop policy if exists "Users can insert own employment action recommendations" on public.employment_action_recommendations;
drop policy if exists "Users can update own employment action recommendations" on public.employment_action_recommendations;

create policy "Users can view own employment action recommendations"
on public.employment_action_recommendations for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own employment action recommendations"
on public.employment_action_recommendations for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own employment action recommendations"
on public.employment_action_recommendations for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own employment career plans" on public.employment_career_plans;
drop policy if exists "Users can insert own employment career plans" on public.employment_career_plans;
drop policy if exists "Users can update own employment career plans" on public.employment_career_plans;

create policy "Users can view own employment career plans"
on public.employment_career_plans for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own employment career plans"
on public.employment_career_plans for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own employment career plans"
on public.employment_career_plans for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own employment action history" on public.employment_action_history;
drop policy if exists "Users can insert own employment action history" on public.employment_action_history;
drop policy if exists "Users can update own employment action history" on public.employment_action_history;

create policy "Users can view own employment action history"
on public.employment_action_history for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own employment action history"
on public.employment_action_history for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own employment action history"
on public.employment_action_history for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view own employment intelligence attempts" on public.employment_intelligence_recompute_attempts;
drop policy if exists "Users can insert own employment intelligence attempts" on public.employment_intelligence_recompute_attempts;
drop policy if exists "Users can update own employment intelligence attempts" on public.employment_intelligence_recompute_attempts;

create policy "Users can view own employment intelligence attempts"
on public.employment_intelligence_recompute_attempts for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own employment intelligence attempts"
on public.employment_intelligence_recompute_attempts for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own employment intelligence attempts"
on public.employment_intelligence_recompute_attempts for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create or replace function public.finalize_employment_intelligence_current(
  p_user_id uuid,
  p_intelligence_id uuid,
  p_recommendation_id uuid,
  p_career_plan_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'employment intelligence ownership violation' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.employment_intelligence_profiles
    where id = p_intelligence_id and user_id = p_user_id and status = 'DRAFT'
  ) then
    raise exception 'draft intelligence profile not found' using errcode = '23503';
  end if;

  if not exists (
    select 1 from public.employment_action_recommendations
    where id = p_recommendation_id and user_id = p_user_id and intelligence_profile_id = p_intelligence_id and status = 'DRAFT'
  ) then
    raise exception 'draft action recommendations not found' using errcode = '23503';
  end if;

  if not exists (
    select 1 from public.employment_career_plans
    where id = p_career_plan_id and user_id = p_user_id and intelligence_profile_id = p_intelligence_id and action_recommendation_id = p_recommendation_id and status = 'DRAFT'
  ) then
    raise exception 'draft career plan not found' using errcode = '23503';
  end if;

  update public.employment_career_plans
  set status = 'SUPERSEDED', stale_status = 'STALE_INTELLIGENCE_CHANGED'
  where user_id = p_user_id and status = 'CURRENT' and id <> p_career_plan_id;

  update public.employment_action_recommendations
  set status = 'SUPERSEDED', stale_status = 'STALE_INTELLIGENCE_CHANGED'
  where user_id = p_user_id and status = 'CURRENT' and id <> p_recommendation_id;

  update public.employment_intelligence_profiles
  set status = 'SUPERSEDED', stale_status = 'STALE_INTELLIGENCE_CHANGED'
  where user_id = p_user_id and status = 'CURRENT' and id <> p_intelligence_id;

  update public.employment_intelligence_profiles
  set status = 'CURRENT', stale_status = 'CURRENT', stale_reason = null
  where id = p_intelligence_id and user_id = p_user_id;

  update public.employment_action_recommendations
  set status = 'CURRENT', stale_status = 'CURRENT', stale_reason = null
  where id = p_recommendation_id and user_id = p_user_id;

  update public.employment_career_plans
  set status = 'CURRENT', stale_status = 'CURRENT', stale_reason = null
  where id = p_career_plan_id and user_id = p_user_id;
end;
$$;

grant execute on function public.finalize_employment_intelligence_current(uuid, uuid, uuid, uuid) to authenticated;

commit;
