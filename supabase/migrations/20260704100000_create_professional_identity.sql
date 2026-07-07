create table if not exists public.professional_identity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  language text not null default 'english' check (language in ('english', 'french')),
  professional_identity_score integer not null default 0 check (professional_identity_score >= 0 and professional_identity_score <= 100),
  cv_status text not null default 'not_started',
  cover_letter_status text not null default 'not_started',
  linkedin_status text not null default 'not_started',
  portfolio_status text not null default 'not_started',
  career_passport_status text not null default 'not_started',
  next_action text not null default 'Build your first CV from your PATHZY profile.',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cv_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null default 'english' check (language in ('english', 'french')),
  cv_type text not null default 'Entry-Level CV',
  title text not null,
  content text not null,
  score integer not null default 0 check (score >= 0 and score <= 100),
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cover_letters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null default 'english' check (language in ('english', 'french')),
  title text not null,
  company text,
  role text,
  content text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.linkedin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null default 'english' check (language in ('english', 'french')),
  headline text not null,
  about text not null,
  skills text[] not null default '{}',
  experience_summary text not null default '',
  optimization_score integer not null default 0 check (optimization_score >= 0 and optimization_score <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recruiter_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null default 'english' check (language in ('english', 'french')),
  company text,
  recruiter_name text,
  role text,
  message text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_up_emails (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null default 'english' check (language in ('english', 'french')),
  company text,
  role text,
  email_content text not null,
  follow_up_date date,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.career_passport_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null default 'english' check (language in ('english', 'french')),
  summary text not null,
  strengths text[] not null default '{}',
  skills text[] not null default '{}',
  career_goal text,
  readiness_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.professional_identity enable row level security;
alter table public.cv_documents enable row level security;
alter table public.cover_letters enable row level security;
alter table public.linkedin_profiles enable row level security;
alter table public.recruiter_messages enable row level security;
alter table public.follow_up_emails enable row level security;
alter table public.career_passport_summaries enable row level security;

drop policy if exists "Users can view own professional identity" on public.professional_identity;
drop policy if exists "Users can insert own professional identity" on public.professional_identity;
drop policy if exists "Users can update own professional identity" on public.professional_identity;
drop policy if exists "Users can delete own professional identity" on public.professional_identity;

create policy "Users can view own professional identity" on public.professional_identity for select using (auth.uid() = user_id);
create policy "Users can insert own professional identity" on public.professional_identity for insert with check (auth.uid() = user_id);
create policy "Users can update own professional identity" on public.professional_identity for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own professional identity" on public.professional_identity for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own CV documents" on public.cv_documents;
drop policy if exists "Users can insert own CV documents" on public.cv_documents;
drop policy if exists "Users can update own CV documents" on public.cv_documents;
drop policy if exists "Users can delete own CV documents" on public.cv_documents;

create policy "Users can view own CV documents" on public.cv_documents for select using (auth.uid() = user_id);
create policy "Users can insert own CV documents" on public.cv_documents for insert with check (auth.uid() = user_id);
create policy "Users can update own CV documents" on public.cv_documents for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own CV documents" on public.cv_documents for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own cover letters" on public.cover_letters;
drop policy if exists "Users can insert own cover letters" on public.cover_letters;
drop policy if exists "Users can update own cover letters" on public.cover_letters;
drop policy if exists "Users can delete own cover letters" on public.cover_letters;

create policy "Users can view own cover letters" on public.cover_letters for select using (auth.uid() = user_id);
create policy "Users can insert own cover letters" on public.cover_letters for insert with check (auth.uid() = user_id);
create policy "Users can update own cover letters" on public.cover_letters for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own cover letters" on public.cover_letters for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own LinkedIn profiles" on public.linkedin_profiles;
drop policy if exists "Users can insert own LinkedIn profiles" on public.linkedin_profiles;
drop policy if exists "Users can update own LinkedIn profiles" on public.linkedin_profiles;
drop policy if exists "Users can delete own LinkedIn profiles" on public.linkedin_profiles;

create policy "Users can view own LinkedIn profiles" on public.linkedin_profiles for select using (auth.uid() = user_id);
create policy "Users can insert own LinkedIn profiles" on public.linkedin_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own LinkedIn profiles" on public.linkedin_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own LinkedIn profiles" on public.linkedin_profiles for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own recruiter messages" on public.recruiter_messages;
drop policy if exists "Users can insert own recruiter messages" on public.recruiter_messages;
drop policy if exists "Users can update own recruiter messages" on public.recruiter_messages;
drop policy if exists "Users can delete own recruiter messages" on public.recruiter_messages;

create policy "Users can view own recruiter messages" on public.recruiter_messages for select using (auth.uid() = user_id);
create policy "Users can insert own recruiter messages" on public.recruiter_messages for insert with check (auth.uid() = user_id);
create policy "Users can update own recruiter messages" on public.recruiter_messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own recruiter messages" on public.recruiter_messages for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own follow up emails" on public.follow_up_emails;
drop policy if exists "Users can insert own follow up emails" on public.follow_up_emails;
drop policy if exists "Users can update own follow up emails" on public.follow_up_emails;
drop policy if exists "Users can delete own follow up emails" on public.follow_up_emails;

create policy "Users can view own follow up emails" on public.follow_up_emails for select using (auth.uid() = user_id);
create policy "Users can insert own follow up emails" on public.follow_up_emails for insert with check (auth.uid() = user_id);
create policy "Users can update own follow up emails" on public.follow_up_emails for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own follow up emails" on public.follow_up_emails for delete using (auth.uid() = user_id);

drop policy if exists "Users can view own career passport summaries" on public.career_passport_summaries;
drop policy if exists "Users can insert own career passport summaries" on public.career_passport_summaries;
drop policy if exists "Users can update own career passport summaries" on public.career_passport_summaries;
drop policy if exists "Users can delete own career passport summaries" on public.career_passport_summaries;

create policy "Users can view own career passport summaries" on public.career_passport_summaries for select using (auth.uid() = user_id);
create policy "Users can insert own career passport summaries" on public.career_passport_summaries for insert with check (auth.uid() = user_id);
create policy "Users can update own career passport summaries" on public.career_passport_summaries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own career passport summaries" on public.career_passport_summaries for delete using (auth.uid() = user_id);
