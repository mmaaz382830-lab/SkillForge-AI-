drop policy if exists "Users can update own materials" on public.materials;
create policy "Users can update own materials"
on public.materials
for update
to authenticated
using (
  auth.uid() = user_id
  and deleted_at is null
)
with check (auth.uid() = user_id);
