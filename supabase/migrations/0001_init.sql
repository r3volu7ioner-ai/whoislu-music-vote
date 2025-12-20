
-- WhoIsLu voting app schema
create extension if not exists pgcrypto;

create table if not exists tracks (
  id bigserial primary key,
  title text not null,
  duration text not null default '',
  is_bonus boolean not null default false,
  edition text not null default '',
  emotional_tag text not null default '',
  cover_image text not null default '',
  audio_url text not null default '',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists voters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists votes (
  id bigserial primary key,
  voter_id uuid not null references voters(id) on delete cascade,
  track_id bigint not null references tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(voter_id, track_id)
);

create table if not exists favorites (
  id bigserial primary key,
  voter_id uuid not null references voters(id) on delete cascade,
  track_id bigint not null references tracks(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(voter_id, track_id)
);

create table if not exists comments (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null references voters(id) on delete cascade,
  track_id bigint not null references tracks(id) on delete cascade,
  text text not null,
  timestamp int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists site_content (
  id bigserial primary key,
  key text not null unique,
  value text not null default '',
  created_at timestamptz not null default now()
);

-- useful trigger for updated_at
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_tracks_updated_at on tracks;
create trigger trg_tracks_updated_at
before update on tracks
for each row execute procedure set_updated_at();

-- Minimal RLS: edge function uses service role, so we can keep RLS off.
-- If you want, you can enable RLS later.

