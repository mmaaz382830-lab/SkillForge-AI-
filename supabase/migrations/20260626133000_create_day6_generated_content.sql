create extension if not exists pgcrypto;

alter table public.roadmaps
  add column if not exists material_id uuid references public.materials(id) on delete set null;

create index if not exists roadmaps_material_id_idx
  on public.roadmaps(material_id);

create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  topic text,
  card_count integer not null default 0
    check (card_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  front text not null,
  back text not null,
  topic text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  order_index integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  topic text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  question_count integer not null default 0
    check (question_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  options jsonb not null
    check (jsonb_typeof(options) = 'array'),
  correct_answer text not null,
  explanation text,
  topic text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  order_index integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature_type text not null
    check (feature_type in ('roadmap', 'flashcards', 'quiz', 'interview')),
  status text not null
    check (status in ('success', 'blocked', 'error')),
  period_key text not null,
  provider text not null default 'gemini',
  model text,
  error_code text,
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  goal_id uuid references public.learning_goals(id) on delete set null,
  topic text not null,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  status text not null default 'active'
    check (status in ('active', 'completed', 'abandoned')),
  overall_feedback text,
  score numeric,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null
    check (role in ('user', 'assistant', 'system')),
  content text not null,
  feedback jsonb,
  created_at timestamptz not null default now()
);

create index if not exists flashcard_decks_user_id_idx
  on public.flashcard_decks(user_id);
create index if not exists flashcard_decks_material_id_idx
  on public.flashcard_decks(material_id);
create index if not exists flashcard_decks_user_created_idx
  on public.flashcard_decks(user_id, created_at desc);

create index if not exists flashcards_deck_id_idx
  on public.flashcards(deck_id);
create index if not exists flashcards_user_id_idx
  on public.flashcards(user_id);
create unique index if not exists flashcards_deck_order_idx
  on public.flashcards(deck_id, order_index);

create index if not exists quizzes_user_id_idx
  on public.quizzes(user_id);
create index if not exists quizzes_material_id_idx
  on public.quizzes(material_id);
create index if not exists quizzes_user_created_idx
  on public.quizzes(user_id, created_at desc);

create index if not exists quiz_questions_quiz_id_idx
  on public.quiz_questions(quiz_id);
create index if not exists quiz_questions_user_id_idx
  on public.quiz_questions(user_id);
create unique index if not exists quiz_questions_quiz_order_idx
  on public.quiz_questions(quiz_id, order_index);

create index if not exists usage_logs_user_id_idx
  on public.usage_logs(user_id);
create index if not exists usage_logs_feature_idx
  on public.usage_logs(feature_type);
create index if not exists usage_logs_status_idx
  on public.usage_logs(status);
create index if not exists usage_logs_period_idx
  on public.usage_logs(period_key);
create index if not exists usage_logs_user_feature_period_status_idx
  on public.usage_logs(user_id, feature_type, period_key, status);
create index if not exists usage_logs_user_created_idx
  on public.usage_logs(user_id, created_at desc);

create index if not exists interview_sessions_user_id_idx
  on public.interview_sessions(user_id);
create index if not exists interview_sessions_material_id_idx
  on public.interview_sessions(material_id);
create index if not exists interview_sessions_goal_id_idx
  on public.interview_sessions(goal_id);
create index if not exists interview_sessions_user_created_idx
  on public.interview_sessions(user_id, created_at desc);

create index if not exists interview_messages_session_id_idx
  on public.interview_messages(session_id);
create index if not exists interview_messages_user_id_idx
  on public.interview_messages(user_id);
create index if not exists interview_messages_session_created_idx
  on public.interview_messages(session_id, created_at asc);

drop trigger if exists set_flashcard_decks_updated_at on public.flashcard_decks;
create trigger set_flashcard_decks_updated_at
before update on public.flashcard_decks
for each row
execute function public.set_profiles_updated_at();

drop trigger if exists set_flashcards_updated_at on public.flashcards;
create trigger set_flashcards_updated_at
before update on public.flashcards
for each row
execute function public.set_profiles_updated_at();

drop trigger if exists set_quizzes_updated_at on public.quizzes;
create trigger set_quizzes_updated_at
before update on public.quizzes
for each row
execute function public.set_profiles_updated_at();

alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.usage_logs enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_messages enable row level security;

revoke all on public.flashcard_decks from anon, authenticated;
revoke all on public.flashcards from anon, authenticated;
revoke all on public.quizzes from anon, authenticated;
revoke all on public.quiz_questions from anon, authenticated;
revoke all on public.usage_logs from anon, authenticated;
revoke all on public.interview_sessions from anon, authenticated;
revoke all on public.interview_messages from anon, authenticated;

grant select, insert, update, delete on public.flashcard_decks to authenticated;
grant select, insert, update, delete on public.flashcards to authenticated;
grant select, insert, update, delete on public.quizzes to authenticated;
grant select, insert, update, delete on public.quiz_questions to authenticated;
grant select, insert on public.usage_logs to authenticated;
grant select, insert, update, delete on public.interview_sessions to authenticated;
grant select, insert, update, delete on public.interview_messages to authenticated;

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
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = roadmaps.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
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
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = roadmaps.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
);

drop policy if exists "Users can manage own flashcard decks" on public.flashcard_decks;
create policy "Users can manage own flashcard decks"
on public.flashcard_decks
for all
to authenticated
using (
  user_id = auth.uid()
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = flashcard_decks.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
)
with check (
  user_id = auth.uid()
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = flashcard_decks.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
);

drop policy if exists "Users can manage own flashcards" on public.flashcards;
create policy "Users can manage own flashcards"
on public.flashcards
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.flashcard_decks
    where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.flashcard_decks
    where flashcard_decks.id = flashcards.deck_id
      and flashcard_decks.user_id = auth.uid()
  )
);

drop policy if exists "Users can manage own quizzes" on public.quizzes;
create policy "Users can manage own quizzes"
on public.quizzes
for all
to authenticated
using (
  user_id = auth.uid()
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = quizzes.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
)
with check (
  user_id = auth.uid()
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = quizzes.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
);

drop policy if exists "Users can manage own quiz questions" on public.quiz_questions;
create policy "Users can manage own quiz questions"
on public.quiz_questions
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.quizzes
    where quizzes.id = quiz_questions.quiz_id
      and quizzes.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.quizzes
    where quizzes.id = quiz_questions.quiz_id
      and quizzes.user_id = auth.uid()
  )
);

drop policy if exists "Users can read own usage logs" on public.usage_logs;
create policy "Users can read own usage logs"
on public.usage_logs
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "Users can create own usage logs" on public.usage_logs;
create policy "Users can create own usage logs"
on public.usage_logs
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can manage own interview sessions" on public.interview_sessions;
create policy "Users can manage own interview sessions"
on public.interview_sessions
for all
to authenticated
using (
  user_id = auth.uid()
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = interview_sessions.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
  and (
    goal_id is null
    or exists (
      select 1
      from public.learning_goals
      where learning_goals.id = interview_sessions.goal_id
        and learning_goals.user_id = auth.uid()
    )
  )
)
with check (
  user_id = auth.uid()
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = interview_sessions.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
  and (
    goal_id is null
    or exists (
      select 1
      from public.learning_goals
      where learning_goals.id = interview_sessions.goal_id
        and learning_goals.user_id = auth.uid()
    )
  )
);

drop policy if exists "Users can manage own interview messages" on public.interview_messages;
create policy "Users can manage own interview messages"
on public.interview_messages
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.interview_sessions
    where interview_sessions.id = interview_messages.session_id
      and interview_sessions.user_id = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.interview_sessions
    where interview_sessions.id = interview_messages.session_id
      and interview_sessions.user_id = auth.uid()
  )
);