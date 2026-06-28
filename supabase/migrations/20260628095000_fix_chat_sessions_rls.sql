-- Drop the existing ALL-in-one policy on chat_sessions
drop policy if exists "Users can manage own chat sessions" on public.chat_sessions;

-- 1. SELECT policy: only show active sessions
create policy "Users can select own chat sessions"
on public.chat_sessions
for select
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
);

-- 2. INSERT policy: allow inserting new sessions
create policy "Users can insert own chat sessions"
on public.chat_sessions
for insert
to authenticated
with check (
  user_id = auth.uid()
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = chat_sessions.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
);

-- 3. UPDATE policy: allow updating active sessions (permits setting deleted_at for soft delete)
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
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = chat_sessions.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
);

-- 4. DELETE policy: allow actual deletion if necessary (or soft-deleted rows)
create policy "Users can delete own chat sessions"
on public.chat_sessions
for delete
to authenticated
using (
  user_id = auth.uid()
);
