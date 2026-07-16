create table if not exists public.document_semantic_readings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.user_documents(id) on delete cascade,
  inspection_record_id uuid references public.document_inspections(id) on delete set null,
  visual_reading_record_id uuid references public.document_visual_readings(id) on delete set null,
  inspection_id text not null,
  visual_reading_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'processing',
  document_type text not null default 'unknown',
  primary_language text,
  detected_profession text,
  employment_count integer not null default 0,
  education_count integer not null default 0,
  certification_count integer not null default 0,
  skill_count integer not null default 0,
  language_count integer not null default 0,
  conflict_count integer not null default 0,
  overall_confidence numeric not null default 0,
  manual_review_required boolean not null default false,
  model_name text,
  taxonomy_version text,
  processing_version text,
  result_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint document_semantic_readings_document_unique unique (document_id),
  constraint document_semantic_readings_status_check check (status in ('pending', 'processing', 'completed', 'completed_with_warnings', 'manual_review_required', 'failed'))
);

create table if not exists public.document_semantic_entities (
  id uuid primary key default gen_random_uuid(),
  semantic_reading_id uuid not null references public.document_semantic_readings(id) on delete cascade,
  document_id uuid not null references public.user_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entity_type text not null,
  category text not null,
  original_text text not null,
  normalized_value text,
  confidence numeric not null default 0,
  explicitness text not null default 'explicit',
  requires_review boolean not null default false,
  review_status text not null default 'unreviewed',
  source_json jsonb not null default '{}'::jsonb,
  evidence_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint document_semantic_entities_explicitness_check check (explicitness in ('explicit', 'strongly_implied', 'weakly_implied')),
  constraint document_semantic_entities_review_status_check check (review_status in ('unreviewed', 'accepted', 'edited', 'rejected'))
);

create table if not exists public.document_semantic_relationships (
  id uuid primary key default gen_random_uuid(),
  semantic_reading_id uuid not null references public.document_semantic_readings(id) on delete cascade,
  document_id uuid not null references public.user_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source_entity_id text not null,
  target_entity_id text not null,
  relationship_type text not null,
  confidence numeric not null default 0,
  evidence_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists document_semantic_readings_user_id_idx on public.document_semantic_readings(user_id);
create index if not exists document_semantic_readings_document_id_idx on public.document_semantic_readings(document_id);
create index if not exists document_semantic_readings_visual_reading_record_id_idx on public.document_semantic_readings(visual_reading_record_id);
create index if not exists document_semantic_readings_status_idx on public.document_semantic_readings(status);
create index if not exists document_semantic_readings_detected_profession_idx on public.document_semantic_readings(detected_profession);
create index if not exists document_semantic_entities_user_id_idx on public.document_semantic_entities(user_id);
create index if not exists document_semantic_entities_document_id_idx on public.document_semantic_entities(document_id);
create index if not exists document_semantic_entities_reading_id_idx on public.document_semantic_entities(semantic_reading_id);
create index if not exists document_semantic_entities_type_idx on public.document_semantic_entities(entity_type);
create index if not exists document_semantic_relationships_user_id_idx on public.document_semantic_relationships(user_id);
create index if not exists document_semantic_relationships_reading_id_idx on public.document_semantic_relationships(semantic_reading_id);

alter table public.document_semantic_readings enable row level security;
alter table public.document_semantic_entities enable row level security;
alter table public.document_semantic_relationships enable row level security;

drop policy if exists "Users can select own document semantic readings" on public.document_semantic_readings;
create policy "Users can select own document semantic readings"
on public.document_semantic_readings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own document semantic readings" on public.document_semantic_readings;
create policy "Users can insert own document semantic readings"
on public.document_semantic_readings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own document semantic readings" on public.document_semantic_readings;
create policy "Users can update own document semantic readings"
on public.document_semantic_readings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own document semantic readings" on public.document_semantic_readings;
create policy "Users can delete own document semantic readings"
on public.document_semantic_readings
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select own document semantic entities" on public.document_semantic_entities;
create policy "Users can select own document semantic entities"
on public.document_semantic_entities
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own document semantic entities" on public.document_semantic_entities;
create policy "Users can insert own document semantic entities"
on public.document_semantic_entities
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own document semantic entities" on public.document_semantic_entities;
create policy "Users can update own document semantic entities"
on public.document_semantic_entities
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own document semantic entities" on public.document_semantic_entities;
create policy "Users can delete own document semantic entities"
on public.document_semantic_entities
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select own document semantic relationships" on public.document_semantic_relationships;
create policy "Users can select own document semantic relationships"
on public.document_semantic_relationships
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own document semantic relationships" on public.document_semantic_relationships;
create policy "Users can insert own document semantic relationships"
on public.document_semantic_relationships
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own document semantic relationships" on public.document_semantic_relationships;
create policy "Users can delete own document semantic relationships"
on public.document_semantic_relationships
for delete
using (auth.uid() = user_id);
