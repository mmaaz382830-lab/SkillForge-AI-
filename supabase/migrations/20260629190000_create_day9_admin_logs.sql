create extension if not exists pgcrypto;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = check_user_id
      and check_user_id = auth.uid()
      and profiles.role = 'admin'
  );
$$;

revoke all on function public.is_admin(uuid) from public;
grant execute on function public.is_admin(uuid) to authenticated;

create table if not exists public.api_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  route text not null,
  method text,
  feature_type text,
  status text not null
    check (status in ('success', 'blocked', 'error')),
  status_code integer
    check (status_code is null or (status_code >= 100 and status_code <= 599)),
  duration_ms integer
    check (duration_ms is null or duration_ms >= 0),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  category text not null,
  safe_message text not null,
  source text,
  feature_type text,
  severity text not null default 'error'
    check (severity in ('info', 'warning', 'error')),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references public.profiles(id) on delete set null,
  target_user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_type text,
  target_id uuid,
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists api_logs_user_created_idx
  on public.api_logs(user_id, created_at desc);
create index if not exists api_logs_route_created_idx
  on public.api_logs(route, created_at desc);
create index if not exists api_logs_feature_status_created_idx
  on public.api_logs(feature_type, status, created_at desc);

create index if not exists error_logs_user_created_idx
  on public.error_logs(user_id, created_at desc);
create index if not exists error_logs_category_created_idx
  on public.error_logs(category, created_at desc);
create index if not exists error_logs_severity_created_idx
  on public.error_logs(severity, created_at desc);

create index if not exists admin_actions_admin_created_idx
  on public.admin_actions(admin_user_id, created_at desc);
create index if not exists admin_actions_target_user_created_idx
  on public.admin_actions(target_user_id, created_at desc);
create index if not exists admin_actions_action_created_idx
  on public.admin_actions(action, created_at desc);

alter table public.api_logs enable row level security;
alter table public.error_logs enable row level security;
alter table public.admin_actions enable row level security;

revoke all on public.api_logs from anon, authenticated;
revoke all on public.error_logs from anon, authenticated;
revoke all on public.admin_actions from anon, authenticated;

grant select, insert on public.api_logs to authenticated;
grant select, insert on public.error_logs to authenticated;
grant select, insert on public.admin_actions to authenticated;

drop policy if exists "Admins can read api logs" on public.api_logs;
create policy "Admins can read api logs"
on public.api_logs
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Authenticated users can create safe api logs" on public.api_logs;
create policy "Authenticated users can create safe api logs"
on public.api_logs
for insert
to authenticated
with check (
  user_id is null
  or user_id = auth.uid()
);

drop policy if exists "Admins can read error logs" on public.error_logs;
create policy "Admins can read error logs"
on public.error_logs
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Authenticated users can create safe error logs" on public.error_logs;
create policy "Authenticated users can create safe error logs"
on public.error_logs
for insert
to authenticated
with check (
  user_id is null
  or user_id = auth.uid()
);

drop policy if exists "Admins can read admin actions" on public.admin_actions;
create policy "Admins can read admin actions"
on public.admin_actions
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can create admin actions" on public.admin_actions;
create policy "Admins can create admin actions"
on public.admin_actions
for insert
to authenticated
with check (
  admin_user_id = auth.uid()
  and public.is_admin(auth.uid())
);
