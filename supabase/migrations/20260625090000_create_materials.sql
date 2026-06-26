create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null
    check (type in ('pdf', 'txt', 'pasted_text')),
  storage_path text,
  original_file_name text,
  file_size_bytes bigint
    check (file_size_bytes is null or file_size_bytes >= 0),
  mime_type text,
  extracted_text text,
  processing_status text not null default 'pending'
    check (processing_status in ('pending', 'processing', 'completed', 'failed')),
  processing_error text,
  chunk_count integer not null default 0
    check (chunk_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists materials_user_id_idx
  on public.materials(user_id);
create index if not exists materials_user_created_idx
  on public.materials(user_id, created_at desc);
create index if not exists materials_processing_status_idx
  on public.materials(processing_status);
create index if not exists materials_deleted_at_idx
  on public.materials(deleted_at);
create index if not exists materials_user_active_created_idx
  on public.materials(user_id, created_at desc)
  where deleted_at is null;
create unique index if not exists materials_storage_path_unique_idx
  on public.materials(storage_path)
  where storage_path is not null;

drop trigger if exists set_materials_updated_at on public.materials;
create trigger set_materials_updated_at
before update on public.materials
for each row
execute function public.set_profiles_updated_at();

alter table public.materials enable row level security;

revoke all on public.materials from anon, authenticated;

grant select, insert, update on public.materials to authenticated;

drop policy if exists "Users can read own active materials" on public.materials;
create policy "Users can read own active materials"
on public.materials
for select
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
);

drop policy if exists "Users can create own materials" on public.materials;
create policy "Users can create own materials"
on public.materials
for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own materials" on public.materials;
create policy "Users can update own materials"
on public.materials
for update
to authenticated
using (
  user_id = auth.uid()
  and deleted_at is null
)
with check (user_id = auth.uid());
