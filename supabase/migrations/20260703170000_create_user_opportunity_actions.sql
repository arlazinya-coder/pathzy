create table if not exists public.user_opportunity_actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  opportunity_id text not null,
  saved boolean not null default false,
  applied boolean not null default false,
  completed boolean not null default false,
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, opportunity_id)
);

create index if not exists user_opportunity_actions_user_updated_idx
on public.user_opportunity_actions (user_id, updated_at desc);

alter table public.user_opportunity_actions enable row level security;

create policy "Users can read their own opportunity actions"
on public.user_opportunity_actions
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own opportunity actions"
on public.user_opportunity_actions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own opportunity actions"
on public.user_opportunity_actions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
