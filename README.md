# projectParzelle

Fanclub-App mit Next.js (App Router, TypeScript, Tailwind CSS) und Supabase
(Datenbank, Auth, Storage). Registrierung ist nur über Einladungslinks
möglich, die ein Admin generiert.

## 1. Supabase-Projekt einrichten

1. Lege unter [supabase.com](https://supabase.com) ein neues Projekt an.
2. Öffne den **SQL Editor** und führe den Inhalt von
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)
   aus. Das legt die Tabellen `profiles`, `invites`, `events`, `photos`, alle
   RLS-Policies sowie den Storage-Bucket `gallery-photos` an.
3. Gehe zu **Authentication → Providers → Email** und deaktiviere
   **"Allow new users to sign up"**. Damit sind Accounts ausschließlich über
   die Admin-API erreichbar, also nur über gültige Einladungslinks aus dieser
   App.
4. Kopiere aus **Project Settings → API**:
   - `Project URL`
   - `anon public` Key
   - `service_role` Key (geheim halten, niemals im Client verwenden!)

## 2. Umgebungsvariablen

```bash
cp .env.local.example .env.local
```

Trage die Werte aus Schritt 1.4 ein sowie die Basis-URL der App (wird für
Einladungslinks verwendet):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 3. Abhängigkeiten installieren & Dev-Server starten

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## 4. Ersten Admin-Account anlegen

Da eine Registrierung ohne Einladung nicht möglich ist, brauchst du für den
allerersten Zugang ein Skript, das direkt über den Service-Role-Key einen
Admin-Account erstellt:

```bash
npm run create-admin -- deine@email.de "einSicheresPasswort" "Dein Name"
```

Danach kannst du dich unter `/login` anmelden und über **Einladungen**
weitere Mitglieder (oder Admins) einladen.

## Funktionen

- **Auth über Einladungslinks** – nur wer einen Link von `/admin/invites`
  bekommt, kann sich unter `/register?token=...` registrieren. Login danach
  ganz normal mit E-Mail + Passwort. Alle Seiten außer Login/Register sind
  per Middleware geschützt.
- **Kalender (`/kalender`)** – Monatsansicht mit Vor/Zurück-Navigation.
  Admins können Termine erstellen, bearbeiten und löschen, Mitglieder sehen
  sie nur.
- **Galerie (`/galerie`)** – Mitglieder laden Fotos hoch (Supabase Storage),
  Grid-Ansicht mit Lightbox, Uploader-Name und Datum werden angezeigt.
  Löschen können Uploader ihre eigenen Fotos, Admins alle.

## Projektstruktur

```
app/
  login/              Login-Seite + Server Action
  register/           Registrierung per Einladungstoken
  (protected)/         Geschützter Bereich (Middleware + Layout-Guard)
    kalender/          Kalender-Seite + Server Actions
    galerie/           Galerie-Seite + Server Actions
    admin/invites/     Einladungen verwalten (nur Admins)
lib/
  supabase/            Browser-, Server- und Admin-(Service-Role-)Client
  auth.ts              Hilfsfunktionen requireProfile()/requireAdmin()
  invites.ts           Token-Validierung für die Registrierung
supabase/migrations/    SQL-Schema (Tabellen, RLS, Storage-Policies)
scripts/create-admin.mjs  Einmaliges Anlegen des ersten Admin-Accounts
```

## Deployment

Bei Deployment (z.B. Vercel) die gleichen Umgebungsvariablen als Secrets
hinterlegen und `NEXT_PUBLIC_SITE_URL` auf die tatsächliche Domain setzen,
damit Einladungslinks korrekt funktionieren.
