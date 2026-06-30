-- Day 9 Admin read policies for profiles and usage_logs

drop policy if exists "Admins can select all profiles" on public.profiles;
create policy "Admins can select all profiles"
on public.profiles
for select
to authenticated
using (public.is_admin(auth.uid()));

drop policy if exists "Admins can select all usage logs" on public.usage_logs;
create policy "Admins can select all usage logs"
on public.usage_logs
for select
to authenticated
using (public.is_admin(auth.uid()));
