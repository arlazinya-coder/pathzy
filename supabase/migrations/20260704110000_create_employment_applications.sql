create table if not exists public.employment_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_name text not null,
  role text not null,
  opportunity_type text not null default 'job',
  status text not null default 'saved' check (status in ('saved', 'applied', 'interview', 'rejected', 'offer', 'accepted')),
  application_date date,
  follow_up_date date,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists employment_applications_user_status_idx
on public.employment_applications (user_id, status, updated_at desc);

alter table public.employment_applications enable row level security;

drop policy if exists "Users can view own employment applications" on public.employment_applications;
drop policy if exists "Users can insert own employment applications" on public.employment_applications;
drop policy if exists "Users can update own employment applications" on public.employment_applications;
drop policy if exists "Users can delete own employment applications" on public.employment_applications;

create policy "Users can view own employment applications"
on public.employment_applications for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own employment applications"
on public.employment_applications for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own employment applications"
on public.employment_applications for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete own employment applications"
on public.employment_applications for delete to authenticated
using (auth.uid() = user_id);
