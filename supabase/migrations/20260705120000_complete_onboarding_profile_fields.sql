alter table public.user_profiles
add column if not exists onboarding_completed boolean not null default false,
add column if not exists onboarding_step integer not null default 1,
add column if not exists email text,
add column if not exists full_name text,
add column if not exists age integer,
add column if not exists country text,
add column if not exists city text,
add column if not exists language text default 'English',
add column if not exists education text,
add column if not exists highest_qualification text,
add column if not exists field_of_study text,
add column if not exists currently_studying boolean not null default false,
add column if not exists institution text,
add column if not exists graduation_year text,
add column if not exists current_status text,
add column if not exists employment_status text,
add column if not exists has_cv boolean not null default false,
add column if not exists has_cover_letter boolean not null default false,
add column if not exists has_linkedin boolean not null default false,
add column if not exists has_applied_before boolean not null default false,
add column if not exists has_interviewed_before boolean not null default false,
add column if not exists has_certificates boolean not null default false,
add column if not exists starting_from_zero boolean not null default false,
add column if not exists career_goal text,
add column if not exists preferred_path text,
add column if not exists founder boolean not null default false,
add column if not exists premium boolean not null default false,
add column if not exists premium_status text default 'free',
add column if not exists plan text default 'free',
add column if not exists mentor_messages_today integer not null default 0,
add column if not exists mentor_messages_date date,
add column if not exists founder_member_number integer,
add column if not exists premium_expires_at timestamptz,
add column if not exists membership_type text,
add column if not exists updated_at timestamptz default now();

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.user_profiles'::regclass
      and pg_get_constraintdef(oid) ilike '%language%'
  loop
    execute format('alter table public.user_profiles drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

do $$
declare
  constraint_record record;
begin
  for constraint_record in
    select conname
    from pg_constraint
    where conrelid = 'public.user_profiles'::regclass
      and pg_get_constraintdef(oid) ilike '%current_status%'
  loop
    execute format('alter table public.user_profiles drop constraint if exists %I', constraint_record.conname);
  end loop;
end $$;

alter table public.user_profiles
alter column language set default 'English',
alter column onboarding_completed set default false,
alter column onboarding_step set default 1,
alter column currently_studying set default false,
alter column has_cv set default false,
alter column has_cover_letter set default false,
alter column has_linkedin set default false,
alter column has_applied_before set default false,
alter column has_interviewed_before set default false,
alter column has_certificates set default false,
alter column starting_from_zero set default false,
alter column founder set default false,
alter column premium set default false,
alter column premium_status set default 'free',
alter column plan set default 'free',
alter column mentor_messages_today set default 0,
alter column updated_at set default now();

update public.user_profiles
set
  onboarding_completed = coalesce(onboarding_completed, false),
  onboarding_step = coalesce(onboarding_step, 1),
  currently_studying = coalesce(currently_studying, false),
  has_cv = coalesce(has_cv, false),
  has_cover_letter = coalesce(has_cover_letter, false),
  has_linkedin = coalesce(has_linkedin, false),
  has_applied_before = coalesce(has_applied_before, false),
  has_interviewed_before = coalesce(has_interviewed_before, false),
  has_certificates = coalesce(has_certificates, false),
  starting_from_zero = coalesce(starting_from_zero, false),
  founder = coalesce(founder, false),
  premium = coalesce(premium, false),
  premium_status = coalesce(premium_status, 'free'),
  plan = coalesce(plan, 'free'),
  mentor_messages_today = coalesce(mentor_messages_today, 0),
  updated_at = coalesce(updated_at, now());

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.user_profiles'::regclass
      and conname = 'user_profiles_user_id_unique'
  ) then
    alter table public.user_profiles add constraint user_profiles_user_id_unique unique (user_id);
  end if;
end $$;
