do $$
declare
  policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'materials'
      and cmd = 'UPDATE'
  loop
    execute format(
      'drop policy if exists %I on public.materials',
      policy_record.policyname
    );
  end loop;
end;
$$;

grant update on public.materials to authenticated;

create policy "Users can update own materials"
on public.materials
for update
to authenticated
using (
  auth.uid() = user_id
  and deleted_at is null
)
with check (
  auth.uid() = user_id
);