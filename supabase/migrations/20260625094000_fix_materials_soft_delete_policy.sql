drop policy if exists "Users can update own materials" on public.materials;
create policy "Users can update own materials"
on public.materials
for update
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
)
with check (user_id = auth.uid());
