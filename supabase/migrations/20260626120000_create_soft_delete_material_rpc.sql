create or replace function public.soft_delete_material(p_material_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
affected_count integer;
begin
update public.materials
set deleted_at = now()
where id = p_material_id
and user_id = auth.uid()
and deleted_at is null;

get diagnostics affected_count = row_count;

return affected_count > 0;
end;
$$;

revoke all on function public.soft_delete_material(uuid) from public;
grant execute on function public.soft_delete_material(uuid) to authenticated;