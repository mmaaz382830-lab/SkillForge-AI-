# SkillForge AI — DATABASE_SCHEMA.md

**Project:** SkillForge AI  
**Document:** DATABASE_SCHEMA.md  
**Version:** MVP / 10-Day Build Scope  
**Purpose:** Define the Supabase Postgres, Supabase Auth, Supabase Storage, and pgvector database design for the SkillForge AI MVP.

---

## 1. Database Overview

### Purpose of the Database

The database for **SkillForge AI** supports a full-stack AI learning and interview-preparation platform where authenticated users can:

- Sign up and log in using email/password or Google OAuth
- Upload learning materials such as PDFs, TXT files, and pasted text
- Store extracted text and material metadata
- Chunk uploaded content for RAG
- Store embeddings using pgvector
- Chat with uploaded notes using source-grounded retrieval
- Generate learning roadmaps
- Generate flashcards
- Generate quizzes and save quiz attempts
- Run minimal mock interview sessions
- Track progress
- Track AI usage limits
- Store basic API logs, error logs, and admin actions

This schema is aligned with the PRD requirements for Google OAuth, email/password auth, RAG, AI generation, progress tracking, and strict MVP scope.

### Supabase Services Used

| Supabase Service | Usage |
|---|---|
| Supabase Auth | Email/password login, Google OAuth login, sessions |
| Supabase Postgres | Main relational database |
| Supabase Storage | Private uploaded learning materials |
| Supabase pgvector | Store embeddings and perform semantic search |
| Supabase RLS | User ownership and admin access control |

### Relationship With Supabase Auth

Supabase Auth stores the actual authenticated users in:

```sql id="8kibcx"
auth.users
```

SkillForge AI uses a public app-level table:

```sql id="rht0e7"
public.profiles
```

Each `profiles.id` references `auth.users.id`.

This means:

- Email/password users get one profile row.
- Google OAuth users get one profile row.
- Both auth methods use the same application profile system.
- All user-owned data references `profiles.id` through `user_id`.

### Why Postgres + pgvector Is Used

Postgres is used because SkillForge AI needs:

- Relational ownership
- Strong foreign keys
- User-specific CRUD
- Logs and usage tracking
- RLS security policies
- Structured AI-generated data
- Simple admin visibility

pgvector is used because SkillForge AI needs:

- Embedding storage
- Semantic search over uploaded notes
- RAG chat over private user-owned material
- Source-grounded retrieval without adding a separate vector database

The roadmap specifically places Supabase Auth, Postgres, Storage, pgvector, and Gemini API at the core of the project stack.

### MVP Scope Warning

This schema is intentionally focused for a **10-day MVP**.

Do not add:

- Teams
- Workspaces
- Public sharing
- Multi-tenant organizations
- Advanced billing tables
- OCR-specific tables
- Complex analytics warehouses
- Multiple AI provider tables
- Notification scheduling tables
- Full subscription lifecycle modeling

The goal is to support the core product loop:

```text id="parwnj"
Auth → Upload Material → Chunk + Embed → RAG Chat → Generate Study Assets → Practice → Track Progress
```

---

## 2. Core Design Rules

### Rule 1: Every User-Owned Table Must Have `user_id`

Every table that stores user-created or user-visible data must include:

```sql id="pe41w7"
user_id uuid not null references public.profiles(id)
```

This includes:

- Materials
- Chunks
- Chat sessions
- Chat messages
- Learning goals
- Roadmaps
- Flashcards
- Quizzes
- Interviews
- Progress events
- Usage logs

### Rule 2: Never Trust Client-Provided `user_id`

The frontend must never decide ownership.

APIs must always get the current user from the Supabase server session:

```text id="zgc26x"
server session → auth user id → use as user_id
```

If a request body contains `user_id`, the backend should ignore it or validate it against the server session.

### Rule 3: RLS Must Be Enabled on User-Owned Tables

All user-owned tables must have Row Level Security enabled.

Users can only:

- Select their own rows
- Insert rows for themselves
- Update their own rows
- Delete their own rows where deletion is allowed

### Rule 4: Admin Access Must Be Explicit

Admin access should never happen accidentally.

Admin access must require:

```text id="n0hcra"
profiles.role = 'admin'
```

Admin policies should be separate from normal user policies.

### Rule 5: OAuth and Email Users Use the Same `profiles` Table

There should not be separate profile tables for:

- Email/password users
- Google OAuth users

Both user types must map to:

```sql id="25o3wf"
public.profiles
```

### Rule 6: Soft Delete vs Hard Delete Decision

For MVP:

| Data Type | Delete Strategy |
|---|---|
| Materials | Soft delete with `deleted_at` |
| Material chunks | Keep while material is soft-deleted; hard delete during cleanup only |
| Generated roadmaps/flashcards/quizzes | Hard delete is acceptable for MVP |
| Quiz attempts/progress logs | Prefer keep for history |
| API/error logs | Keep for admin/debugging |
| Storage files | Delete or mark orphaned when material is deleted |

Materials use soft delete because:

- Deleting a material can affect chat history and generated assets.
- User may accidentally delete a file.
- Chunks and generated outputs may still reference past material.

### Rule 7: Timestamp Conventions

Use:

```sql id="k4klso"
created_at timestamptz not null default now()
updated_at timestamptz not null default now()
```

For completed actions:

```sql id="71tvmj"
completed_at timestamptz
```

For soft delete:

```sql id="bt8ccs"
deleted_at timestamptz
```

### Rule 8: Naming Conventions

Use:

- Snake case table names
- Snake case column names
- Plural table names
- UUID primary keys
- `user_id` for owner
- `created_at` / `updated_at` timestamps
- `metadata jsonb` for flexible non-core details

Examples:

```text id="6wca5y"
profiles
learning_goals
material_chunks
chat_sessions
chat_messages
roadmap_tasks
usage_logs
error_logs
```

### Rule 9: UUID Primary Keys

Use UUID primary keys for all app tables.

Example:

```sql id="snuqod"
id uuid primary key default gen_random_uuid()
```

Exception:

```sql id="efbk3p"
profiles.id references auth.users(id)
```

The profile ID must match the Supabase Auth user ID.

---

## 3. Required Extensions

SkillForge AI needs two Postgres extensions.

### 3.1 pgcrypto

Used for:

- `gen_random_uuid()`
- UUID primary key defaults

Draft example:

```sql id="1qeys3"
create extension if not exists pgcrypto;
```

### 3.2 vector

Used for:

- pgvector embedding storage
- Similarity search
- RAG retrieval

Draft example:

```sql id="q5l3c8"
create extension if not exists vector;
```

### Extension Notes

These examples are documentation-only at this stage.

Do not run migrations until the schema has been reviewed and approved.

---

## 4. Enum Types

### Recommendation for Supabase MVP

For a 10-day MVP, use **TEXT columns with CHECK constraints** instead of Postgres enum types.

Reason:

- Easier to change during rapid MVP development
- Less migration friction
- Still keeps values controlled
- Better for beginner-intermediate iteration

Postgres enums are also valid, but they are more annoying to modify later.

### Logical Enum Values

| Logical Type | Allowed Values |
|---|---|
| `user_role` | `user`, `admin`, `blocked` |
| `user_plan` | `free`, `pro`, `demo_admin` |
| `material_type` | `pdf`, `txt`, `pasted_text` |
| `processing_status` | `pending`, `processing`, `completed`, `failed` |
| `roadmap_task_status` | `todo`, `in_progress`, `completed` |
| `difficulty_level` | `beginner`, `intermediate`, `advanced` |
| `ai_feature_type` | `chat`, `roadmap`, `flashcards`, `quiz`, `interview`, `embeddings` |
| `log_status` | `success`, `blocked`, `error` |
| `interview_status` | `active`, `completed`, `abandoned` |

### CHECK Constraint Example

Recommended MVP style:

```sql id="09wuir"
role text not null default 'user'
  check (role in ('user', 'admin', 'blocked'))
```

```sql id="cwxjfs"
plan text not null default 'free'
  check (plan in ('free', 'pro', 'demo_admin'))
```

```sql id="s5v7lf"
processing_status text not null default 'pending'
  check (processing_status in ('pending', 'processing', 'completed', 'failed'))
```

### Optional Postgres Enum Example

Only use this if the values are final:

```sql id="jjisuf"
create type user_role as enum ('user', 'admin', 'blocked');
create type user_plan as enum ('free', 'pro', 'demo_admin');
create type material_type as enum ('pdf', 'txt', 'pasted_text');
create type processing_status as enum ('pending', 'processing', 'completed', 'failed');
```

### Final MVP Decision

Use:

```text id="ykjllm"
TEXT + CHECK constraints
```

Do not over-engineer enum migrations during the MVP.

---

## 5. Tables Summary

| Table Name | Purpose | Owner | MVP Priority | RLS Required |
|---|---|---|---|---|
| `profiles` | App profile linked to Supabase Auth user | User/System | Must-have Day 3 | Yes |
| `learning_goals` | User learning goals | User | Must-have Day 4 | Yes |
| `materials` | Uploaded document/material metadata | User | Must-have Day 5 | Yes |
| `material_chunks` | Extracted chunks and embeddings for RAG | User/System | Must-have Day 7 | Yes |
| `chat_sessions` | RAG chat sessions | User | Must-have Day 7 | Yes |
| `chat_messages` | User/assistant chat messages | User | Must-have Day 7 | Yes |
| `roadmaps` | AI-generated learning roadmaps | User | Must-have Day 4/6 | Yes |
| `roadmap_tasks` | Ordered roadmap tasks | User | Must-have Day 4/6 | Yes |
| `flashcard_decks` | Generated flashcard decks | User | Must-have Day 6 | Yes |
| `flashcards` | Individual flashcards | User | Must-have Day 6 | Yes |
| `quizzes` | Generated quizzes | User | Must-have Day 6/8 | Yes |
| `quiz_questions` | Quiz questions/options/answers | User | Must-have Day 6/8 | Yes |
| `quiz_attempts` | User quiz attempts and scores | User | Must-have Day 8 | Yes |
| `interview_sessions` | Mock interview sessions | User | Must-have Day 8 | Yes |
| `interview_messages` | Interview Q/A and feedback messages | User | Must-have Day 8 | Yes |
| `progress_events` | Learning activity tracking | User | Must-have Day 8 | Yes |
| `usage_logs` | AI usage and limit tracking | User/System | Must-have Day 6/9 | Yes |
| `api_logs` | API request logs | System/Admin | Should-have Day 9 | Yes |
| `error_logs` | Server error logs | System/Admin | Should-have Day 9 | Yes |
| `admin_actions` | Admin audit trail | Admin/System | Should-have Day 9 | Yes |
| `billing_customers` | Minimal Stripe test-mode reference | User/System | Optional Day 9 | Yes |

---

## 6. Detailed Table Designs

---

### 6.1 `profiles`

#### Purpose

Stores app-level user profile data for both email/password and Google OAuth users.

Each row maps directly to one Supabase Auth user.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | None | Primary key, references `auth.users(id)` |
| `email` | `text` | No | None | User email from auth |
| `full_name` | `text` | Yes | `null` | From Google OAuth metadata or user input |
| `avatar_url` | `text` | Yes | `null` | From Google OAuth metadata if available |
| `role` | `text` | No | `'user'` | CHECK: `user`, `admin`, `blocked` |
| `plan` | `text` | No | `'free'` | CHECK: `free`, `pro`, `demo_admin` |
| `last_active_at` | `timestamptz` | Yes | `null` | Updated on login/app activity |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="krjb6o"
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
```

#### Usage Limit Note

For MVP, do **not** store active AI usage counters in `profiles`.

- `profiles.plan` defines the user's plan: `free`, `pro`, or `demo_admin`.
- Actual AI usage must be calculated from `usage_logs` using `user_id` + `feature_type` + `period_key`.
- Dashboard can calculate remaining usage by counting successful `usage_logs` rows for the current period.
- Do not duplicate usage count in `profiles` unless a later cached counter is intentionally added.

#### Relationships

| Relationship | Type |
|---|---|
| `profiles.id → auth.users.id` | One-to-one |
| `profiles.id → materials.user_id` | One-to-many |
| `profiles.id → learning_goals.user_id` | One-to-many |
| `profiles.id → roadmaps.user_id` | One-to-many |
| `profiles.id → usage_logs.user_id` | One-to-many |

#### Indexes Needed

```sql id="fn6tht"
create index profiles_email_idx on public.profiles(email);
create index profiles_role_idx on public.profiles(role);
create index profiles_plan_idx on public.profiles(plan);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own profile |
| INSERT | Usually system/server trigger only |
| UPDATE | User can update safe profile fields only through API |
| ADMIN SELECT | Admin can read profiles |
| ADMIN UPDATE | Admin can update role/plan if allowed in MVP |

#### Notes

- `role` must default to `user`.
- Do not allow users to update their own `role`.
- Do not allow users to update their own `plan` unless through safe backend logic.
- Google OAuth profile values should map into `full_name`, `avatar_url`, and `email`.

---

### 6.2 `learning_goals`

#### Purpose

Stores user-defined learning goals used for roadmap generation.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | References `profiles(id)` |
| `title` | `text` | No | None | Goal title |
| `description` | `text` | Yes | `null` | Goal details |
| `category` | `text` | Yes | `null` | Example: `web_dev`, `ai_ml`, `exam`, `interview` |
| `difficulty` | `text` | No | `'beginner'` | CHECK: beginner/intermediate/advanced |
| `target_date` | `date` | Yes | `null` | Optional target date |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="81q8op"
create table public.learning_goals (
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
```

#### Relationships

| Relationship | Type |
|---|---|
| `learning_goals.user_id → profiles.id` | Many-to-one |
| `roadmaps.goal_id → learning_goals.id` | One-to-many optional |
| `interview_sessions.goal_id → learning_goals.id` | One-to-many optional |

#### Indexes Needed

```sql id="nh0y3a"
create index learning_goals_user_id_idx on public.learning_goals(user_id);
create index learning_goals_user_created_idx on public.learning_goals(user_id, created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own goals |
| INSERT | User can insert goals for self |
| UPDATE | User can update own goals |
| DELETE | User can delete own goals |

#### Notes

- Do not overbuild categories into a separate table for MVP.
- Use simple text category first.

---

### 6.3 `materials`

#### Purpose

Stores uploaded or pasted learning material metadata and extracted text.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `title` | `text` | No | None | User-facing title |
| `type` | `text` | No | None | CHECK: `pdf`, `txt`, `pasted_text` |
| `storage_path` | `text` | Yes | `null` | Supabase Storage path |
| `original_file_name` | `text` | Yes | `null` | Original upload name |
| `file_size_bytes` | `bigint` | Yes | `null` | File size |
| `mime_type` | `text` | Yes | `null` | MIME type |
| `extracted_text` | `text` | Yes | `null` | Extracted/pasted text |
| `processing_status` | `text` | No | `'pending'` | CHECK: pending/processing/completed/failed |
| `processing_error` | `text` | Yes | `null` | Safe internal-ish error message |
| `chunk_count` | `integer` | No | `0` | Number of chunks created |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |
| `deleted_at` | `timestamptz` | Yes | `null` | Soft delete |

#### Draft SQL Shape

```sql id="tvyap2"
create table public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null
    check (type in ('pdf', 'txt', 'pasted_text')),
  storage_path text,
  original_file_name text,
  file_size_bytes bigint,
  mime_type text,
  extracted_text text,
  processing_status text not null default 'pending'
    check (processing_status in ('pending', 'processing', 'completed', 'failed')),
  processing_error text,
  chunk_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `materials.user_id → profiles.id` | Many-to-one |
| `material_chunks.material_id → materials.id` | One-to-many |
| `chat_sessions.material_id → materials.id` | One-to-many optional |
| `roadmaps.material_id → materials.id` | One-to-many optional |
| `flashcard_decks.material_id → materials.id` | One-to-many optional |
| `quizzes.material_id → materials.id` | One-to-many optional |
| `interview_sessions.material_id → materials.id` | One-to-many optional |

#### Indexes Needed

```sql id="3vln73"
create index materials_user_id_idx on public.materials(user_id);
create index materials_user_created_idx on public.materials(user_id, created_at desc);
create index materials_processing_status_idx on public.materials(processing_status);
create index materials_deleted_at_idx on public.materials(deleted_at);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own non-deleted materials |
| INSERT | User can create own materials |
| UPDATE | User can update own materials |
| DELETE | Prefer soft delete through API |
| ADMIN | Admin can read metadata, not necessarily full `extracted_text` |

#### Notes

- For privacy, avoid showing extracted text in admin views unless needed.
- `deleted_at` lets the app hide deleted materials without breaking historical links.
- `storage_path` is nullable because pasted text has no file.

---

### 6.4 `material_chunks`

#### Purpose

Stores extracted text chunks and embeddings for RAG.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `material_id` | `uuid` | No | None | References `materials(id)` |
| `user_id` | `uuid` | No | None | Owner, duplicated for fast filtering and RLS |
| `chunk_index` | `integer` | No | None | Order in material |
| `content` | `text` | No | None | Chunk text |
| `character_count` | `integer` | Yes | `null` | Simpler than token count for MVP |
| `token_count` | `integer` | Yes | `null` | Optional if tokenizer is added |
| `embedding` | `vector(N)` | No | None | Dimension must match Gemini embedding model |
| `metadata` | `jsonb` | No | `'{}'` | Page number, source info, etc. |
| `created_at` | `timestamptz` | No | `now()` | Creation time |

#### Embedding Dimension Decision

`RESEARCH.md` recommends Gemini embeddings but does not define the exact embedding dimension.

Before implementation, confirm the exact dimension for the selected Gemini embedding model.

Use this placeholder in the schema design:

```text id="fx0vg1"
vector(<GEMINI_EMBEDDING_DIMENSION_TO_CONFIRM>)
```

Possible implementation decision:

```sql id="ag2n6f"
embedding vector(3072)
```

Only use `3072` if confirmed for the exact Gemini embedding model selected during implementation.

#### Draft SQL Shape

```sql id="3tk7jy"
create table public.material_chunks (
  id uuid primary key default gen_random_uuid(),
  material_id uuid not null references public.materials(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  character_count integer,
  token_count integer,
  embedding vector(<GEMINI_EMBEDDING_DIMENSION_TO_CONFIRM>) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `material_chunks.material_id → materials.id` | Many-to-one |
| `material_chunks.user_id → profiles.id` | Many-to-one |
| `chat_messages.source_chunk_ids` | Optional JSONB reference list |

#### Indexes Needed

```sql id="oz5nvj"
create index material_chunks_user_id_idx on public.material_chunks(user_id);
create index material_chunks_material_id_idx on public.material_chunks(material_id);
create unique index material_chunks_material_chunk_index_idx
  on public.material_chunks(material_id, chunk_index);
```

Vector index example:

```sql id="rcw9ye"
create index material_chunks_embedding_hnsw_idx
on public.material_chunks
using hnsw (embedding vector_cosine_ops);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own chunks |
| INSERT | Server can insert chunks for authenticated user |
| UPDATE | Usually system/server only |
| DELETE | User can delete chunks indirectly when material is deleted |
| ADMIN | Avoid exposing chunk content unnecessarily |

#### Notes

- Duplicating `user_id` is intentional for safe RAG filtering.
- Vector search must always filter by `user_id`.
- Never run vector search across all users’ chunks.
- For MVP, `character_count` is enough if token counting is not ready.

---

### 6.5 `chat_sessions`

#### Purpose

Stores RAG chat sessions for uploaded material.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `material_id` | `uuid` | Yes | `null` | Optional selected material |
| `title` | `text` | No | `'New Chat'` | Chat title |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="nxhf8g"
create table public.chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `chat_sessions.user_id → profiles.id` | Many-to-one |
| `chat_sessions.material_id → materials.id` | Many-to-one optional |
| `chat_messages.session_id → chat_sessions.id` | One-to-many |

#### Indexes Needed

```sql id="u2z1bn"
create index chat_sessions_user_id_idx on public.chat_sessions(user_id);
create index chat_sessions_material_id_idx on public.chat_sessions(material_id);
create index chat_sessions_user_created_idx on public.chat_sessions(user_id, created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own chat sessions |
| INSERT | User can create own chat sessions |
| UPDATE | User can update own chat session title |
| DELETE | User can delete own chat sessions |

#### Notes

- MVP can support one selected material per session.
- Multi-material chat can be added later without changing core architecture too much.

---

### 6.6 `chat_messages`

#### Purpose

Stores messages inside RAG chat sessions.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `session_id` | `uuid` | No | None | References `chat_sessions(id)` |
| `user_id` | `uuid` | No | None | Owner |
| `role` | `text` | No | None | CHECK: `user`, `assistant`, `system` |
| `content` | `text` | No | None | Message text |
| `source_chunk_ids` | `jsonb` | Yes | `null` | Optional list of chunk IDs used |
| `created_at` | `timestamptz` | No | `now()` | Creation time |

#### Draft SQL Shape

```sql id="8gec78"
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  source_chunk_ids jsonb,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `chat_messages.session_id → chat_sessions.id` | Many-to-one |
| `chat_messages.user_id → profiles.id` | Many-to-one |
| `source_chunk_ids` | JSONB references to `material_chunks.id` |

#### Indexes Needed

```sql id="xrsvdq"
create index chat_messages_session_id_idx on public.chat_messages(session_id);
create index chat_messages_user_id_idx on public.chat_messages(user_id);
create index chat_messages_session_created_idx on public.chat_messages(session_id, created_at asc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own messages |
| INSERT | User/server can insert messages for own session |
| UPDATE | Usually not needed |
| DELETE | User can delete own messages if chat deletion is supported |

#### Notes

- `source_chunk_ids` helps explain which chunks supported an answer.
- Store IDs, not full source copies, to reduce duplication.

---

### 6.7 `roadmaps`

#### Purpose

Stores AI-generated or manually created learning roadmaps.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `goal_id` | `uuid` | Yes | `null` | Optional learning goal |
| `material_id` | `uuid` | Yes | `null` | Optional material source |
| `title` | `text` | No | None | Roadmap title |
| `description` | `text` | Yes | `null` | Roadmap summary |
| `difficulty` | `text` | No | `'beginner'` | CHECK: beginner/intermediate/advanced |
| `estimated_duration` | `text` | Yes | `null` | Example: `2 weeks`, `10 days` |
| `ai_generated` | `boolean` | No | `true` | AI-generated or manual |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="75cesd"
create table public.roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  goal_id uuid references public.learning_goals(id) on delete set null,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  description text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  estimated_duration text,
  ai_generated boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `roadmaps.user_id → profiles.id` | Many-to-one |
| `roadmaps.goal_id → learning_goals.id` | Many-to-one optional |
| `roadmaps.material_id → materials.id` | Many-to-one optional |
| `roadmap_tasks.roadmap_id → roadmaps.id` | One-to-many |

#### Indexes Needed

```sql id="qh0dnj"
create index roadmaps_user_id_idx on public.roadmaps(user_id);
create index roadmaps_goal_id_idx on public.roadmaps(goal_id);
create index roadmaps_material_id_idx on public.roadmaps(material_id);
create index roadmaps_user_created_idx on public.roadmaps(user_id, created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own roadmaps |
| INSERT | User can create own roadmaps |
| UPDATE | User can update own roadmaps |
| DELETE | User can delete own roadmaps |

#### Notes

- `estimated_duration` is text for MVP flexibility.
- Do not create a separate durations table.

---

### 6.8 `roadmap_tasks`

#### Purpose

Stores ordered tasks inside a roadmap.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `roadmap_id` | `uuid` | No | None | Parent roadmap |
| `user_id` | `uuid` | No | None | Owner |
| `title` | `text` | No | None | Task title |
| `description` | `text` | Yes | `null` | Task details |
| `status` | `text` | No | `'todo'` | CHECK: todo/in_progress/completed |
| `order_index` | `integer` | No | None | Task order |
| `estimated_time` | `text` | Yes | `null` | Example: `30 minutes` |
| `completed_at` | `timestamptz` | Yes | `null` | Set when completed |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="exp5dl"
create table public.roadmap_tasks (
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
```

#### Relationships

| Relationship | Type |
|---|---|
| `roadmap_tasks.roadmap_id → roadmaps.id` | Many-to-one |
| `roadmap_tasks.user_id → profiles.id` | Many-to-one |

#### Indexes Needed

```sql id="3ipqeo"
create index roadmap_tasks_user_id_idx on public.roadmap_tasks(user_id);
create index roadmap_tasks_roadmap_id_idx on public.roadmap_tasks(roadmap_id);
create unique index roadmap_tasks_order_idx on public.roadmap_tasks(roadmap_id, order_index);
create index roadmap_tasks_status_idx on public.roadmap_tasks(user_id, status);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own roadmap tasks |
| INSERT | User can insert tasks for own roadmap |
| UPDATE | User can update own tasks |
| DELETE | User can delete own tasks |

#### Notes

- `user_id` duplicates roadmap ownership to simplify RLS and queries.
- Task completion should create a `progress_events` row.

---

### 6.9 `flashcard_decks`

#### Purpose

Stores flashcard deck metadata generated from materials or topics.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `material_id` | `uuid` | Yes | `null` | Optional source material |
| `title` | `text` | No | None | Deck title |
| `topic` | `text` | Yes | `null` | Deck topic |
| `card_count` | `integer` | No | `0` | Number of cards |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="lse5dl"
create table public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  topic text,
  card_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `flashcard_decks.user_id → profiles.id` | Many-to-one |
| `flashcard_decks.material_id → materials.id` | Many-to-one optional |
| `flashcards.deck_id → flashcard_decks.id` | One-to-many |

#### Indexes Needed

```sql id="0k1zjg"
create index flashcard_decks_user_id_idx on public.flashcard_decks(user_id);
create index flashcard_decks_material_id_idx on public.flashcard_decks(material_id);
create index flashcard_decks_user_created_idx on public.flashcard_decks(user_id, created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own decks |
| INSERT | User can create own decks |
| UPDATE | User can update own decks |
| DELETE | User can delete own decks |

#### Notes

- `card_count` can be updated after inserting flashcards.
- Do not add spaced repetition fields in MVP.

---

### 6.10 `flashcards`

#### Purpose

Stores individual flashcards inside a deck.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `deck_id` | `uuid` | No | None | Parent deck |
| `user_id` | `uuid` | No | None | Owner |
| `front` | `text` | No | None | Question/front |
| `back` | `text` | No | None | Answer/back |
| `topic` | `text` | Yes | `null` | Topic |
| `difficulty` | `text` | No | `'beginner'` | CHECK: beginner/intermediate/advanced |
| `order_index` | `integer` | No | None | Card order |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="r8dnia"
create table public.flashcards (
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
```

#### Relationships

| Relationship | Type |
|---|---|
| `flashcards.deck_id → flashcard_decks.id` | Many-to-one |
| `flashcards.user_id → profiles.id` | Many-to-one |

#### Indexes Needed

```sql id="tey508"
create index flashcards_deck_id_idx on public.flashcards(deck_id);
create index flashcards_user_id_idx on public.flashcards(user_id);
create unique index flashcards_deck_order_idx on public.flashcards(deck_id, order_index);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own flashcards |
| INSERT | User can insert into own decks |
| UPDATE | User can update own flashcards |
| DELETE | User can delete own flashcards |

#### Notes

- No spaced repetition status for MVP.
- Keep flashcards simple: front/back/topic/difficulty.

---

### 6.11 `quizzes`

#### Purpose

Stores quiz metadata.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `material_id` | `uuid` | Yes | `null` | Optional source material |
| `title` | `text` | No | None | Quiz title |
| `topic` | `text` | Yes | `null` | Quiz topic |
| `difficulty` | `text` | No | `'beginner'` | CHECK: beginner/intermediate/advanced |
| `question_count` | `integer` | No | `0` | Number of questions |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="ny66wa"
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  material_id uuid references public.materials(id) on delete set null,
  title text not null,
  topic text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  question_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `quizzes.user_id → profiles.id` | Many-to-one |
| `quizzes.material_id → materials.id` | Many-to-one optional |
| `quiz_questions.quiz_id → quizzes.id` | One-to-many |
| `quiz_attempts.quiz_id → quizzes.id` | One-to-many |

#### Indexes Needed

```sql id="9hpsmy"
create index quizzes_user_id_idx on public.quizzes(user_id);
create index quizzes_material_id_idx on public.quizzes(material_id);
create index quizzes_user_created_idx on public.quizzes(user_id, created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own quizzes |
| INSERT | User can create own quizzes |
| UPDATE | User can update own quizzes |
| DELETE | User can delete own quizzes |

#### Notes

- Only multiple-choice quiz structure is required for MVP.
- Do not add complex quiz modes yet.

---

### 6.12 `quiz_questions`

#### Purpose

Stores quiz questions, answer options, correct answer, and explanation.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `quiz_id` | `uuid` | No | None | Parent quiz |
| `user_id` | `uuid` | No | None | Owner |
| `question` | `text` | No | None | Question text |
| `options` | `jsonb` | No | None | Array of options |
| `correct_answer` | `text` | No | None | Correct option/value |
| `explanation` | `text` | Yes | `null` | Explanation |
| `topic` | `text` | Yes | `null` | Topic |
| `difficulty` | `text` | No | `'beginner'` | CHECK: beginner/intermediate/advanced |
| `order_index` | `integer` | No | None | Question order |
| `created_at` | `timestamptz` | No | `now()` | Creation time |

#### Draft SQL Shape

```sql id="6lbt67"
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  question text not null,
  options jsonb not null,
  correct_answer text not null,
  explanation text,
  topic text,
  difficulty text not null default 'beginner'
    check (difficulty in ('beginner', 'intermediate', 'advanced')),
  order_index integer not null,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `quiz_questions.quiz_id → quizzes.id` | Many-to-one |
| `quiz_questions.user_id → profiles.id` | Many-to-one |

#### Indexes Needed

```sql id="5h25yr"
create index quiz_questions_quiz_id_idx on public.quiz_questions(quiz_id);
create index quiz_questions_user_id_idx on public.quiz_questions(user_id);
create unique index quiz_questions_quiz_order_idx on public.quiz_questions(quiz_id, order_index);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own quiz questions |
| INSERT | User can insert questions for own quiz |
| UPDATE | User can update own questions |
| DELETE | User can delete own questions |

#### Notes

- `options` should be a JSON array.
- Example:
  ```json
  ["Option A", "Option B", "Option C", "Option D"]
  ```

---

### 6.13 `quiz_attempts`

#### Purpose

Stores quiz attempt results and submitted answers.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `quiz_id` | `uuid` | No | None | Parent quiz |
| `user_id` | `uuid` | No | None | Owner |
| `score` | `numeric` | No | `0` | Percentage or normalized score |
| `total_questions` | `integer` | No | None | Total questions |
| `correct_count` | `integer` | No | `0` | Correct answers |
| `answers` | `jsonb` | No | `'{}'` | Submitted answers |
| `started_at` | `timestamptz` | No | `now()` | Start time |
| `completed_at` | `timestamptz` | Yes | `null` | Completion time |

#### Draft SQL Shape

```sql id="32yqaf"
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  score numeric not null default 0,
  total_questions integer not null,
  correct_count integer not null default 0,
  answers jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `quiz_attempts.quiz_id → quizzes.id` | Many-to-one |
| `quiz_attempts.user_id → profiles.id` | Many-to-one |

#### Indexes Needed

```sql id="3tg15c"
create index quiz_attempts_quiz_id_idx on public.quiz_attempts(quiz_id);
create index quiz_attempts_user_id_idx on public.quiz_attempts(user_id);
create index quiz_attempts_user_completed_idx on public.quiz_attempts(user_id, completed_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own attempts |
| INSERT | User can create own attempts |
| UPDATE | User can complete/update own attempt |
| DELETE | Usually not needed for MVP |

#### Notes

- `answers` can store question ID to selected answer mappings.
- Completed attempts should create `progress_events`.

---

### 6.14 `interview_sessions`

#### Purpose

Stores minimal mock interview sessions.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `material_id` | `uuid` | Yes | `null` | Optional source material |
| `goal_id` | `uuid` | Yes | `null` | Optional learning goal |
| `topic` | `text` | No | None | Interview topic |
| `difficulty` | `text` | No | `'beginner'` | CHECK: beginner/intermediate/advanced |
| `status` | `text` | No | `'active'` | CHECK: active/completed/abandoned |
| `overall_feedback` | `text` | Yes | `null` | Final feedback |
| `score` | `numeric` | Yes | `null` | Optional score |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `completed_at` | `timestamptz` | Yes | `null` | Completion time |

#### Draft SQL Shape

```sql id="24djku"
create table public.interview_sessions (
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
```

#### Relationships

| Relationship | Type |
|---|---|
| `interview_sessions.user_id → profiles.id` | Many-to-one |
| `interview_sessions.material_id → materials.id` | Many-to-one optional |
| `interview_sessions.goal_id → learning_goals.id` | Many-to-one optional |
| `interview_messages.session_id → interview_sessions.id` | One-to-many |

#### Indexes Needed

```sql id="z39eiy"
create index interview_sessions_user_id_idx on public.interview_sessions(user_id);
create index interview_sessions_material_id_idx on public.interview_sessions(material_id);
create index interview_sessions_goal_id_idx on public.interview_sessions(goal_id);
create index interview_sessions_user_created_idx on public.interview_sessions(user_id, created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own interview sessions |
| INSERT | User can create own sessions |
| UPDATE | User can update own session status/feedback |
| DELETE | User can delete own sessions if supported |

#### Notes

- Keep this minimal.
- No voice mode.
- No video.
- No advanced interview analytics in MVP.

---

### 6.15 `interview_messages`

#### Purpose

Stores mock interview questions, user answers, AI feedback, and assistant messages.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `session_id` | `uuid` | No | None | Parent interview session |
| `user_id` | `uuid` | No | None | Owner |
| `role` | `text` | No | None | CHECK: user/assistant/system |
| `content` | `text` | No | None | Message content |
| `feedback` | `jsonb` | Yes | `null` | Structured feedback |
| `created_at` | `timestamptz` | No | `now()` | Creation time |

#### Draft SQL Shape

```sql id="rljc5n"
create table public.interview_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  feedback jsonb,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `interview_messages.session_id → interview_sessions.id` | Many-to-one |
| `interview_messages.user_id → profiles.id` | Many-to-one |

#### Indexes Needed

```sql id="jw8tpz"
create index interview_messages_session_id_idx on public.interview_messages(session_id);
create index interview_messages_user_id_idx on public.interview_messages(user_id);
create index interview_messages_session_created_idx on public.interview_messages(session_id, created_at asc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own interview messages |
| INSERT | User/server can insert messages into own session |
| UPDATE | Usually not needed |
| DELETE | Delete through session deletion if needed |

#### Notes

`feedback` can store simple AI feedback:

```json id="vqp859"
{
  "strengths": ["Clear explanation"],
  "missing_points": ["Mentioned concept but not example"],
  "improved_answer": "A better answer would be...",
  "score": 7
}
```

---

### 6.16 `progress_events`

#### Purpose

Stores simple learning activity and progress history.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `event_type` | `text` | No | None | Example: `task_completed`, `quiz_attempted` |
| `entity_type` | `text` | No | None | Example: `roadmap_task`, `quiz`, `interview` |
| `entity_id` | `uuid` | Yes | `null` | Related entity ID |
| `metadata` | `jsonb` | No | `'{}'` | Extra details |
| `created_at` | `timestamptz` | No | `now()` | Event time |

#### Draft SQL Shape

```sql id="fz5hvj"
create table public.progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `progress_events.user_id → profiles.id` | Many-to-one |
| `entity_id` | Flexible reference |

#### Indexes Needed

```sql id="y9vsfk"
create index progress_events_user_id_idx on public.progress_events(user_id);
create index progress_events_user_created_idx on public.progress_events(user_id, created_at desc);
create index progress_events_entity_idx on public.progress_events(entity_type, entity_id);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own progress |
| INSERT | User/server can insert own progress events |
| UPDATE | Usually not needed |
| DELETE | Usually not needed for MVP |

#### Notes

Do not over-normalize progress into many separate tracking tables.

Use `progress_events` as the MVP activity timeline.

---

### 6.17 `usage_logs`

#### Purpose

Tracks AI feature usage, blocked requests, and quota behavior.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `feature_type` | `text` | No | None | CHECK: chat/roadmap/flashcards/quiz/interview/embeddings |
| `status` | `text` | No | None | CHECK: success/blocked/error |
| `tokens_used` | `integer` | Yes | `null` | Optional |
| `request_count` | `integer` | No | `1` | Usually 1 per row |
| `period_key` | `text` | No | None | Example: `2026-06` or `2026-06-21` |
| `metadata` | `jsonb` | No | `'{}'` | Model, duration, route, etc. |
| `created_at` | `timestamptz` | No | `now()` | Log time |

#### Draft SQL Shape

```sql id="0eafp3"
create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  feature_type text not null
    check (feature_type in ('chat', 'roadmap', 'flashcards', 'quiz', 'interview', 'embeddings')),
  status text not null
    check (status in ('success', 'blocked', 'error')),
  tokens_used integer,
  request_count integer not null default 1,
  period_key text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `usage_logs.user_id → profiles.id` | Many-to-one |

#### Indexes Needed

```sql id="9os47i"
create index usage_logs_user_id_idx on public.usage_logs(user_id);
create index usage_logs_user_period_idx on public.usage_logs(user_id, period_key);
create index usage_logs_feature_idx on public.usage_logs(feature_type);
create index usage_logs_status_idx on public.usage_logs(status);
create index usage_logs_user_created_idx on public.usage_logs(user_id, created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own usage summary |
| INSERT | Server can insert usage rows |
| UPDATE | Usually not needed |
| DELETE | Admin/system only |
| ADMIN SELECT | Admin can read usage logs |

#### Notes

- This supports AI request tracking.
- Upstash can handle fast rate limiting, while this table stores durable usage history.
- `period_key` keeps monthly or daily quota queries simple.

---

### 6.18 `api_logs`

#### Purpose

Stores basic API request logs for admin/debugging.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | Yes | `null` | Nullable for public/failed auth requests |
| `route` | `text` | No | None | API route |
| `method` | `text` | No | None | GET/POST/etc. |
| `status_code` | `integer` | No | None | HTTP status |
| `status` | `text` | No | None | CHECK: success/blocked/error |
| `ip_hash` | `text` | Yes | `null` | Optional privacy-safe IP hash |
| `user_agent` | `text` | Yes | `null` | Optional |
| `duration_ms` | `integer` | Yes | `null` | Request duration |
| `created_at` | `timestamptz` | No | `now()` | Log time |

#### Draft SQL Shape

```sql id="jz4ypb"
create table public.api_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  route text not null,
  method text not null,
  status_code integer not null,
  status text not null check (status in ('success', 'blocked', 'error')),
  ip_hash text,
  user_agent text,
  duration_ms integer,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `api_logs.user_id → profiles.id` | Many-to-one nullable |

#### Indexes Needed

```sql id="4ddofy"
create index api_logs_user_id_idx on public.api_logs(user_id);
create index api_logs_route_idx on public.api_logs(route);
create index api_logs_status_idx on public.api_logs(status);
create index api_logs_created_idx on public.api_logs(created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | Admin only |
| INSERT | Server/service role only |
| UPDATE | No normal updates |
| DELETE | Admin/system only if needed |

#### Notes

- Do not log request bodies containing private notes.
- Do not log raw API keys.
- Avoid storing full IP addresses. Use hash if needed.

---

### 6.19 `error_logs`

#### Purpose

Stores safe server-side error records for debugging.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | Yes | `null` | Nullable |
| `route` | `text` | Yes | `null` | Where error happened |
| `message` | `text` | No | None | Safe summary |
| `safe_error_code` | `text` | No | None | Example: `AI_TIMEOUT`, `UPLOAD_FAILED` |
| `stack_trace` | `text` | Yes | `null` | Server-only note |
| `metadata` | `jsonb` | No | `'{}'` | Extra safe debug info |
| `created_at` | `timestamptz` | No | `now()` | Log time |

#### Draft SQL Shape

```sql id="2xdqbk"
create table public.error_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  route text,
  message text not null,
  safe_error_code text not null,
  stack_trace text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `error_logs.user_id → profiles.id` | Many-to-one nullable |

#### Indexes Needed

```sql id="tilqvd"
create index error_logs_user_id_idx on public.error_logs(user_id);
create index error_logs_code_idx on public.error_logs(safe_error_code);
create index error_logs_created_idx on public.error_logs(created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | Admin only |
| INSERT | Server/service role only |
| UPDATE | No normal updates |
| DELETE | Admin/system only if needed |

#### Notes

- `stack_trace` must never be shown to normal users.
- Avoid storing private extracted material text inside `metadata`.

---

### 6.20 `admin_actions`

#### Purpose

Stores audit trail for admin actions.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `admin_user_id` | `uuid` | No | None | Admin performing action |
| `action` | `text` | No | None | Example: `update_user_plan` |
| `target_user_id` | `uuid` | Yes | `null` | User affected |
| `metadata` | `jsonb` | No | `'{}'` | Extra details |
| `created_at` | `timestamptz` | No | `now()` | Action time |

#### Draft SQL Shape

```sql id="2ej3ck"
create table public.admin_actions (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null,
  target_user_id uuid references public.profiles(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `admin_actions.admin_user_id → profiles.id` | Many-to-one |
| `admin_actions.target_user_id → profiles.id` | Many-to-one nullable |

#### Indexes Needed

```sql id="3qqnru"
create index admin_actions_admin_user_idx on public.admin_actions(admin_user_id);
create index admin_actions_target_user_idx on public.admin_actions(target_user_id);
create index admin_actions_created_idx on public.admin_actions(created_at desc);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | Admin only |
| INSERT | Admin/server only |
| UPDATE | Not needed |
| DELETE | Not needed for MVP |

#### Notes

- Keep admin actions basic.
- Do not build a full audit system beyond this.

---

### 6.21 `billing_customers` Optional

#### Purpose

Stores minimal Stripe test-mode references only.

This is optional and should not become a real billing system in MVP.

#### Columns

| Column | Data Type | Nullable | Default | Notes |
|---|---|---:|---|---|
| `id` | `uuid` | No | `gen_random_uuid()` | Primary key |
| `user_id` | `uuid` | No | None | Owner |
| `stripe_customer_id` | `text` | Yes | `null` | Test-mode customer ID |
| `stripe_subscription_id` | `text` | Yes | `null` | Test-mode subscription ID |
| `status` | `text` | Yes | `null` | Example: `active`, `inactive`, `trialing` |
| `plan` | `text` | No | `'free'` | Mirrors app plan |
| `test_mode` | `boolean` | No | `true` | MVP uses test mode only |
| `created_at` | `timestamptz` | No | `now()` | Creation time |
| `updated_at` | `timestamptz` | No | `now()` | Update time |

#### Draft SQL Shape

```sql id="1iae4d"
create table public.billing_customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text,
  plan text not null default 'free'
    check (plan in ('free', 'pro', 'demo_admin')),
  test_mode boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

#### Relationships

| Relationship | Type |
|---|---|
| `billing_customers.user_id → profiles.id` | One-to-one recommended |

#### Indexes Needed

```sql id="z3kk2u"
create unique index billing_customers_user_id_idx on public.billing_customers(user_id);
create index billing_customers_stripe_customer_idx on public.billing_customers(stripe_customer_id);
```

#### RLS Rule Summary

| Action | Rule |
|---|---|
| SELECT | User can read own billing reference |
| INSERT | Server only |
| UPDATE | Server/admin only |
| DELETE | Server/admin only |

#### Notes

- `billing_customers` is optional only.
- Do not include `billing_customers` in the first migration unless Stripe test mode is being implemented in Day 9.
- For the 10-day MVP, `profiles.plan` is enough for free/pro/demo plan checks.
- Avoid invoices, payments, refunds, coupons, taxes, or real billing lifecycle tables.
- `profiles.plan` remains the main app plan source for MVP.

---

## 7. Relationships and ERD Description

### Text-Based ERD

```text id="5wd14s"
auth.users
  └── profiles
        ├── materials
        │     ├── material_chunks
        │     ├── chat_sessions
        │     │     └── chat_messages
        │     ├── flashcard_decks
        │     │     └── flashcards
        │     ├── quizzes
        │     │     ├── quiz_questions
        │     │     └── quiz_attempts
        │     └── interview_sessions
        │           └── interview_messages
        │
        ├── learning_goals
        │     ├── roadmaps
        │     │     └── roadmap_tasks
        │     └── interview_sessions
        │
        ├── roadmaps
        │     └── roadmap_tasks
        │
        ├── progress_events
        ├── usage_logs
        ├── api_logs
        ├── error_logs
        ├── admin_actions
        └── billing_customers optional
```

### Main Relationship Rules

| Relationship | Explanation |
|---|---|
| `auth.users → profiles` | One auth user has one app profile |
| `profiles → materials` | A user owns many materials |
| `materials → material_chunks` | A material has many chunks |
| `materials → chat_sessions` | A material can be used in many chat sessions |
| `chat_sessions → chat_messages` | A chat session contains many messages |
| `profiles → learning_goals` | A user can create many goals |
| `learning_goals → roadmaps` | A goal can produce multiple roadmaps |
| `roadmaps → roadmap_tasks` | A roadmap contains ordered tasks |
| `materials → flashcard_decks → flashcards` | A material can generate decks and cards |
| `materials → quizzes → quiz_questions → quiz_attempts` | A material can generate quizzes and attempts |
| `materials/goals → interview_sessions → interview_messages` | Interviews can be based on material or goals |
| `profiles → usage_logs` | User AI usage is tracked |
| `profiles → progress_events` | User progress is tracked |
| `profiles → api_logs/error_logs` | Logs may reference users |
| `profiles → admin_actions` | Admin actions reference admin and optional target user |

---

## 8. Index Strategy

### General Index Rules

Add indexes for:

- `user_id` on every user-owned table
- Parent IDs used in joins
- `created_at` for newest-first list pages
- Vector search on `material_chunks.embedding`
- Composite indexes for common dashboard/API queries

### Required User Indexes

```sql id="ao69gs"
create index materials_user_id_idx on public.materials(user_id);
create index material_chunks_user_id_idx on public.material_chunks(user_id);
create index chat_sessions_user_id_idx on public.chat_sessions(user_id);
create index chat_messages_user_id_idx on public.chat_messages(user_id);
create index learning_goals_user_id_idx on public.learning_goals(user_id);
create index roadmaps_user_id_idx on public.roadmaps(user_id);
create index roadmap_tasks_user_id_idx on public.roadmap_tasks(user_id);
create index flashcard_decks_user_id_idx on public.flashcard_decks(user_id);
create index flashcards_user_id_idx on public.flashcards(user_id);
create index quizzes_user_id_idx on public.quizzes(user_id);
create index quiz_questions_user_id_idx on public.quiz_questions(user_id);
create index quiz_attempts_user_id_idx on public.quiz_attempts(user_id);
create index interview_sessions_user_id_idx on public.interview_sessions(user_id);
create index interview_messages_user_id_idx on public.interview_messages(user_id);
create index progress_events_user_id_idx on public.progress_events(user_id);
create index usage_logs_user_id_idx on public.usage_logs(user_id);
```

### Parent Relationship Indexes

```sql id="tfsy2m"
create index material_chunks_material_id_idx on public.material_chunks(material_id);
create index roadmap_tasks_roadmap_id_idx on public.roadmap_tasks(roadmap_id);
create index flashcards_deck_id_idx on public.flashcards(deck_id);
create index quiz_questions_quiz_id_idx on public.quiz_questions(quiz_id);
create index quiz_attempts_quiz_id_idx on public.quiz_attempts(quiz_id);
create index chat_messages_session_id_idx on public.chat_messages(session_id);
create index interview_messages_session_id_idx on public.interview_messages(session_id);
```

### Created At Indexes for List Views

```sql id="oba8ww"
create index materials_user_created_idx on public.materials(user_id, created_at desc);
create index roadmaps_user_created_idx on public.roadmaps(user_id, created_at desc);
create index flashcard_decks_user_created_idx on public.flashcard_decks(user_id, created_at desc);
create index quizzes_user_created_idx on public.quizzes(user_id, created_at desc);
create index interview_sessions_user_created_idx on public.interview_sessions(user_id, created_at desc);
create index progress_events_user_created_idx on public.progress_events(user_id, created_at desc);
```

### Composite Indexes for Common Queries

```sql id="h02zbt"
create index usage_logs_user_period_idx on public.usage_logs(user_id, period_key);
create index usage_logs_user_feature_period_idx
  on public.usage_logs(user_id, feature_type, period_key);

create index materials_user_status_idx
  on public.materials(user_id, processing_status);

create index roadmap_tasks_user_status_idx
  on public.roadmap_tasks(user_id, status);
```

### Vector Index Recommendation

For pgvector, use **HNSW** if supported in the Supabase project.

Recommended MVP choice:

```sql id="hooepa"
create index material_chunks_embedding_hnsw_idx
on public.material_chunks
using hnsw (embedding vector_cosine_ops);
```

### Why HNSW for MVP

Use HNSW because:

- It performs well for approximate nearest-neighbor search.
- It does not require a training phase like IVFFlat.
- It is easier for small-to-medium MVP datasets.
- It gives better retrieval speed once chunk count grows.

### IVFFlat Alternative

If HNSW is not available or not suitable:

```sql id="li2eri"
create index material_chunks_embedding_ivfflat_idx
on public.material_chunks
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
```

### MVP Practical Note

For the first tiny local dataset, exact search without a vector index may still work.

But for Day 7 RAG, add a vector index before serious testing.

---

## 9. RAG / Vector Search Design

### How `material_chunks` Supports RAG

The `material_chunks` table is the core RAG table.

It stores:

- The material ID
- The user ID
- The chunk order
- The chunk content
- The embedding vector
- Optional metadata such as page number or section

RAG flow:

```text id="t7z3kn"
User question
  → create query embedding
  → search matching material_chunks
  → filter by user_id
  → optionally filter by material_id
  → return top-k chunks
  → build grounded prompt
  → AI answers using matched chunks
  → save answer with source_chunk_ids
```

### How Embeddings Are Stored

Each row in `material_chunks` stores one embedding:

```sql id="yc2lhu"
embedding vector(<GEMINI_EMBEDDING_DIMENSION_TO_CONFIRM>)
```

The embedding dimension must match the selected Gemini embedding model.

### User Ownership During Vector Search

Vector search must always filter by:

```sql id="cxxeyd"
user_id = auth.uid()
```

or by a server-provided session user ID that is checked against `auth.uid()`.

Never search chunks across all users.

### Why Vector Search Must Filter by `user_id`

Without `user_id` filtering:

- User A could retrieve chunks from User B’s private notes.
- RAG answers could leak private uploaded material.
- Admin/debug features could accidentally expose extracted text.

This is one of the most important security rules in the whole database.

### Top-K Retrieval

For MVP, use:

```text id="x97nko"
match_count = 5
```

Reasonable range:

```text id="ym4r9e"
3 to 8 chunks
```

Avoid retrieving too many chunks because:

- Prompts get too long.
- AI cost increases.
- Irrelevant context can reduce answer quality.

### Storing Source Chunks

Assistant messages can store used chunk IDs:

```sql id="i3h9h6"
source_chunk_ids jsonb
```

Example value:

```json id="9pg70v"
[
  "chunk-uuid-1",
  "chunk-uuid-2",
  "chunk-uuid-3"
]
```

This supports future UI like:

- “Sources used”
- “Based on these note sections”
- “Open source chunk”

### If No Relevant Chunk Is Found

If retrieval returns no useful chunks:

- Do not hallucinate.
- Return a safe fallback:
  ```text
  I could not find enough context in your uploaded material.
  ```
- Save the chat message if useful.
- Log usage status as `success` or `error` depending on the app behavior.

### Conceptual RPC Function: `match_material_chunks`

This is a draft/example function design only.

Do not implement until migration review.

#### Inputs

| Input | Type | Notes |
|---|---|---|
| `p_query_embedding` | `vector(N)` | Query embedding |
| `p_user_id` | `uuid` | Must equal `auth.uid()` |
| `p_material_id` | `uuid` nullable | Optional material filter |
| `p_match_count` | `integer` | Number of chunks to return |

#### Output

| Output | Type |
|---|---|
| `id` | `uuid` |
| `material_id` | `uuid` |
| `content` | `text` |
| `similarity` | `float` |
| `metadata` | `jsonb` |

#### Draft SQL-Style Example

```sql id="0jhgyh"
create or replace function public.match_material_chunks(
  p_query_embedding vector(<GEMINI_EMBEDDING_DIMENSION_TO_CONFIRM>),
  p_user_id uuid,
  p_material_id uuid default null,
  p_match_count integer default 5
)
returns table (
  id uuid,
  material_id uuid,
  content text,
  similarity float,
  metadata jsonb
)
language sql
security invoker
as $$
  select
    mc.id,
    mc.material_id,
    mc.content,
    1 - (mc.embedding <=> p_query_embedding) as similarity,
    mc.metadata
  from public.material_chunks mc
  where
    mc.user_id = auth.uid()
    and mc.user_id = p_user_id
    and (p_material_id is null or mc.material_id = p_material_id)
  order by mc.embedding <=> p_query_embedding
  limit p_match_count;
$$;
```

### RAG Security Notes

- Prefer `security invoker` so RLS still applies.
- Do not use service role for user-facing vector search unless absolutely necessary.
- If service role is used server-side, manually filter by session user ID every time.
- `p_user_id` must never be trusted from client input.
- The backend should pass the authenticated session user ID.

---

## 10. Supabase RLS Policies

### RLS Strategy

Enable RLS on every public table:

```sql id="w2wxy8"
alter table public.profiles enable row level security;
alter table public.materials enable row level security;
alter table public.material_chunks enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.chat_messages enable row level security;
alter table public.learning_goals enable row level security;
alter table public.roadmaps enable row level security;
alter table public.roadmap_tasks enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.interview_sessions enable row level security;
alter table public.interview_messages enable row level security;
alter table public.progress_events enable row level security;
alter table public.usage_logs enable row level security;
alter table public.api_logs enable row level security;
alter table public.error_logs enable row level security;
alter table public.admin_actions enable row level security;
-- Optional Day 9 only, if Stripe test mode is implemented:
-- alter table public.billing_customers enable row level security;
```

These are draft examples to verify during implementation.

---

### 10.1 Admin Helper Function

Draft helper:

```sql id="03hr7j"
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;
```

#### Notes

- Verify this carefully to avoid recursive RLS issues.
- Use `security definer` carefully.
- Keep admin logic server-side where possible.

---

### 10.2 Generic User-Owned Policy Pattern

For most user-owned tables:

```sql id="0j925d"
create policy "Users can read own rows"
on public.table_name
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own rows"
on public.table_name
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own rows"
on public.table_name
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can delete own rows"
on public.table_name
for delete
to authenticated
using (user_id = auth.uid());
```

Apply this pattern to:

- `learning_goals`
- `materials`
- `material_chunks`
- `chat_sessions`
- `chat_messages`
- `roadmaps`
- `roadmap_tasks`
- `flashcard_decks`
- `flashcards`
- `quizzes`
- `quiz_questions`
- `quiz_attempts`
- `interview_sessions`
- `interview_messages`
- `progress_events`
- `usage_logs`

---

### 10.3 `profiles` Policies

Draft policies:

```sql id="fo8qwo"
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Admins can read profiles"
on public.profiles
for select
to authenticated
using (public.is_admin());
```

#### Safer MVP Profile Update Recommendation

For MVP, users should **not** directly update the full `profiles` table from the client.

Allowed behavior:

- Users can `SELECT` their own profile.
- Profile updates must go through a safe server API route.
- The safe API route may only update:
  - `full_name`
  - `avatar_url`
- Users must never update their own:
  - `role`
  - `plan`
  - any usage-related fields

#### Important Profile Policy Warning

RLS checks row ownership, but it does **not** automatically protect individual columns from unsafe updates.

A broad client-side update policy could accidentally allow a user to change sensitive columns like `role` or `plan`. Do not expose direct client updates for sensitive profile columns.

If profile editing is needed in MVP, implement it through a server route that:

1. Reads the authenticated user from the server session.
2. Ignores any client-provided `user_id`.
3. Allows only `full_name` and `avatar_url` updates.
4. Never accepts `role`, `plan`, or usage-related fields from the client.

---

### 10.4 Materials Policies

Draft policies:

```sql id="pwe0eb"
create policy "Users can read own active materials"
on public.materials
for select
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
);

create policy "Users can create own materials"
on public.materials
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can update own materials"
on public.materials
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "Users can soft delete own materials"
on public.materials
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

#### Notes

- Actual deletion should be handled carefully.
- Soft delete means setting `deleted_at`.
- Avoid hard deleting material while related content still exists.

---

### 10.5 Material Chunks Policies

Draft policies:

```sql id="edkrsw"
create policy "Users can read own material chunks"
on public.material_chunks
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can insert own material chunks"
on public.material_chunks
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can delete own material chunks"
on public.material_chunks
for delete
to authenticated
using (user_id = auth.uid());
```

#### Notes

- Chunk creation usually happens server-side after processing.
- Vector search must use these ownership rules.
- Admin should not casually browse private chunks.

---

### 10.6 Chat Policies

For `chat_sessions`:

```sql id="0xknw4"
create policy "Users can manage own chat sessions"
on public.chat_sessions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

For `chat_messages`:

```sql id="e01twt"
create policy "Users can manage own chat messages"
on public.chat_messages
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

---

### 10.7 Learning Goals and Roadmap Policies

For `learning_goals`:

```sql id="3xfwq3"
create policy "Users can manage own learning goals"
on public.learning_goals
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

For `roadmaps`:

```sql id="ycdfgw"
create policy "Users can manage own roadmaps"
on public.roadmaps
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

For `roadmap_tasks`:

```sql id="quimgi"
create policy "Users can manage own roadmap tasks"
on public.roadmap_tasks
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

---

### 10.8 Flashcard Policies

For `flashcard_decks`:

```sql id="3zd1fx"
create policy "Users can manage own flashcard decks"
on public.flashcard_decks
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

For `flashcards`:

```sql id="7y252x"
create policy "Users can manage own flashcards"
on public.flashcards
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

---

### 10.9 Quiz Policies

For `quizzes`:

```sql id="novew6"
create policy "Users can manage own quizzes"
on public.quizzes
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

For `quiz_questions`:

```sql id="w4od4r"
create policy "Users can manage own quiz questions"
on public.quiz_questions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

For `quiz_attempts`:

```sql id="wvynm0"
create policy "Users can manage own quiz attempts"
on public.quiz_attempts
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

---

### 10.10 Interview Policies

For `interview_sessions`:

```sql id="2gq2gq"
create policy "Users can manage own interview sessions"
on public.interview_sessions
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

For `interview_messages`:

```sql id="uio2qk"
create policy "Users can manage own interview messages"
on public.interview_messages
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

---

### 10.11 Progress Policies

```sql id="p46w9q"
create policy "Users can read own progress events"
on public.progress_events
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create own progress events"
on public.progress_events
for insert
to authenticated
with check (user_id = auth.uid());
```

#### Notes

- Progress events should generally not be updated.
- If something was logged incorrectly, create a new event or handle cleanup server-side.

---

### 10.12 Usage Log Policies

```sql id="ueqr9q"
create policy "Users can read own usage logs"
on public.usage_logs
for select
to authenticated
using (user_id = auth.uid());

create policy "Users can create own usage logs"
on public.usage_logs
for insert
to authenticated
with check (user_id = auth.uid());

create policy "Admins can read usage logs"
on public.usage_logs
for select
to authenticated
using (public.is_admin());
```

#### Notes

- In production, usage log inserts may happen server-side only.
- Normal users should see summarized usage, not necessarily raw logs.

---

### 10.13 API Logs Policies

```sql id="ylaymi"
create policy "Admins can read api logs"
on public.api_logs
for select
to authenticated
using (public.is_admin());
```

#### Insert Strategy

For `api_logs`, inserts should be server-side only.

Do not let normal users insert arbitrary API log rows from the client.

---

### 10.14 Error Logs Policies

```sql id="ognikp"
create policy "Admins can read error logs"
on public.error_logs
for select
to authenticated
using (public.is_admin());
```

#### Insert Strategy

For `error_logs`, inserts should be server-side only.

Do not expose stack traces to normal users.

---

### 10.15 Admin Actions Policies

```sql id="oy863u"
create policy "Admins can read admin actions"
on public.admin_actions
for select
to authenticated
using (public.is_admin());

create policy "Admins can create admin actions"
on public.admin_actions
for insert
to authenticated
with check (
  admin_user_id = auth.uid()
  and public.is_admin()
);
```

---

### 10.16 Billing Customer Policies

```sql id="afcyuf"
create policy "Users can read own billing customer"
on public.billing_customers
for select
to authenticated
using (user_id = auth.uid());

create policy "Admins can read billing customers"
on public.billing_customers
for select
to authenticated
using (public.is_admin());
```

#### Notes

- Create/update should happen server-side only.
- Keep Stripe test mode minimal.

---

## 11. Profile Creation Strategy

The PRD requires both:

- Email/password login
- Google OAuth login

Both must create or load a profile row.

### Option A: Database Trigger on `auth.users` Insert

A database trigger automatically creates a profile when a new Supabase Auth user is created.

#### Pros

- Profile is created immediately.
- Works for email/password and OAuth.
- Reduces app-side profile missing issues.

#### Cons

- Trigger bugs can block signup.
- OAuth metadata mapping can vary.
- Harder for beginners to debug.

#### Draft Trigger Example

```sql id="mn2p03"
create or replace function public.handle_new_user()
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
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'user',
    'free'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
```

### Option B: Server-Side `ensureProfile()` After Login/Callback

The app calls a server-side function after:

- Email/password signup
- Email/password login
- Google OAuth callback
- Session refresh if profile missing

#### Pros

- Easier to debug in app flow.
- Can show user-friendly errors.
- OAuth callback can explicitly ensure profile.
- Works well with `/auth/callback`.

#### Cons

- Every auth entry point must remember to call it.
- If skipped, profile may be missing.

### Recommended MVP Approach

Use a hybrid but keep it simple:

```text id="8bmktf"
Primary: server-side ensureProfile()
Optional safety: database trigger later
```

For the 10-day MVP, the most beginner-friendly and controllable approach is:

1. After signup/login/callback, get authenticated session user.
2. Check if profile exists.
3. If profile exists, load it.
4. If profile does not exist, create it.
5. Redirect user to `/dashboard`.

### Google OAuth Metadata Mapping

For Google OAuth users:

| Profile Field | Source |
|---|---|
| `id` | `auth.users.id` |
| `email` | `auth.users.email` |
| `full_name` | `raw_user_meta_data.full_name` or `raw_user_meta_data.name` |
| `avatar_url` | `raw_user_meta_data.avatar_url` or `raw_user_meta_data.picture` |
| `role` | Default `user` |
| `plan` | Default `free` |

### If Profile Row Already Exists

If profile already exists:

- Do not create duplicate.
- Load existing profile.
- Optionally refresh `email`, `full_name`, and `avatar_url`.
- Never overwrite `role` or `plan` from OAuth metadata.

### If Profile Creation Fails

If profile creation fails:

- Do not expose SQL error to user.
- Show:
  ```text
  Could not complete login. Please try again.
  ```
- Log error in `error_logs`.
- Keep user away from dashboard until profile is available.

### OAuth Existing Email Edge Case

If a Google account email already exists with an email/password account:

- Supabase behavior depends on provider linking settings.
- MVP should handle safely.
- If login cannot complete, show:
  ```text
  Account exists. Please sign in using your original method.
  ```

---

## 12. Storage Bucket Design

### Bucket Name

Use one private bucket:

```text id="1qpnqr"
materials
```

Alternative allowed name:

```text id="cpqnwv"
documents
```

Recommended MVP name:

```text id="9k1nag"
materials
```

### Bucket Type

The bucket must be private.

```text id="td0ou9"
public = false
```

### Path Pattern

Recommended path:

```text id="vtkf6v"
{user_id}/{material_id}/original
```

or:

```text id="7njl8t"
{user_id}/{material_id}/{safe_original_filename}
```

Best MVP path:

```text id="ekdhon"
{user_id}/{material_id}/file
```

Reason:

- Avoids unsafe file names
- Easy to delete all files for one material
- Keeps ownership clear

### Allowed File Types

MVP allowed types:

| File Type | MIME Types |
|---|---|
| PDF | `application/pdf` |
| TXT | `text/plain` |
| Markdown optional | `text/markdown`, `text/plain` |

Although the roadmap mentions PDF/text/image upload, keep MVP upload safer with PDF/TXT/pasted text first. Images and OCR should not be part of the first database design.

### File Size Limit Recommendation

Recommended MVP limit:

```text id="hh31kc"
5 MB per file
```

Optional later:

```text id="1a97ny"
10 MB per file
```

Start small to avoid:

- Slow parsing
- High storage usage
- Expensive embeddings
- Timeout issues

### Storage Metadata

Store file information in `materials`:

- `storage_path`
- `original_file_name`
- `file_size_bytes`
- `mime_type`
- `processing_status`

### Storage RLS Policy Plan

Users can only access files under their own user ID folder.

Draft example:

```sql id="lracxj"
create policy "Users can upload own material files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

```sql id="bjy8t6"
create policy "Users can read own material files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

```sql id="ru0fjq"
create policy "Users can delete own material files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'materials'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

### Delete Behavior

When a material is deleted:

1. Set `materials.deleted_at`.
2. Hide material from normal list views.
3. Optionally delete the Storage file immediately.
4. Keep chunks until cleanup or hard delete.
5. Do not use soft-deleted material for new AI generation.

### Storage Security Notes

- Bucket must stay private.
- Do not use public URLs for private notes.
- Generate signed URLs only when needed.
- Do not expose internal storage paths in user-facing error messages.

---

## 13. Seed / Demo Data Plan

### Purpose

Seed data should help test the app without exposing real private notes or real credentials.

### Safe Seed Items

| Seed Item | Purpose |
|---|---|
| Demo admin profile note | Reminder to create admin manually after auth user exists |
| Sample learning goal | Test dashboard/roadmap UI |
| Sample material title only | Test materials list |
| Sample roadmap | Test roadmap task UI |
| Sample quiz | Test quiz UI |
| Sample flashcard deck | Test flashcard UI |
| Sample progress event | Test dashboard progress cards |

### Do Not Seed

Do not seed:

- Real passwords
- Real Google accounts
- Real private notes
- Real API keys
- Real Stripe customer IDs
- Real personal data
- Large extracted text
- Real embeddings unless generated safely for demo content

### Demo Admin Note

Admin creation should be manual/safe:

```text id="4d1doh"
Create normal account first → update role to admin from Supabase dashboard or controlled admin script.
```

Do not create fake `auth.users` directly in seed SQL.

### Sample Material Rule

For seed data, use safe placeholder content:

```text id="g6hiv9"
Title: Sample JavaScript Notes
Extracted text: Short fake educational paragraph only
```

Avoid copying copyrighted or private material into seed data.

---

## 14. Migration Order

Use this migration order when implementation begins.

### Step 1: Enable Extensions

```text id="rqghvb"
pgcrypto
vector
```

### Step 2: Create Enums or CHECK Constraints

For MVP, use CHECK constraints inside table definitions.

### Step 3: Create `profiles`

Create `profiles` first because all user-owned tables reference it.

### Step 4: Create Core Learning Tables

Create:

- `learning_goals`
- `roadmaps`
- `roadmap_tasks`

### Step 5: Create Material Tables

Create:

- `materials`

### Step 6: Create RAG / Vector Tables

Create:

- `material_chunks`
- `chat_sessions`
- `chat_messages`
- optional `match_material_chunks` RPC after dimension confirmation

### Step 7: Create Generated Content Tables

Create:

- `flashcard_decks`
- `flashcards`
- `quizzes`
- `quiz_questions`
- `quiz_attempts`
- `interview_sessions`
- `interview_messages`

### Step 8: Create Progress / Usage / Logging Tables

Core migration should include:

- `progress_events`
- `usage_logs`
- `api_logs`
- `error_logs`
- `admin_actions`

Do **not** include `billing_customers` in the core migration unless Stripe test mode is actively being implemented.

### Optional Day 9: Create Stripe Test-Mode Table

Only if Stripe test mode is included in Day 9, create:

- `billing_customers`

For the 10-day MVP, `profiles.plan` is enough for free/pro/demo plan checks.

### Step 9: Create Indexes

Create:

- `user_id` indexes
- parent relationship indexes
- `created_at` sorting indexes
- usage period indexes
- vector index

### Step 10: Enable RLS

Enable RLS on all public tables.

### Step 11: Create Policies

Create:

- Own-row policies
- Admin read policies
- Storage policies
- Logging access rules

### Step 12: Create Storage Bucket and Policies

Create private bucket:

```text id="14v1nc"
materials
```

Add storage policies for user-owned paths.

### Step 13: Add Seed / Demo Data

Only after:

- Auth is working
- Profile creation is working
- RLS policies are verified

---

## 15. Security Checklist

- [ ] RLS enabled on all user-owned tables
- [ ] Every user-owned table has `user_id`
- [ ] `auth.uid()` used in RLS policies
- [ ] Client-provided `user_id` is never trusted
- [ ] `profiles.id` references `auth.users.id`
- [ ] OAuth users and email/password users use same profile system
- [ ] Google OAuth does not create separate user table
- [ ] `role` defaults to `user`
- [ ] `plan` defaults to `free`
- [ ] Users cannot update their own role directly
- [ ] Users cannot update their own plan directly
- [ ] Profiles do not duplicate active AI usage counters
- [ ] Usage limits are enforced using `profiles.plan` plus `usage_logs`
- [ ] Service role key is never used client-side
- [ ] AI provider keys are never used client-side
- [ ] Vector search always filters by `user_id`
- [ ] Vector RPC uses `auth.uid()` or verified server session user ID
- [ ] Storage bucket is private
- [ ] Storage paths include `user_id`
- [ ] Storage policies restrict access to owner folder
- [ ] Admin policies are explicit
- [ ] Admin logs do not expose private document content unnecessarily
- [ ] API logs do not store raw secrets
- [ ] Error logs do not expose secrets to users
- [ ] Stack traces are admin/server-only
- [ ] Soft-deleted materials are hidden from normal UI
- [ ] Soft-deleted materials are not used for new AI generation
- [ ] OAuth callback/profile creation failures are logged safely
- [ ] Billing table is test-mode only if included

---

## 16. Scope Control Notes

### Do Not Add Teams / Workspaces

No tables like:

```text id="1ccl7s"
teams
organizations
workspace_members
team_documents
```

These are post-MVP.

### Do Not Add Public Sharing

No tables like:

```text id="3e4dzo"
shared_links
public_documents
published_decks
community_quizzes
```

Private learning materials only.

### Do Not Add Complex Billing

Avoid:

```text id="zp7e4k"
invoices
payments
coupons
tax_rates
billing_events
refunds
```

For MVP, `profiles.plan` is enough.

Optional `billing_customers` exists only for Stripe test-mode reference and should be skipped unless Day 9 Stripe test mode is implemented.

### Do Not Add Multiple AI Provider Tables

No tables like:

```text id="w7lu9y"
ai_providers
model_configs
provider_keys
model_prices
```

Use one provider first.

The research recommendation is to keep generation on one provider for the first version to reduce config sprawl and debugging time.

### Do Not Add OCR-Specific Tables

Avoid:

```text id="gubzrj"
ocr_jobs
image_pages
ocr_blocks
ocr_confidence_scores
```

For MVP:

- PDF
- TXT
- pasted text

OCR can be a phase-two feature.

### Do Not Over-Normalize Before MVP

Do not split everything into tiny tables too early.

For MVP, `jsonb` is acceptable for:

- Quiz answers
- Question options
- AI feedback
- Source chunk IDs
- Metadata
- Logs

Normalize later only when the app has real usage.

---

## 17. Final Database Summary

### Final Table List

#### A. Required MVP Tables

1. `profiles`
2. `learning_goals`
3. `materials`
4. `material_chunks`
5. `chat_sessions`
6. `chat_messages`
7. `roadmaps`
8. `roadmap_tasks`
9. `flashcard_decks`
10. `flashcards`
11. `quizzes`
12. `quiz_questions`
13. `quiz_attempts`
14. `interview_sessions`
15. `interview_messages`
16. `progress_events`
17. `usage_logs`
18. `api_logs`
19. `error_logs`
20. `admin_actions`

#### B. Optional Day 9 Stripe Test-Mode Table

21. `billing_customers`

Use `billing_customers` only if Stripe test mode is implemented in Day 9. Otherwise, keep plan checks on `profiles.plan` and usage enforcement through `usage_logs`.

### Most Important Tables for Day 3 Auth

Day 3 focuses on Auth, Profile, and Proxy. The roadmap places Supabase Auth, signup, login, logout, forgot password, profile table, session provider, and route protection in this phase.

Most important tables:

1. `profiles`

Day 3 must verify:

- Email/password user creates or loads profile
- Google OAuth user creates or loads profile
- `role` defaults to `user`
- `plan` defaults to `free`
- Logged-in user can read own profile
- Admin role can be manually assigned later

### Most Important Tables for Day 5 Upload

Day 5 focuses on the materials upload system.

Most important tables:

1. `materials`
2. `material_chunks`, if chunking starts early

Day 5 must verify:

- Valid PDF/TXT/pasted text creates material row
- Invalid files are blocked
- User only sees own materials
- Processing status updates correctly
- Soft-deleted material disappears from normal UI

### Most Important Tables for Day 7 RAG

Day 7 focuses on RAG chat over uploaded notes.

Most important tables:

1. `materials`
2. `material_chunks`
3. `chat_sessions`
4. `chat_messages`
5. `usage_logs`

Day 7 must verify:

- Text is chunked
- Embeddings are stored
- Vector search filters by `user_id`
- RAG answers use matched chunks
- Chat messages store optional `source_chunk_ids`
- No cross-user retrieval is possible

### What File Should Be Created Next After `DATABASE_SCHEMA.md`

After this file is reviewed, the next file should be:

```text id="4wy7gp"
AGENT_RULES.md
```

It should define:

- AI generation behavior
- RAG answer rules
- Roadmap generation rules
- Quiz generation rules
- Flashcard generation rules
- Mock interview rules
- Fallback behavior
- JSON output expectations
- Safety and hallucination-control rules
