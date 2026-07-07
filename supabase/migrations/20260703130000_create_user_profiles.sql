create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  country text,
  age integer check (age is null or age between 16 and 30),
  education text,
  current_status text check (
    current_status is null
    or current_status in ('student', 'unemployed', 'employed', 'entrepreneur')
  ),
  premium_status text not null default 'starter' check (premium_status in ('starter', 'pro', 'premium', 'enterprise')),
  plan text not null default 'free' check (plan in ('free', 'starter', 'pro', 'premium', 'enterprise')),
  mentor_messages_today integer not null default 0 check (mentor_messages_today >= 0),
  mentor_messages_date date,
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;

create policy "Users can read their own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert their own profile"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update their own profile"
on public.user_profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (
    id,
    full_name,
    email,
    country,
    age,
    education,
    current_status,
    premium_status,
    plan,
    mentor_messages_today,
    mentor_messages_date
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'country',
    nullif(new.raw_user_meta_data ->> 'age', '')::integer,
    new.raw_user_meta_data ->> 'education',
    new.raw_user_meta_data ->> 'current_status',
    'starter',
    'free',
    0,
    current_date
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    country = excluded.country,
    age = excluded.age,
    education = excluded.education,
    current_status = excluded.current_status;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
