-- Run after 01-messaging-backend.sql. Prevents recursive RLS checks that cause REST 500 errors.
create or replace function public.is_conversation_participant(target_conversation_id uuid)
returns boolean language sql security definer stable set search_path=public as $$
  select exists(select 1 from public.conversation_participants where conversation_id=target_conversation_id and user_id=auth.uid());
$$;
grant execute on function public.is_conversation_participant(uuid) to authenticated;
drop policy if exists "participants read conversations" on public.conversations;
create policy "participants read conversations" on public.conversations for select to authenticated using(public.is_conversation_participant(id));
drop policy if exists "participants read participant rows" on public.conversation_participants;
create policy "participants read participant rows" on public.conversation_participants for select to authenticated using(public.is_conversation_participant(conversation_id));
drop policy if exists "participants read messages" on public.messages;
create policy "participants read messages" on public.messages for select to authenticated using(public.is_conversation_participant(conversation_id));
drop policy if exists "participants send messages" on public.messages;
create policy "participants send messages" on public.messages for insert to authenticated with check(sender_id=auth.uid() and public.is_conversation_participant(conversation_id));
