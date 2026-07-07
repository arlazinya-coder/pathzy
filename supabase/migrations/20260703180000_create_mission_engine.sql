create table if not exists public.missions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_key text not null,
  mission_type text not null default 'daily' check (mission_type in ('daily', 'weekly')),
  title text not null,
  description text not null,
  estimated_time text not null,
  xp_reward integer not null,
  difficulty text not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  category text not null,
  due_date date not null,
  week_start date,
  completed boolean not null default false,
  completed_at timestamptz,
  source_context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, mission_key, due_date)
);

create table if not exists public.mission_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid not null references public.missions(id) on delete cascade,
  action text not null check (action in ('completed', 'reopened')),
  xp_awarded integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_key text not null,
  title text not null,
  description text not null,
  xp_reward integer not null default 0,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_key)
);

create table if not exists public.user_levels (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_xp integer not null default 0,
  level integer not null default 1,
  daily_streak integer not null default 0,
  weekly_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_completed_date date,
  last_completed_week date,
  updated_at timestamptz not null default now()
);

create table if not exists public.user_xp (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount integer not null,
  reason text not null,
  mission_id uuid references public.missions(id) on delete set null,
  achievement_key text,
  created_at timestamptz not null default now()
);

create index if not exists missions_user_due_idx
on public.missions (user_id, due_date desc, mission_type);

create index if not exists mission_history_user_created_idx
on public.mission_history (user_id, created_at desc);

create index if not exists achievements_user_unlocked_idx
on public.achievements (user_id, unlocked_at desc);

create index if not exists user_xp_user_created_idx
on public.user_xp (user_id, created_at desc);

alter table public.missions enable row level security;
alter table public.mission_history enable row level security;
alter table public.achievements enable row level security;
alter table public.user_levels enable row level security;
alter table public.user_xp enable row level security;

create policy "Users can read their own missions"
on public.missions for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own missions"
on public.missions for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own missions"
on public.missions for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their own mission history"
on public.mission_history for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own mission history"
on public.mission_history for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can read their own achievements"
on public.achievements for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own achievements"
on public.achievements for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can read their own level state"
on public.user_levels for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own level state"
on public.user_levels for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own level state"
on public.user_levels for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their own xp ledger"
on public.user_xp for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own xp ledger"
on public.user_xp for insert to authenticated
with check (auth.uid() = user_id);
