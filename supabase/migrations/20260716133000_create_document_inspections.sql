begin;

create extension if not exists pgcrypto;

create table if not exists public.document_inspections (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.user_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'completed_with_warnings', 'failed')),
  document_type text not null default 'unknown',
  document_type_confidence numeric not null default 0 check (document_type_confidence >= 0 and document_type_confidence <= 1),
  source_type text not null default 'digital' check (source_type in ('digital', 'scanned', 'image', 'mixed')),
  is_scanned boolean not null default false,
  has_text_layer boolean not null default false,
  ocr_required boolean not null default false,
  primary_language text,
  page_count integer not null default 1,
  column_count integer not null default 1,
  has_tables boolean not null default false,
  has_images boolean not null default false,
  overall_quality text not null default 'good' check (overall_quality in ('excellent', 'good', 'fair', 'poor')),
  overall_confidence numeric not null default 0 check (overall_confidence >= 0 and overall_confidence <= 1),
  recommended_strategy text not null default 'native_text' check (recommended_strategy in ('native_text', 'ocr', 'hybrid', 'image_ocr', 'manual_review')),
  manual_review_required boolean not null default false,
  result_json jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint document_inspections_document_unique unique (document_id)
);

create index if not exists document_inspections_document_idx
  on public.document_inspections (document_id);

create index if not exists document_inspections_user_idx
  on public.document_inspections (user_id, updated_at desc);

create index if not exists document_inspections_status_idx
  on public.document_inspections (status);

create index if not exists document_inspections_document_type_idx
  on public.document_inspections (document_type);

create or replace function public.set_document_inspections_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_document_inspections_updated_at on public.document_inspections;

create trigger set_document_inspections_updated_at
before update on public.document_inspections
for each row
execute function public.set_document_inspections_updated_at();

alter table public.document_inspections enable row level security;

drop policy if exists "Users can select inspections for own documents" on public.document_inspections;
drop policy if exists "Users can insert inspections for own documents" on public.document_inspections;
drop policy if exists "Users can update inspections for own documents" on public.document_inspections;
drop policy if exists "Users can delete inspections for own documents" on public.document_inspections;

create policy "Users can select inspections for own documents"
on public.document_inspections
for select
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
);

create policy "Users can insert inspections for own documents"
on public.document_inspections
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
);

create policy "Users can update inspections for own documents"
on public.document_inspections
for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
);

create policy "Users can delete inspections for own documents"
on public.document_inspections
for delete
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.user_documents d
    where d.id = document_id and d.user_id = auth.uid()
  )
);

commit;
