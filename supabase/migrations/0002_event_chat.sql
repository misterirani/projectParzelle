-- ============================================================================
-- projectParzelle: Termine für alle Mitglieder + Teilnehmerliste + Gruppenchat
-- Führe diese Datei nach 0001_init.sql im Supabase SQL Editor aus.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- events: jedes Mitglied darf Termine erstellen; bearbeiten/löschen dürfen nur
-- der Ersteller oder ein Admin, und nur solange der Termin nicht in der
-- Vergangenheit liegt. Vergangene Termine sind komplett gesperrt.
-- ----------------------------------------------------------------------------
drop policy "events_admin_insert" on public.events;
drop policy "events_admin_update" on public.events;
drop policy "events_admin_delete" on public.events;

create policy "events_insert_authenticated"
  on public.events for insert
  to authenticated
  with check (auth.uid() = created_by and event_date >= current_date);

create policy "events_update_own_or_admin"
  on public.events for update
  to authenticated
  using (
    (auth.uid() = created_by or public.is_admin())
    and event_date >= current_date
  )
  with check (
    (auth.uid() = created_by or public.is_admin())
    and event_date >= current_date
  );

create policy "events_delete_own_or_admin"
  on public.events for delete
  to authenticated
  using (
    (auth.uid() = created_by or public.is_admin())
    and event_date >= current_date
  );

-- ----------------------------------------------------------------------------
-- event_participants: "Ich bin dabei"-Liste pro Termin
-- ----------------------------------------------------------------------------
create table public.event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table public.event_participants enable row level security;

create policy "event_participants_select_authenticated"
  on public.event_participants for select
  to authenticated
  using (true);

create policy "event_participants_insert_own"
  on public.event_participants for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.events e
      where e.id = event_id and e.event_date >= current_date
    )
  );

create policy "event_participants_delete_own"
  on public.event_participants for delete
  to authenticated
  using (auth.uid() = user_id);

create index event_participants_event_id_idx on public.event_participants (event_id);

-- ----------------------------------------------------------------------------
-- event_messages: Gruppenchat pro Termin
-- ----------------------------------------------------------------------------
create table public.event_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 2000),
  created_at timestamptz not null default now()
);

alter table public.event_messages enable row level security;

create policy "event_messages_select_authenticated"
  on public.event_messages for select
  to authenticated
  using (true);

create policy "event_messages_insert_own"
  on public.event_messages for insert
  to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.events e
      where e.id = event_id and e.event_date >= current_date
    )
  );

create index event_messages_event_id_created_at_idx
  on public.event_messages (event_id, created_at);

-- Realtime aktivieren, damit neue Chatnachrichten live bei allen ankommen
alter publication supabase_realtime add table public.event_messages;
