-- NeedThingsDone: first real backend (profiles + direct messaging + notifications)
-- Run this entire file once in Supabase Dashboard > SQL Editor > New query.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'NeedThingsDone member',
  avatar_url text,
  account_type text not null default 'visitor' check (account_type in ('visitor','customer','individual','business','shop','large-business','admin')),
  headline text,
  city text,
  province text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz not null default now(),
  archived boolean not null default false,
  primary key (conversation_id, user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists participants_user_idx on public.conversation_participants(user_id);
create index if not exists notifications_user_created_idx on public.notifications(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Profiles are visible to signed-in members; each person controls only their own profile.
drop policy if exists "profiles readable by authenticated users" on public.profiles;
create policy "profiles readable by authenticated users" on public.profiles for select to authenticated using (true);
drop policy if exists "users insert own profile" on public.profiles;
create policy "users insert own profile" on public.profiles for insert to authenticated with check (auth.uid() = id);
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Conversation data is visible only to participants.
drop policy if exists "participants read conversations" on public.conversations;
create policy "participants read conversations" on public.conversations for select to authenticated using (
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = id and cp.user_id = auth.uid())
);
drop policy if exists "authenticated create conversations" on public.conversations;
create policy "authenticated create conversations" on public.conversations for insert to authenticated with check (created_by = auth.uid());

drop policy if exists "participants read participant rows" on public.conversation_participants;
create policy "participants read participant rows" on public.conversation_participants for select to authenticated using (
  exists (select 1 from public.conversation_participants mine where mine.conversation_id = conversation_id and mine.user_id = auth.uid())
);
drop policy if exists "participants update own participant row" on public.conversation_participants;
create policy "participants update own participant row" on public.conversation_participants for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages for select to authenticated using (
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
);
drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages for insert to authenticated with check (
  sender_id = auth.uid() and exists (select 1 from public.conversation_participants cp where cp.conversation_id = messages.conversation_id and cp.user_id = auth.uid())
);

drop policy if exists "users read own notifications" on public.notifications;
create policy "users read own notifications" on public.notifications for select to authenticated using (user_id = auth.uid());
drop policy if exists "users update own notifications" on public.notifications;
create policy "users update own notifications" on public.notifications for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Automatically create/update a basic profile whenever Auth creates a user.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'NeedThingsDone member'),
    coalesce(new.raw_user_meta_data->>'account_type', 'visitor')
  ) on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Backfill profiles for accounts that existed before this SQL was installed.
insert into public.profiles (id, display_name, account_type)
select id, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'display_name', split_part(email, '@', 1), 'NeedThingsDone member'), coalesce(raw_user_meta_data->>'account_type', 'visitor')
from auth.users on conflict (id) do nothing;

-- Safely creates or reuses a one-to-one conversation.
create or replace function public.get_or_create_direct_conversation(other_user_id uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare existing_id uuid; new_id uuid;
begin
  if auth.uid() is null then raise exception 'You must be signed in'; end if;
  if other_user_id = auth.uid() then raise exception 'You cannot message yourself'; end if;
  if not exists (select 1 from auth.users where id = other_user_id) then raise exception 'Recipient not found'; end if;

  select c.id into existing_id
  from conversations c
  join conversation_participants me on me.conversation_id=c.id and me.user_id=auth.uid()
  join conversation_participants them on them.conversation_id=c.id and them.user_id=other_user_id
  where (select count(*) from conversation_participants x where x.conversation_id=c.id)=2
  limit 1;
  if existing_id is not null then return existing_id; end if;

  insert into conversations(created_by) values(auth.uid()) returning id into new_id;
  insert into conversation_participants(conversation_id,user_id) values(new_id,auth.uid()),(new_id,other_user_id);
  return new_id;
end;
$$;
grant execute on function public.get_or_create_direct_conversation(uuid) to authenticated;

create or replace function public.get_my_conversations()
returns table (
  conversation_id uuid, created_at timestamptz, last_message_at timestamptz, archived boolean,
  other_user_id uuid, other_display_name text, other_avatar_url text, other_account_type text,
  other_headline text, other_location text, last_message text, unread_count bigint
) language sql security definer set search_path = public stable as $$
  select c.id, c.created_at, c.last_message_at, me.archived,
    other.user_id, coalesce(p.display_name,'NeedThingsDone member'), p.avatar_url, coalesce(p.account_type,'visitor'),
    p.headline, concat_ws(', ', nullif(p.city,''), nullif(p.province,'')),
    (select m.body from messages m where m.conversation_id=c.id order by m.created_at desc limit 1),
    (select count(*) from messages m where m.conversation_id=c.id and m.sender_id<>auth.uid() and m.created_at>me.last_read_at)
  from conversations c
  join conversation_participants me on me.conversation_id=c.id and me.user_id=auth.uid()
  join conversation_participants other on other.conversation_id=c.id and other.user_id<>auth.uid()
  left join profiles p on p.id=other.user_id
  order by c.last_message_at desc;
$$;
grant execute on function public.get_my_conversations() to authenticated;

create or replace function public.mark_conversation_read(target_conversation_id uuid)
returns void language sql security definer set search_path = public as $$
  update conversation_participants set last_read_at=now() where conversation_id=target_conversation_id and user_id=auth.uid();
$$;
grant execute on function public.mark_conversation_read(uuid) to authenticated;

create or replace function public.archive_conversation(target_conversation_id uuid)
returns void language sql security definer set search_path = public as $$
  update conversation_participants set archived=true where conversation_id=target_conversation_id and user_id=auth.uid();
$$;
grant execute on function public.archive_conversation(uuid) to authenticated;

create or replace function public.after_message_insert() returns trigger language plpgsql security definer set search_path = public as $$
declare recipient uuid; sender_name text;
begin
  update conversations set last_message_at=new.created_at where id=new.conversation_id;
  select user_id into recipient from conversation_participants where conversation_id=new.conversation_id and user_id<>new.sender_id limit 1;
  select display_name into sender_name from profiles where id=new.sender_id;
  if recipient is not null then
    insert into notifications(user_id,type,title,body,link)
    values(recipient,'message','New message from '||coalesce(sender_name,'a NeedThingsDone member'),left(new.body,160),'pages/messages.html');
  end if;
  return new;
end;
$$;
drop trigger if exists after_message_insert on public.messages;
create trigger after_message_insert after insert on public.messages for each row execute procedure public.after_message_insert();

-- Realtime support. Duplicate-object errors here are harmless if a table was already added.
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; end $$;
