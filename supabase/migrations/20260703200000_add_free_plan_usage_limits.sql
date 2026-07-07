alter table public.user_profiles
add column if not exists plan text not null default 'free';

alter table public.user_profiles
add column if not exists mentor_messages_today integer not null default 0;

alter table public.user_profiles
add column if not exists mentor_messages_date date;

alter table public.user_profiles
drop constraint if exists user_profiles_plan_check;

alter table public.user_profiles
add constraint user_profiles_plan_check
check (plan in ('free', 'starter', 'pro', 'premium', 'enterprise'));

alter table public.user_profiles
drop constraint if exists user_profiles_mentor_messages_today_check;

alter table public.user_profiles
add constraint user_profiles_mentor_messages_today_check
check (mentor_messages_today >= 0);

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
