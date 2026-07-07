create table if not exists public.discovery_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  answers jsonb not null,
  generated_result jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists discovery_responses_user_created_idx
on public.discovery_responses (user_id, created_at desc);

alter table public.discovery_responses enable row level security;

create policy "Users can read their own discovery responses"
on public.discovery_responses
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own discovery responses"
on public.discovery_responses
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own discovery responses"
on public.discovery_responses
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
