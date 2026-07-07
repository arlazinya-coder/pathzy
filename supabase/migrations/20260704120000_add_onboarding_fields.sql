alter table public.user_profiles
add column if not exists city text,
add column if not exists language text not null default 'english' check (language in ('english', 'french')),
add column if not exists highest_qualification text,
add column if not exists field_of_study text,
add column if not exists currently_studying boolean not null default false,
add column if not exists dream_career text,
add column if not exists preferred_industries text,
add column if not exists desired_work_type text check (desired_work_type is null or desired_work_type in ('remote', 'hybrid', 'onsite')),
add column if not exists has_cv boolean not null default false,
add column if not exists has_linkedin boolean not null default false,
add column if not exists applied_before boolean not null default false,
add column if not exists interviewed_before boolean not null default false,
add column if not exists onboarding_completed_at timestamptz;

alter table public.user_profiles
drop constraint if exists user_profiles_current_status_check;

alter table public.user_profiles
add constraint user_profiles_current_status_check check (
  current_status is null
  or current_status in ('student', 'graduate', 'looking_first_job', 'unemployed', 'career_changer', 'employed', 'entrepreneur')
);
