create extension if not exists vector;

create table if not exists public.material_chunks (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  chunk_index integer not null
    check (chunk_index >= 0),
  content text not null,
  character_count integer not null
    check (character_count > 0),
  token_count integer
    check (token_count is null or token_count >= 0),
  embedding vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  unique (material_id, chunk_index)
);

create table if not exists public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null
    check (role in ('user', 'assistant')),
  content text not null,
  source_chunk_ids jsonb
    check (source_chunk_ids is null or jsonb_typeof(source_chunk_ids) = 'array'),
  metadata jsonb not null default '{}'::jsonb
    check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);

create index if not exists material_chunks_user_id_idx
  on public.material_chunks(user_id);
create index if not exists material_chunks_material_id_idx
  on public.material_chunks(material_id);
create index if not exists material_chunks_user_material_idx
  on public.material_chunks(user_id, material_id);
create index if not exists material_chunks_material_chunk_index_idx
  on public.material_chunks(material_id, chunk_index);
do $$
begin
  if exists (select 1 from pg_am where amname = 'hnsw') then
    execute 'create index if not exists material_chunks_embedding_hnsw_idx on public.material_chunks using hnsw (embedding vector_cosine_ops)';
  else
    execute 'create index if not exists material_chunks_embedding_ivfflat_idx on public.material_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100)';
  end if;
end;
$$;

create index if not exists chat_sessions_user_id_idx
  on public.chat_sessions(user_id);
create index if not exists chat_sessions_user_material_idx
  on public.chat_sessions(user_id, material_id);
create index if not exists chat_sessions_user_created_idx
  on public.chat_sessions(user_id, created_at desc)
  where deleted_at is null;

create index if not exists chat_messages_chat_session_id_idx
  on public.chat_messages(chat_session_id);
create index if not exists chat_messages_user_id_idx
  on public.chat_messages(user_id);
create index if not exists chat_messages_session_created_idx
  on public.chat_messages(chat_session_id, created_at asc);

alter table public.usage_logs
  drop constraint if exists usage_logs_feature_type_check;

alter table public.usage_logs
  add constraint usage_logs_feature_type_check
  check (feature_type in ('chat', 'roadmap', 'flashcards', 'quiz', 'interview', 'embeddings'));

drop trigger if exists set_chat_sessions_updated_at on public.chat_sessions;
create trigger set_chat_sessions_updated_at
before update on public.chat_sessions
for each row
execute function public.set_profiles_updated_at();

alter table public.material_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;

revoke all on public.material_chunks from anon, authenticated;
revoke all on public.chat_sessions from anon, authenticated;
revoke all on public.chat_messages from anon, authenticated;


grant select, insert, update, delete on public.material_chunks to authenticated;
grant select, insert, update, delete on public.chat_sessions to authenticated;
grant select, insert, update, delete on public.chat_messages to authenticated;

drop policy if exists "Users can manage own material chunks" on public.material_chunks;
create policy "Users can manage own material chunks"
on public.material_chunks
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.materials
    where materials.id = material_chunks.material_id
      and materials.user_id = auth.uid()
      and materials.deleted_at is null
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.materials
    where materials.id = material_chunks.material_id
      and materials.user_id = auth.uid()
      and materials.deleted_at is null
  )
);

drop policy if exists "Users can manage own chat sessions" on public.chat_sessions;
create policy "Users can manage own chat sessions"
on public.chat_sessions
for all
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
  and (
    material_id is null
    or exists (
      select 1
      from public.materials
      where materials.id = chat_sessions.material_id
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
      where materials.id = chat_sessions.material_id
        and materials.user_id = auth.uid()
        and materials.deleted_at is null
    )
  )
);

drop policy if exists "Users can manage own chat messages" on public.chat_messages;
create policy "Users can manage own chat messages"
on public.chat_messages
for all
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.chat_session_id
      and chat_sessions.user_id = auth.uid()
      and chat_sessions.deleted_at is null
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1
    from public.chat_sessions
    where chat_sessions.id = chat_messages.chat_session_id
      and chat_sessions.user_id = auth.uid()
      and chat_sessions.deleted_at is null
  )
);

create or replace function public.match_material_chunks(
  query_embedding vector(1536),
  match_count integer default 5,
  filter_material_id uuid default null
)
returns table (
  id uuid,
  material_id uuid,
  chunk_index integer,
  content text,
  metadata jsonb,
  similarity double precision
)
language sql
stable
as $$
  select
    material_chunks.id,
    material_chunks.material_id,
    material_chunks.chunk_index,
    material_chunks.content,
    material_chunks.metadata,
    1 - (material_chunks.embedding <=> query_embedding) as similarity
  from public.material_chunks
  where material_chunks.user_id = auth.uid()
    and auth.uid() is not null
    and (
      filter_material_id is null
      or material_chunks.material_id = filter_material_id
    )
  order by material_chunks.embedding <=> query_embedding
  limit greatest(1, least(coalesce(match_count, 5), 20));
$$;

revoke execute on function public.match_material_chunks(vector, integer, uuid) from public;
grant execute on function public.match_material_chunks(vector, integer, uuid) to authenticated;
