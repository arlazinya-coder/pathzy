begin;

alter table public.professional_document_fields
add column if not exists approval_state text not null default 'accepted',
add column if not exists source_fact_ids jsonb not null default '[]'::jsonb,
add column if not exists unsupported_claim_detected boolean not null default false,
add column if not exists field_language text not null default 'en',
add column if not exists original_canonical_value text,
add column if not exists approved_master_value text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'professional_document_fields_approval_state_check'
  ) then
    alter table public.professional_document_fields
    add constraint professional_document_fields_approval_state_check
    check (approval_state in ('suggested', 'accepted', 'edited', 'rejected'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'professional_document_fields_language_check'
  ) then
    alter table public.professional_document_fields
    add constraint professional_document_fields_language_check
    check (field_language in ('en', 'fr'));
  end if;
end $$;

create index if not exists professional_document_fields_approval_idx
on public.professional_document_fields(document_id, approval_state);

create index if not exists professional_document_fields_unsupported_idx
on public.professional_document_fields(user_id, unsupported_claim_detected)
where unsupported_claim_detected = true;

commit;
