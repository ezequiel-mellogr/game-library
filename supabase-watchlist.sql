-- Ejecuta este SQL en el editor SQL de tu proyecto Supabase
-- (Dashboard → SQL Editor → New query)

create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('movie', 'series')),
  description text,
  image_url text,
  original_url text,
  status text not null default 'want_to_watch' check (status in ('want_to_watch', 'watching', 'completed', 'dropped')),
  score integer check (score >= 1 and score <= 10),
  notes text,
  year integer,
  created_at timestamptz default now()
);

-- Índices para filtrar y ordenar
create index if not exists watchlist_created_at on watchlist(created_at desc);
create index if not exists watchlist_status on watchlist(status);
create index if not exists watchlist_type on watchlist(type);
