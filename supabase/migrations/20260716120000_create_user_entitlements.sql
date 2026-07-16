alter table public.user_profiles
add column if not exists is_admin boolean not null default false;

create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  email text,
  access_level text not null check (access_level in ('founder', 'beta_full', 'trial', 'paid_pro', 'paid_premium', 'expired')),
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  granted_by uuid references auth.users(id),
  notes text,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_entitlements_user_or_email_check check (user_id is not null or email is not null)
);

create index if not exists user_entitlements_user_status_idx
on public.user_entitlements (user_id, status, access_level);

create index if not exists user_entitlements_email_status_idx
on public.user_entitlements (lower(email), status, access_level);

create or replace function public.touch_user_entitlements_last_seen()
returns void
language sql
security definer
set search_path = public
as $$
  update public.user_entitlements
  set last_seen_at = now()
  where status = 'active'
    and revoked_at is null
    and starts_at <= now()
    and (expires_at is null or expires_at > now())
    and (
      user_id = auth.uid()
      or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

revoke all on function public.touch_user_entitlements_last_seen() from public;
grant execute on function public.touch_user_entitlements_last_seen() to authenticated;

alter table public.user_entitlements enable row level security;

drop policy if exists "Users can read own entitlements" on public.user_entitlements;
drop policy if exists "Users can update own entitlement last seen" on public.user_entitlements;
drop policy if exists "Admins can manage entitlements" on public.user_entitlements;

create policy "Users can read own entitlements"
on public.user_entitlements for select to authenticated
using (
  auth.uid() = user_id
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
);

create policy "Admins can manage entitlements"
on public.user_entitlements for all to authenticated
using (
  exists (
    select 1
    from public.user_profiles p
    where (p.user_id = auth.uid() or p.id = auth.uid())
      and (p.is_admin = true or p.founder = true or p.membership_type = 'Admin')
  )
)
with check (
  exists (
    select 1
    from public.user_profiles p
    where (p.user_id = auth.uid() or p.id = auth.uid())
      and (p.is_admin = true or p.founder = true or p.membership_type = 'Admin')
  )
);
