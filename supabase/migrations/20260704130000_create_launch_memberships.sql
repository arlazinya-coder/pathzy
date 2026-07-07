create table if not exists public.launch_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  launch_phase text not null check (launch_phase in ('founding_tester', 'early_adopter', 'public_user')),
  member_number integer not null unique,
  badge text not null check (badge in ('Founding Tester', 'Early Adopter', 'Public Member')),
  access_level text not null default 'premium' check (access_level in ('free', 'starter', 'pro', 'premium', 'enterprise')),
  price_lock boolean not null default false,
  price_lock_amount numeric(8, 2),
  price_lock_active boolean not null default false,
  free_access_until timestamptz,
  subscription_status text not null default 'active',
  joined_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists launch_memberships_phase_idx
on public.launch_memberships (launch_phase, member_number);

alter table public.launch_memberships enable row level security;

drop policy if exists "Users can read own launch membership" on public.launch_memberships;
drop policy if exists "Users can insert own launch membership" on public.launch_memberships;
drop policy if exists "Users can update own launch membership" on public.launch_memberships;

create policy "Users can read own launch membership"
on public.launch_memberships for select to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own launch membership"
on public.launch_memberships for insert to authenticated
with check (auth.uid() = user_id);

create policy "Users can update own launch membership"
on public.launch_memberships for update to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
