alter table public.user_profiles
add column if not exists user_id uuid references auth.users(id) on delete cascade,
add column if not exists email text,
add column if not exists age integer,
add column if not exists current_status text,
add column if not exists plan text not null default 'free',
add column if not exists premium_status text not null default 'free',
add column if not exists mentor_messages_today integer not null default 0,
add column if not exists mentor_messages_date date default current_date,
add column if not exists founder boolean not null default false,
add column if not exists premium boolean not null default false,
add column if not exists founder_member_number integer,
add column if not exists premium_expires_at timestamptz,
add column if not exists membership_type text,
add column if not exists updated_at timestamptz default now();

update public.user_profiles
set user_id = id
where user_id is null;

alter table public.user_profiles
alter column user_id set not null;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_current_status_check'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles drop constraint user_profiles_current_status_check;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_premium_status_check'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles drop constraint user_profiles_premium_status_check;
  end if;

  if exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_plan_check'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles drop constraint user_profiles_plan_check;
  end if;
end;
$$;

alter table public.user_profiles
add constraint user_profiles_current_status_check
check (
  current_status is null
  or current_status in (
    'student',
    'graduate',
    'unemployed',
    'employed',
    'entrepreneur',
    'career_changer',
    'looking_first_job'
  )
);

alter table public.user_profiles
add constraint user_profiles_premium_status_check
check (premium_status in ('free', 'starter', 'pro', 'premium', 'enterprise'));

alter table public.user_profiles
add constraint user_profiles_plan_check
check (plan in ('free', 'starter', 'pro', 'premium', 'enterprise'));

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_profiles_user_id_key'
      and conrelid = 'public.user_profiles'::regclass
  ) then
    alter table public.user_profiles
    add constraint user_profiles_user_id_key unique (user_id);
  end if;
end;
$$;

update public.user_profiles p
set
  plan = m.access_level,
  premium_status = case
    when m.access_level in ('starter', 'pro', 'premium', 'enterprise') then m.access_level
    else 'free'
  end,
  founder = m.launch_phase = 'founding_tester',
  premium = m.access_level in ('starter', 'pro', 'premium', 'enterprise'),
  founder_member_number = case when m.launch_phase = 'founding_tester' then m.member_number else null end,
  premium_expires_at = m.free_access_until,
  membership_type = m.badge,
  updated_at = now()
from public.launch_memberships m
where p.user_id = m.user_id;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id,
    user_id,
    full_name,
    email,
    country,
    age,
    education,
    current_status,
    employment_status,
    premium_status,
    plan,
    mentor_messages_today,
    mentor_messages_date
  )
  values (
    new.id,
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.email,
    new.raw_user_meta_data ->> 'country',
    nullif(new.raw_user_meta_data ->> 'age', '')::integer,
    new.raw_user_meta_data ->> 'education',
    new.raw_user_meta_data ->> 'current_status',
    coalesce(new.raw_user_meta_data ->> 'current_status', new.raw_user_meta_data ->> 'employment_status'),
    'free',
    'free',
    0,
    current_date
  )
  on conflict (user_id) do update set
    full_name = coalesce(excluded.full_name, public.user_profiles.full_name),
    email = coalesce(excluded.email, public.user_profiles.email),
    country = coalesce(excluded.country, public.user_profiles.country),
    age = coalesce(excluded.age, public.user_profiles.age),
    education = coalesce(excluded.education, public.user_profiles.education),
    current_status = coalesce(excluded.current_status, public.user_profiles.current_status),
    employment_status = coalesce(excluded.employment_status, public.user_profiles.employment_status),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.user_profiles enable row level security;

drop policy if exists "Users can select own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;
drop policy if exists "Users can read their own profile" on public.user_profiles;
drop policy if exists "Users can insert their own profile" on public.user_profiles;
drop policy if exists "Users can update their own profile" on public.user_profiles;

create policy "Users can select own profile"
on public.user_profiles for select to authenticated
using (auth.uid() = user_id or auth.uid() = id);

create policy "Users can insert own profile"
on public.user_profiles for insert to authenticated
with check (auth.uid() = user_id or auth.uid() = id);

create policy "Users can update own profile"
on public.user_profiles for update to authenticated
using (auth.uid() = user_id or auth.uid() = id)
with check (auth.uid() = user_id or auth.uid() = id);
