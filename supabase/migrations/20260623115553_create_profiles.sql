create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  role text not null default 'user'
    check (role in ('user', 'admin', 'blocked')),
  plan text not null default 'free'
    check (plan in ('free', 'pro', 'demo_admin')),
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles(email);
create index profiles_role_idx on public.profiles(role);
create index profiles_plan_idx on public.profiles(plan);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_profiles_updated_at();

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    plan
  )
  values (
    new.id,
    coalesce(new.email, new.raw_user_meta_data->>'email', ''),
    coalesce(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    coalesce(
      new.raw_user_meta_data->>'avatar_url',
      new.raw_user_meta_data->>'picture'
    ),
    'user',
    'free'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;

revoke all on public.profiles from anon, authenticated;

grant select on public.profiles to authenticated;
grant insert (id, email, full_name, avatar_url, last_active_at)
  on public.profiles to authenticated;
grant update (full_name, avatar_url, last_active_at)
  on public.profiles to authenticated;

create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and email = auth.jwt()->>'email'
  and role = 'user'
  and plan = 'free'
);

create policy "Users can update safe own profile fields"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());
