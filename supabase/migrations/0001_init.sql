-- ============================================================================
-- projectParzelle: Fanclub-App Datenbankschema
-- Führe diese Datei im Supabase SQL Editor aus (Dashboard > SQL Editor > New query)
-- oder per Supabase CLI: supabase db push
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- profiles: ein Datensatz pro Mitglied, 1:1 an auth.users gekoppelt
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Hilfsfunktion: prüft ob der eingeloggte User Admin ist.
-- security definer, damit keine rekursiven RLS-Probleme entstehen,
-- wenn andere Tabellen-Policies diese Funktion aufrufen.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Alle eingeloggten Mitglieder dürfen alle Profile lesen (für Anzeige von Namen)
create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

-- Mitglieder dürfen nur ihr eigenes Profil bearbeiten (z.B. Anzeigename)
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Es gibt bewusst KEINE insert-Policy für normale User: Profile werden
-- ausschließlich serverseitig (Service-Role bzw. Trigger) angelegt,
-- niemals direkt vom Client.

-- Trigger: Wenn ein neuer auth.users-Eintrag entsteht, automatisch ein
-- passendes profiles-Row anlegen. display_name/role kommen aus den
-- user_metadata, die beim Erstellen des Users (Admin API) mitgegeben werden.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'member')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------------------
-- invites: Einladungslinks, die der Admin generiert
-- ----------------------------------------------------------------------------
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  email text,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_by uuid not null references public.profiles (id),
  used_at timestamptz,
  used_by uuid references public.profiles (id),
  expires_at timestamptz not null default (now() + interval '14 days'),
  created_at timestamptz not null default now()
);

alter table public.invites enable row level security;

-- Nur Admins dürfen Einladungen sehen/erstellen/ändern über den normalen Client.
-- Die Validierung eines Tokens bei der Registrierung läuft über eine serverseitige
-- Route mit Service-Role-Key und umgeht RLS bewusst.
create policy "invites_admin_all"
  on public.invites for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- events: Termine im Kalender
-- ----------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date not null,
  event_time time,
  description text,
  location text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

create policy "events_select_authenticated"
  on public.events for select
  to authenticated
  using (true);

create policy "events_admin_insert"
  on public.events for insert
  to authenticated
  with check (public.is_admin());

create policy "events_admin_update"
  on public.events for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "events_admin_delete"
  on public.events for delete
  to authenticated
  using (public.is_admin());

create index events_event_date_idx on public.events (event_date);

-- ----------------------------------------------------------------------------
-- photos: Galerie-Bilder (Metadaten; die Dateien selbst liegen in Storage)
-- ----------------------------------------------------------------------------
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  caption text,
  uploader_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.photos enable row level security;

create policy "photos_select_authenticated"
  on public.photos for select
  to authenticated
  using (true);

create policy "photos_insert_own"
  on public.photos for insert
  to authenticated
  with check (auth.uid() = uploader_id);

create policy "photos_delete_own_or_admin"
  on public.photos for delete
  to authenticated
  using (auth.uid() = uploader_id or public.is_admin());

-- ----------------------------------------------------------------------------
-- Storage Bucket für Galerie-Fotos
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('gallery-photos', 'gallery-photos', true)
on conflict (id) do nothing;

create policy "gallery_photos_read_authenticated"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'gallery-photos');

create policy "gallery_photos_insert_authenticated"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'gallery-photos');

create policy "gallery_photos_delete_own_or_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'gallery-photos'
    and (owner = auth.uid() or public.is_admin())
  );
