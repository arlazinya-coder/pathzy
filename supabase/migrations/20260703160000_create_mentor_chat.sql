create table if not exists public.mentor_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Career Mentor Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.mentor_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.mentor_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists mentor_conversations_user_updated_idx
on public.mentor_conversations (user_id, updated_at desc);

create index if not exists mentor_messages_conversation_created_idx
on public.mentor_messages (conversation_id, created_at asc);

alter table public.mentor_conversations enable row level security;
alter table public.mentor_messages enable row level security;

drop policy if exists "Users can read their own mentor conversations" on public.mentor_conversations;
drop policy if exists "Users can insert their own mentor conversations" on public.mentor_conversations;
drop policy if exists "Users can update their own mentor conversations" on public.mentor_conversations;
drop policy if exists "Users can read their own mentor messages" on public.mentor_messages;
drop policy if exists "Users can insert their own mentor messages" on public.mentor_messages;

create policy "Users can read their own mentor conversations"
on public.mentor_conversations
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own mentor conversations"
on public.mentor_conversations
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own mentor conversations"
on public.mentor_conversations
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can read their own mentor messages"
on public.mentor_messages
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert their own mentor messages"
on public.mentor_messages
for insert
to authenticated
with check (auth.uid() = user_id);
