create extension if not exists pgcrypto;

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score numeric not null default 0
    check (score >= 0 and score <= 100),
  total_questions integer not null
    check (total_questions >= 0),
  correct_count integer not null default 0
    check (correct_count >= 0),
  answers jsonb not null default '{}'::jsonb
    check (jsonb_typeof(answers) = 'object'),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  check (correct_count <= total_questions)
);

create index if not exists quiz_attempts_quiz_id_idx
  on public.quiz_attempts(quiz_id);
create index if not exists quiz_attempts_user_id_idx
  on public.quiz_attempts(user_id);
create index if not exists quiz_attempts_user_completed_idx
  on public.quiz_attempts(user_id, completed_at desc);

alter table public.quiz_attempts enable row level security;

revoke all on public.quiz_attempts from anon, authenticated;
grant select, insert, update on public.quiz_attempts to authenticated;

drop policy if exists "Users can read own quiz attempts for own quizzes" on public.quiz_attempts;
create policy "Users can read own quiz attempts for own quizzes"
on public.quiz_attempts
for select
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.quizzes
    where quizzes.id = quiz_attempts.quiz_id
      and quizzes.user_id = auth.uid()
  )
);

drop policy if exists "Users can create own quiz attempts for own quizzes" on public.quiz_attempts;
create policy "Users can create own quiz attempts for own quizzes"
on public.quiz_attempts
for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.quizzes
    where quizzes.id = quiz_attempts.quiz_id
      and quizzes.user_id = auth.uid()
  )
);

drop policy if exists "Users can update own quiz attempts for own quizzes" on public.quiz_attempts;
create policy "Users can update own quiz attempts for own quizzes"
on public.quiz_attempts
for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.quizzes
    where quizzes.id = quiz_attempts.quiz_id
      and quizzes.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.quizzes
    where quizzes.id = quiz_attempts.quiz_id
      and quizzes.user_id = auth.uid()
  )
);
