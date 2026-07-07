create table if not exists public.pathzy_brain (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  language text not null default 'english' check (language in ('english', 'french')),
  career_goal text,
  employment_readiness_score integer not null default 0 check (employment_readiness_score between 0 and 100),
  readiness_label text not null default 'Needs Setup',
  career_clarity_score integer not null default 0,
  skills_readiness_score integer not null default 0,
  cv_readiness_score integer not null default 0,
  opportunity_readiness_score integer not null default 0,
  interview_readiness_score integer not null default 0,
  consistency_score integer not null default 0,
  digital_professionalism_score integer not null default 0,
  top_strengths jsonb not null default '[]'::jsonb,
  top_weaknesses jsonb not null default '[]'::jsonb,
  recommended_next_actions jsonb not null default '[]'::jsonb,
  last_updated timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  skill_name text not null,
  skill_level text not null default 'beginner',
  skill_type text not null default 'career',
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, skill_name)
);

create table if not exists public.skill_gaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_career text not null,
  missing_skill text not null,
  priority text not null default 'medium' check (priority in ('high', 'medium', 'low')),
  estimated_time_to_learn text not null default '2-4 weeks',
  recommended_action text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, target_career, missing_skill)
);

create table if not exists public.employment_readiness_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  category_scores jsonb not null default '{}'::jsonb,
  reason_for_change text not null default 'Readiness recalculated',
  created_at timestamptz not null default now()
);

create table if not exists public.ai_memory_facts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  fact_type text not null,
  fact_value text not null,
  source text not null default 'pathzy',
  importance integer not null default 3 check (importance between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, fact_type, fact_value)
);

create index if not exists pathzy_brain_user_idx on public.pathzy_brain (user_id);
create index if not exists user_skills_user_idx on public.user_skills (user_id);
create index if not exists skill_gaps_user_idx on public.skill_gaps (user_id);
create index if not exists employment_readiness_history_user_created_idx on public.employment_readiness_history (user_id, created_at desc);
create index if not exists ai_memory_facts_user_importance_idx on public.ai_memory_facts (user_id, importance desc);

alter table public.pathzy_brain enable row level security;
alter table public.user_skills enable row level security;
alter table public.skill_gaps enable row level security;
alter table public.employment_readiness_history enable row level security;
alter table public.ai_memory_facts enable row level security;

drop policy if exists "Users can read their own brain" on public.pathzy_brain;
drop policy if exists "Users can insert their own brain" on public.pathzy_brain;
drop policy if exists "Users can update their own brain" on public.pathzy_brain;
drop policy if exists "Users can read their own skills" on public.user_skills;
drop policy if exists "Users can insert their own skills" on public.user_skills;
drop policy if exists "Users can update their own skills" on public.user_skills;
drop policy if exists "Users can read their own skill gaps" on public.skill_gaps;
drop policy if exists "Users can insert their own skill gaps" on public.skill_gaps;
drop policy if exists "Users can update their own skill gaps" on public.skill_gaps;
drop policy if exists "Users can read their own readiness history" on public.employment_readiness_history;
drop policy if exists "Users can insert their own readiness history" on public.employment_readiness_history;
drop policy if exists "Users can read their own ai memory facts" on public.ai_memory_facts;
drop policy if exists "Users can insert their own ai memory facts" on public.ai_memory_facts;
drop policy if exists "Users can update their own ai memory facts" on public.ai_memory_facts;

create policy "Users can read their own brain" on public.pathzy_brain
for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own brain" on public.pathzy_brain
for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own brain" on public.pathzy_brain
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read their own skills" on public.user_skills
for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own skills" on public.user_skills
for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own skills" on public.user_skills
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read their own skill gaps" on public.skill_gaps
for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own skill gaps" on public.skill_gaps
for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own skill gaps" on public.skill_gaps
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read their own readiness history" on public.employment_readiness_history
for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own readiness history" on public.employment_readiness_history
for insert to authenticated with check (auth.uid() = user_id);

create policy "Users can read their own ai memory facts" on public.ai_memory_facts
for select to authenticated using (auth.uid() = user_id);
create policy "Users can insert their own ai memory facts" on public.ai_memory_facts
for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update their own ai memory facts" on public.ai_memory_facts
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
