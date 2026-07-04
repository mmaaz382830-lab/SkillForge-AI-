alter table public.profiles
  add column if not exists default_quiz_difficulty text not null default 'beginner',
  add column if not exists default_roadmap_difficulty text not null default 'beginner';

update public.profiles
set
  default_quiz_difficulty = coalesce(default_quiz_difficulty, 'beginner'),
  default_roadmap_difficulty = coalesce(default_roadmap_difficulty, 'beginner');

alter table public.profiles
  alter column default_quiz_difficulty set default 'beginner',
  alter column default_quiz_difficulty set not null,
  alter column default_roadmap_difficulty set default 'beginner',
  alter column default_roadmap_difficulty set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_default_quiz_difficulty_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_default_quiz_difficulty_check
      check (default_quiz_difficulty in ('beginner', 'intermediate', 'advanced'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_default_roadmap_difficulty_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_default_roadmap_difficulty_check
      check (default_roadmap_difficulty in ('beginner', 'intermediate', 'advanced'));
  end if;
end $$;

grant update (default_quiz_difficulty, default_roadmap_difficulty)
  on public.profiles to authenticated;