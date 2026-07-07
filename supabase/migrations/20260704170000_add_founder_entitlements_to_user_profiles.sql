alter table public.user_profiles
add column if not exists founder boolean not null default false,
add column if not exists premium boolean not null default false,
add column if not exists founder_member_number integer,
add column if not exists premium_expires_at timestamptz,
add column if not exists membership_type text;

create index if not exists user_profiles_founder_idx
on public.user_profiles (founder, founder_member_number);
