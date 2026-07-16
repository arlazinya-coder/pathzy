create table if not exists public.career_reasoning_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_type text not null,
  status text not null default 'pending',
  subject_type text not null default 'unknown',
  confidence numeric not null default 0,
  conclusion text,
  recommendation text,
  requires_user_confirmation boolean not null default true,
  explanation text,
  input_version text,
  reasoning_version text,
  model_name text,
  fingerprint text not null,
  result_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint career_reasoning_cases_user_fingerprint_unique unique (user_id, fingerprint),
  constraint career_reasoning_cases_status_check check (status in ('pending', 'processing', 'resolved', 'needs_user_input', 'dismissed', 'failed', 'stale')),
  constraint career_reasoning_cases_confidence_check check (confidence >= 0 and confidence <= 1)
);

create table if not exists public.career_reasoning_case_entities (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.career_reasoning_cases(id) on delete cascade,
  semantic_entity_id text not null,
  document_id uuid references public.user_documents(id) on delete set null,
  role text not null default 'candidate',
  created_at timestamptz not null default now(),
  constraint career_reasoning_case_entities_unique unique (case_id, semantic_entity_id)
);

create table if not exists public.career_reasoning_user_decisions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  case_id uuid not null references public.career_reasoning_cases(id) on delete cascade,
  decision text not null,
  selected_option text,
  custom_answer text,
  resulting_action text,
  created_at timestamptz not null default now()
);

create table if not exists public.career_entity_merges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reasoning_case_id uuid not null references public.career_reasoning_cases(id) on delete cascade,
  canonical_entity_id text not null,
  merged_entity_ids text[] not null default '{}'::text[],
  merge_type text not null,
  reversible boolean not null default true,
  created_at timestamptz not null default now(),
  reversed_at timestamptz
);

create index if not exists career_reasoning_cases_user_id_idx on public.career_reasoning_cases(user_id);
create index if not exists career_reasoning_cases_status_idx on public.career_reasoning_cases(status);
create index if not exists career_reasoning_cases_case_type_idx on public.career_reasoning_cases(case_type);
create index if not exists career_reasoning_cases_confidence_idx on public.career_reasoning_cases(confidence);
create index if not exists career_reasoning_cases_fingerprint_idx on public.career_reasoning_cases(fingerprint);
create index if not exists career_reasoning_case_entities_case_id_idx on public.career_reasoning_case_entities(case_id);
create index if not exists career_reasoning_case_entities_document_id_idx on public.career_reasoning_case_entities(document_id);
create index if not exists career_reasoning_user_decisions_user_id_idx on public.career_reasoning_user_decisions(user_id);
create index if not exists career_reasoning_user_decisions_case_id_idx on public.career_reasoning_user_decisions(case_id);
create index if not exists career_entity_merges_user_id_idx on public.career_entity_merges(user_id);
create index if not exists career_entity_merges_reasoning_case_id_idx on public.career_entity_merges(reasoning_case_id);

alter table public.career_reasoning_cases enable row level security;
alter table public.career_reasoning_case_entities enable row level security;
alter table public.career_reasoning_user_decisions enable row level security;
alter table public.career_entity_merges enable row level security;

drop policy if exists "Users can select own career reasoning cases" on public.career_reasoning_cases;
create policy "Users can select own career reasoning cases"
on public.career_reasoning_cases
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own career reasoning cases" on public.career_reasoning_cases;
create policy "Users can insert own career reasoning cases"
on public.career_reasoning_cases
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own career reasoning cases" on public.career_reasoning_cases;
create policy "Users can update own career reasoning cases"
on public.career_reasoning_cases
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own career reasoning cases" on public.career_reasoning_cases;
create policy "Users can delete own career reasoning cases"
on public.career_reasoning_cases
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select own career reasoning case entities" on public.career_reasoning_case_entities;
create policy "Users can select own career reasoning case entities"
on public.career_reasoning_case_entities
for select
using (
  exists (
    select 1 from public.career_reasoning_cases c
    where c.id = case_id and c.user_id = auth.uid()
  )
);

drop policy if exists "Users can insert own career reasoning case entities" on public.career_reasoning_case_entities;
create policy "Users can insert own career reasoning case entities"
on public.career_reasoning_case_entities
for insert
with check (
  exists (
    select 1 from public.career_reasoning_cases c
    where c.id = case_id and c.user_id = auth.uid()
  )
);

drop policy if exists "Users can delete own career reasoning case entities" on public.career_reasoning_case_entities;
create policy "Users can delete own career reasoning case entities"
on public.career_reasoning_case_entities
for delete
using (
  exists (
    select 1 from public.career_reasoning_cases c
    where c.id = case_id and c.user_id = auth.uid()
  )
);

drop policy if exists "Users can select own career reasoning decisions" on public.career_reasoning_user_decisions;
create policy "Users can select own career reasoning decisions"
on public.career_reasoning_user_decisions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own career reasoning decisions" on public.career_reasoning_user_decisions;
create policy "Users can insert own career reasoning decisions"
on public.career_reasoning_user_decisions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can select own career entity merges" on public.career_entity_merges;
create policy "Users can select own career entity merges"
on public.career_entity_merges
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own career entity merges" on public.career_entity_merges;
create policy "Users can insert own career entity merges"
on public.career_entity_merges
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own career entity merges" on public.career_entity_merges;
create policy "Users can update own career entity merges"
on public.career_entity_merges
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
