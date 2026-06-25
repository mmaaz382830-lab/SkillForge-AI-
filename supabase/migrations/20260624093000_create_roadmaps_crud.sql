create extension if not exists pgcrypto;

create table if not exists public.learning_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  target_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal_id uuid references public.learning_goals(id) on delete set null,
  title text not null,
  description text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_duration text,
  ai_generated boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roadmap_tasks (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.roadmaps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'completed')),
  order_index integer not null,
  estimated_time text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists learning_goals_user_id_idx
  on public.learning_goals(user_id);
create index if not exists learning_goals_user_created_idx
  on public.learning_goals(user_id, created_at desc);

create index if not exists roadmaps_user_id_idx
  on public.roadmaps(user_id);
create index if not exists roadmaps_goal_id_idx
  on public.roadmaps(goal_id);
create index if not exists roadmaps_user_created_idx
  on public.roadmaps(user_id, created_at desc);

create index if not exists roadmap_tasks_user_id_idx
  on public.roadmap_tasks(user_id);
create index if not exists roadmap_tasks_roadmap_id_idx
  on public.roadmap_tasks(roadmap_id);
create unique index if not exists roadmap_tasks_order_idx
  on public.roadmap_tasks(roadmap_id, order_index);
create index if not exists roadmap_tasks_user_status_idx
  on public.roadmap_tasks(user_id, status);

create index if not exists progress_events_user_id_idx
  on public.progress_events(user_id);
create index if not exists progress_events_user_created_idx
  on public.progress_events(user_id, created_at desc);
create index if not exists progress_events_entity_idx
  on public.progress_events(entity_type, entity_id);

drop trigger if exists set_learning_goals_updated_at on public.learning_goals;
create trigger set_learning_goals_updated_at
before update on public.learning_goals
for each row
execute function public.set_profiles_updated_at();

drop trigger if exists set_roadmaps_updated_at on public.roadmaps;
create trigger set_roadmaps_updated_at
before update on public.roadmaps
for each row
execute function public.set_profiles_updated_at();

drop trigger if exists set_roadmap_tasks_updated_at on public.roadmap_tasks;
create trigger set_roadmap_tasks_updated_at
before update on public.roadmap_tasks
for each row
execute function public.set_profiles_updated_at();

alter table public.learning_goals enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_tasks enable row level security;
alter table public.progress_events enable row level security;

revoke all on public.learning_goals from anon, authenticated;
revoke all on public.roadmaps from anon, authenticated;
revoke all on public.roadmap_tasks from anon, authenticated;
revoke all on public.progress_events from anon, authenticated;

grant select, insert, update, delete on public.learning_goals to authenticated;
grant select, insert, update, delete on public.roadmaps to authenticated;
grant select, insert, update, delete on public.roadmap_tasks to authenticated;
grant select, insert on public.progress_events to authenticated;

drop policy if exists "Users can manage own learning goals" on public.learning_goals;
create policy "Users can manage own learning goals"
on public.learning_goals
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can manage own roadmaps" on public.roadmaps;
create policy "Users can manage own roadmaps"
on public.roadmaps
for all
to authenticated
using (
  user_id = auth.uid()
  and (
    goal_id is null
    or exists (
      select 1
      from public.learning_goals
      where learning_goals.id = roadmaps.goal_id
        and learning_goals.user_id = auth.uid()
    )
  )
)
with check (
  user_id = auth.uid()
  and (
    goal_id is null
    or exists (
      select 1
      from public.learning_goals
      where learning_goals.id = roadmaps.goal_id
        and learning_goals.user_id = auth.uid()
    )
  )
);

drop policy if exists "Users can manage own roadmap tasks" on public.roadmap_tasks;
create policy "Users can manage own roadmap tasks"
on public.roadmap_tasks
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.roadmaps
    where roadmaps.id = roadmap_tasks.roadmap_id
      and roadmaps.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.roadmaps
    where roadmaps.id = roadmap_tasks.roadmap_id
      and roadmaps.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own progress events" on public.progress_events;
create policy "Users can read own progress events"
on public.progress_events
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create own progress events" on public.progress_events;
create policy "Users can create own progress events"
on public.progress_events
for insert
to authenticated
with check (user_id = auth.uid());
