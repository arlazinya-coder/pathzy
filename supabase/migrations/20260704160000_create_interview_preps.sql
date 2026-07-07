create table if not exists public.interview_preps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  company text,
  language text not null default 'english' check (language in ('english', 'french')),
  job_description text,
  content text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_preps_user_completed_idx
on public.interview_preps (user_id, completed, updated_at desc);

alter table public.interview_preps enable row level security;

drop policy if exists "Users can view own interview preps" on public.interview_preps;
drop policy if exists "Users can insert own interview preps" on public.interview_preps;
drop policy if exists "Users can update own interview preps" on public.interview_preps;
drop policy if exists "Users can delete own interview preps" on public.interview_preps;

create policy "Users can view own interview preps"
on public.interview_preps for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own interview preps"
on public.interview_preps for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own interview preps"
on public.interview_preps for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own interview preps"
on public.interview_preps for delete to authenticated
using (auth.uid() = user_id);
