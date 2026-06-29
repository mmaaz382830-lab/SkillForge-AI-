-- Secure RPC for deleting an owned quiz and cascading its children.

create or replace function public.delete_quiz(
  p_quiz_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return false;
  end if;

  delete from public.quizzes
  where id = p_quiz_id
    and user_id = auth.uid();

  return found;
end;
$$;

revoke all on function public.delete_quiz(uuid) from public;
revoke all on function public.delete_quiz(uuid) from anon;
grant execute on function public.delete_quiz(uuid) to authenticated;
