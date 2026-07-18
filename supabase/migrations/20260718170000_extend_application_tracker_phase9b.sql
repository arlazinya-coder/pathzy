begin;

alter table public.employment_applications
add column if not exists source text,
add column if not exists closing_date date,
add column if not exists planned_application_date date,
add column if not exists assessment_deadline date,
add column if not exists interview_date timestamptz,
add column if not exists expected_response_date date,
add column if not exists next_action_date date,
add column if not exists next_action text,
add column if not exists follow_up_state text,
add column if not exists contacts_json jsonb not null default '[]'::jsonb,
add column if not exists match_summary_json jsonb not null default '{}'::jsonb;

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
      'preparing',
      'preparing_documents',
      'review_required',
      'ready_to_apply',
      'applied',
      'viewed',
      'screening',
      'assessment',
      'interview',
      'interview_scheduled',
      'interview_completed',
      'offer',
      'offer_received',
      'accepted',
      'offer_accepted',
      'offer_declined',
      'rejected',
      'withdrawn',
      'closed',
      'archived'
    )
  );
end $$;

create table if not exists public.application_timeline_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  application_id uuid not null references public.employment_applications(id) on delete cascade,
  event_type text not null check (
    event_type in (
      'application_created',
      'documents_prepared',
      'ready_to_apply',
      'applied',
      'viewed',
      'screening',
      'assessment_received',
      'interview_invited',
      'interview_scheduled',
      'interview_completed',
      'follow_up',
      'offer',
      'rejection',
      'withdrawal',
      'note',
      'document_update',
      'status_change'
    )
  ),
  from_status text,
  to_status text,
  note text not null default '',
  metadata_json jsonb not null default '{}'::jsonb,
  event_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

alter table public.application_timeline_events enable row level security;

drop policy if exists "Users can view own application timeline events" on public.application_timeline_events;
drop policy if exists "Users can insert own application timeline events" on public.application_timeline_events;

create policy "Users can view own application timeline events"
on public.application_timeline_events for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own application timeline events"
on public.application_timeline_events for insert to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.employment_applications application
    where application.id = application_id
      and application.user_id = auth.uid()
  )
);

create index if not exists application_timeline_events_user_application_idx
on public.application_timeline_events(user_id, application_id, event_at desc);

create index if not exists application_timeline_events_user_type_idx
on public.application_timeline_events(user_id, event_type, event_at desc);

create index if not exists employment_applications_tracker_status_idx
on public.employment_applications(user_id, status, next_action_date, follow_up_date, updated_at desc);

create index if not exists employment_applications_tracker_dates_idx
on public.employment_applications(user_id, closing_date, interview_date, expected_response_date);

commit;
