export type Role = "admin" | "member";

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  role: Role;
  created_at: string;
}

export interface Invite {
  id: string;
  token: string;
  email: string | null;
  role: Role;
  created_by: string;
  used_at: string | null;
  used_by: string | null;
  expires_at: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  event_time: string | null; // HH:MM:SS
  description: string | null;
  location: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  storage_path: string;
  caption: string | null;
  uploader_id: string;
  created_at: string;
  uploader?: Profile | null;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  created_at: string;
  profile?: Profile | null;
}

export interface EventMessage {
  id: string;
  event_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author?: Profile | null;
}
