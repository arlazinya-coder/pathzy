alter table public.user_profiles
drop constraint if exists user_profiles_premium_status_check;

update public.user_profiles
set premium_status = case
  when premium_status = 'free' then 'starter'
  when premium_status = 'annual' then 'premium'
  when premium_status in ('starter', 'pro', 'premium', 'enterprise') then premium_status
  else 'starter'
end;

alter table public.user_profiles
alter column premium_status set default 'starter';

alter table public.user_profiles
add constraint user_profiles_premium_status_check
check (premium_status in ('starter', 'pro', 'premium', 'enterprise'));

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
    premium_status
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    new.raw_user_meta_data ->> 'country',
    nullif(new.raw_user_meta_data ->> 'age', '')::integer,
    new.raw_user_meta_data ->> 'education',
    new.raw_user_meta_data ->> 'current_status',
    'starter'
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
