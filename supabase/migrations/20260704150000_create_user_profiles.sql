create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  country text,
  city text,
  language text default 'English',
  education text,
  field_of_study text,
  employment_status text,
  career_goal text,
  linkedin_url text,
  portfolio_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint user_profiles_user_id_key unique (user_id)
);

alter table public.user_profiles
add column if not exists user_id uuid references auth.users(id) on delete cascade,
add column if not exists phone text,
add column if not exists city text,
add column if not exists language text default 'English',
add column if not exists field_of_study text,
add column if not exists employment_status text,
add column if not exists career_goal text,
add column if not exists linkedin_url text,
add column if not exists portfolio_url text,
add column if not exists updated_at timestamptz default now();

update public.user_profiles
set user_id = id
where user_id is null;

alter table public.user_profiles
alter column user_id set not null;

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

alter table public.user_profiles enable row level security;

drop policy if exists "Users can select own profile" on public.user_profiles;
drop policy if exists "Users can insert own profile" on public.user_profiles;
drop policy if exists "Users can update own profile" on public.user_profiles;

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
