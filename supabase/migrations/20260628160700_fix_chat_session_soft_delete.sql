drop policy if exists "Users can update own chat sessions" on public.chat_sessions;
drop policy if exists "Users can select own chat sessions" on public.chat_sessions;

create policy "Users can select own chat sessions"
on public.chat_sessions
for select
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
);

create policy "Users can update own chat sessions"
on public.chat_sessions
for update
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
)
with check (
  user_id = auth.uid()
);
