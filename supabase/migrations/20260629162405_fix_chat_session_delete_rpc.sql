-- /M/project7/supabase/migrations/20260629162405_fix_chat_session_delete_rpc.sql
-- Add RPC function to safely soft delete chat sessions

-- Drop existing policies to avoid conflicts with function

-- 1. RPC for soft deleting chat sessions (security definer, explicit user check)
create or replace function public.soft_delete_chat_session(
  p_session_id uuid
)
returns boolean
language plpgsql
security definer
as $$
begin
  -- Prevent public/anon access - explicitly check authenticated user
  if not (coalesce(current_setting('role', true) = 'authenticated', false)) then
    return false;
  end if;

  -- Explicit ownership check using auth.uid()
  update public.chat_sessions
  set
    deleted_at = now(),
    updated_at = now()
  where
    id = p_session_id
    and user_id = auth.uid()
    and deleted_at is null;

  return found;
end;
$$;

-- Grant execute only to authenticated role
revoke all on function public.soft_delete_chat_session from public;
grant execute on function public.soft_delete_chat_session to authenticated;
