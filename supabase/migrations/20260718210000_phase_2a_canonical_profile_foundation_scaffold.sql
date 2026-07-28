begin;

-- Phase 2A scaffolding only.
-- This migration is additive and reversible through a later rollback migration
-- that drops only these Phase 2A metadata columns and indexes after review.

alter table public.canonical_profile_versions
add column if not exists source_system text,
add column if not exists source_record_id text,
add column if not exists idempotency_key text,
add column if not exists rollback_version_number integer,
add column if not exists compatibility_snapshot_json jsonb not null default '{}'::jsonb,
add column if not exists validation_json jsonb not null default '{}'::jsonb;

create unique index if not exists canonical_profile_versions_idempotency_idx
on public.canonical_profile_versions(user_id, idempotency_key)
where idempotency_key is not null;

create index if not exists canonical_profile_versions_source_system_idx
on public.canonical_profile_versions(user_id, source_system, created_at desc);

comment on column public.canonical_profile_versions.source_system is
'Phase 2A metadata: source system that produced this canonical version, such as legacy_user_profiles, professional_identity, user_documents, professional_documents or canonical.';

comment on column public.canonical_profile_versions.idempotency_key is
'Phase 2A metadata: stable key used by the canonical migration/service layer to avoid duplicate version records.';

comment on column public.canonical_profile_versions.compatibility_snapshot_json is
'Phase 2A metadata: non-authoritative compatibility snapshot used for reversible migration review.';

comment on column public.canonical_profile_versions.validation_json is
'Phase 2A metadata: validation result captured when a canonical profile version is created.';

commit;

-- Read-only verification for SQL Editor use after applying this migration.
select
  'canonical_profile_versions_phase_2a_columns' as check_name,
  count(*) filter (where column_name in (
    'source_system',
    'source_record_id',
    'idempotency_key',
    'rollback_version_number',
    'compatibility_snapshot_json',
    'validation_json'
  )) as found_columns,
  6 as expected_columns
from information_schema.columns
where table_schema = 'public'
  and table_name = 'canonical_profile_versions';

select
  'canonical_profile_versions_idempotency_idx' as check_name,
  exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'canonical_profile_versions'
      and indexname = 'canonical_profile_versions_idempotency_idx'
  ) as exists;
