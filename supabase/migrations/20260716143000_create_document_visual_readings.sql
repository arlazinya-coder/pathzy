create table if not exists public.document_visual_readings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.user_documents(id) on delete cascade,
  inspection_record_id uuid references public.document_inspections(id) on delete set null,
  inspection_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'processing',
  document_type text not null default 'unknown',
  primary_language text,
  page_count integer not null default 0,
  detected_section_count integer not null default 0,
  detected_table_count integer not null default 0,
  detected_timeline_count integer not null default 0,
  detected_image_count integer not null default 0,
  detected_icon_count integer not null default 0,
  overall_confidence numeric not null default 0,
  model_name text,
  result_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint document_visual_readings_document_unique unique (document_id),
  constraint document_visual_readings_status_check check (status in ('pending', 'processing', 'completed', 'completed_with_warnings', 'failed'))
);

create table if not exists public.document_visual_pages (
  id uuid primary key default gen_random_uuid(),
  visual_reading_id uuid not null references public.document_visual_readings(id) on delete cascade,
  document_id uuid not null references public.user_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  page_number integer not null,
  status text not null default 'processing',
  source_type text,
  layout_confidence numeric not null default 0,
  reading_order_confidence numeric not null default 0,
  result_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint document_visual_pages_unique_page unique (visual_reading_id, page_number),
  constraint document_visual_pages_status_check check (status in ('pending', 'processing', 'completed', 'completed_with_warnings', 'failed'))
);

create index if not exists document_visual_readings_user_id_idx on public.document_visual_readings(user_id);
create index if not exists document_visual_readings_document_id_idx on public.document_visual_readings(document_id);
create index if not exists document_visual_readings_inspection_record_id_idx on public.document_visual_readings(inspection_record_id);
create index if not exists document_visual_readings_status_idx on public.document_visual_readings(status);
create index if not exists document_visual_pages_user_id_idx on public.document_visual_pages(user_id);
create index if not exists document_visual_pages_document_id_idx on public.document_visual_pages(document_id);
create index if not exists document_visual_pages_visual_reading_id_idx on public.document_visual_pages(visual_reading_id);

alter table public.document_visual_readings enable row level security;
alter table public.document_visual_pages enable row level security;

drop policy if exists "Users can select own document visual readings" on public.document_visual_readings;
create policy "Users can select own document visual readings"
on public.document_visual_readings
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own document visual readings" on public.document_visual_readings;
create policy "Users can insert own document visual readings"
on public.document_visual_readings
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own document visual readings" on public.document_visual_readings;
create policy "Users can update own document visual readings"
on public.document_visual_readings
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own document visual readings" on public.document_visual_readings;
create policy "Users can delete own document visual readings"
on public.document_visual_readings
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select own document visual pages" on public.document_visual_pages;
create policy "Users can select own document visual pages"
on public.document_visual_pages
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert own document visual pages" on public.document_visual_pages;
create policy "Users can insert own document visual pages"
on public.document_visual_pages
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update own document visual pages" on public.document_visual_pages;
create policy "Users can update own document visual pages"
on public.document_visual_pages
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own document visual pages" on public.document_visual_pages;
create policy "Users can delete own document visual pages"
on public.document_visual_pages
for delete
using (auth.uid() = user_id);
