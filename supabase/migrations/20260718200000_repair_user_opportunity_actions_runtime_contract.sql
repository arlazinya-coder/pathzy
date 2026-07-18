begin;

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
  constraint user_opportunity_actions_user_id_opportunity_id_key unique (user_id, opportunity_id)
);

create index if not exists user_opportunity_actions_user_updated_idx
on public.user_opportunity_actions (user_id, updated_at desc);

alter table public.user_opportunity_actions enable row level security;

drop policy if exists "Users can read their own opportunity actions"
on public.user_opportunity_actions;

drop policy if exists "Users can insert their own opportunity actions"
on public.user_opportunity_actions;

drop policy if exists "Users can update their own opportunity actions"
on public.user_opportunity_actions;

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

commit;

with required_columns(column_name) as (
  values
    ('id'),
    ('user_id'),
    ('opportunity_id'),
    ('saved'),
    ('applied'),
    ('completed'),
    ('hidden'),
    ('created_at'),
    ('updated_at')
),
verification as (
  select
    'table_exists' as check_name,
    exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'user_opportunity_actions'
        and c.relkind in ('r', 'p')
    ) as passed

  union all

  select
    'required_columns_exist',
    not exists (
      select 1
      from required_columns rc
      where not exists (
        select 1
        from information_schema.columns c
        where c.table_schema = 'public'
          and c.table_name = 'user_opportunity_actions'
          and c.column_name = rc.column_name
      )
    )

  union all

  select
    'unique_user_opportunity_exists',
    exists (
      select 1
      from pg_constraint con
      join pg_class t on t.oid = con.conrelid
      join pg_namespace n on n.oid = t.relnamespace
      where n.nspname = 'public'
        and t.relname = 'user_opportunity_actions'
        and con.contype = 'u'
        and (
          select array_agg(a.attname order by key.ordinality)
          from unnest(con.conkey) with ordinality as key(attnum, ordinality)
          join pg_attribute a on a.attrelid = t.oid and a.attnum = key.attnum
        ) = array['user_id', 'opportunity_id']
    )

  union all

  select
    'rls_enabled',
    exists (
      select 1
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'user_opportunity_actions'
        and c.relrowsecurity = true
    )

  union all

  select
    'required_policies_exist',
    not exists (
      select 1
      from (
        values
          ('Users can read their own opportunity actions'),
          ('Users can insert their own opportunity actions'),
          ('Users can update their own opportunity actions')
      ) as required_policies(policy_name)
      where not exists (
        select 1
        from pg_policies p
        where p.schemaname = 'public'
          and p.tablename = 'user_opportunity_actions'
          and p.policyname = required_policies.policy_name
      )
    )
)
select
  check_name,
  case when passed then 'PASS' else 'FAIL' end as status
from verification
order by check_name;
