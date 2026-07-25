-- ============================================================================
-- projectParzelle: Geburtsdatum im Profil für automatische Kalenderanzeige
-- Führe diese Datei nach 0002_event_chat.sql im Supabase SQL Editor aus.
-- ============================================================================

alter table public.profiles add column birth_date date;
