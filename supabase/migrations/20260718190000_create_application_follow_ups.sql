begin;

create table if not exists public.application_follow_ups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.employment_applications(id) on delete cascade,
  follow_up_type text not null check (
    follow_up_type in (
      'application_follow_up',
      'recruiter_follow_up',
      'interview_thank_you',
      'interview_status_follow_up',
      'referral_thank_you',
      'offer_response',
      'custom'
    )
  ),
  status text not null default 'suggested' check (
    status in (
      'suggested',
      'scheduled',
      'drafted',
      'approved',
      'sent',
      'dismissed',
      'cancelled'
    )
  ),
  recommended_date date,
  scheduled_date timestamptz,
  sent_at timestamptz,
  recipient_json jsonb not null default '{}'::jsonb,
  subject text not null default '',
  body text not null default '',
  approval_json jsonb not null default '{"approved": false}'::jsonb,
  timezone text not null default 'UTC',
  timing_reason text not null default '',
  duplicate_key text not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.application_follow_ups enable row level security;

drop policy if exists "Users can view own application follow ups" on public.application_follow_ups;
drop policy if exists "Users can insert own application follow ups" on public.application_follow_ups;
drop policy if exists "Users can update own application follow ups" on public.application_follow_ups;

create policy "Users can view own application follow ups"
on public.application_follow_ups for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own application follow ups"
on public.application_follow_ups for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.employment_applications application
    where application.id = application_id
      and application.user_id = auth.uid()
  )
);

create policy "Users can update own application follow ups"
on public.application_follow_ups for update to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.employment_applications application
    where application.id = application_id
      and application.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.employment_applications application
    where application.id = application_id
      and application.user_id = auth.uid()
  )
);

create unique index if not exists application_follow_ups_active_duplicate_idx
on public.application_follow_ups(user_id, application_id, follow_up_type, duplicate_key)
where archived_at is null
  and status in ('suggested', 'scheduled', 'drafted', 'approved');

create index if not exists application_follow_ups_user_application_idx
on public.application_follow_ups(user_id, application_id, updated_at desc);

create index if not exists application_follow_ups_user_status_date_idx
on public.application_follow_ups(user_id, status, recommended_date, scheduled_date);

create index if not exists application_follow_ups_due_idx
on public.application_follow_ups(user_id, recommended_date, status)
where archived_at is null
  and status in ('suggested', 'scheduled', 'drafted', 'approved');

commit;
