-- /M/project7/supabase/migrations/20260629162406_reset_chat_session_rls.sql
-- Reset RLS to INSERT and SELECT only (DELETE via RPC)

drop policy if exists "Users can insert own chat sessions" on public.chat_sessions;
drop policy if exists "Users can select own chat sessions" on public.chat_sessions;
drop policy if exists "Users can update own chat sessions" on public.chat_sessions;
drop policy if exists "Users can delete own chat sessions" on public.chat_sessions;

-- Only INSERT and SELECT policies (for UI operations)
create policy "Users can select own chat sessions"
on public.chat_sessions
for select
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
);

create policy "Users can insert own chat sessions"
on public.chat_sessions
for insert
to authenticated
with check (
  user_id = auth.uid()
);

-- Note: DELETE operations will use soft_delete_chat_session() RPC
-- Chat session updates (title renaming, touches) should use UPDATE policy
-- but will be removed in a follow-up if needed.
