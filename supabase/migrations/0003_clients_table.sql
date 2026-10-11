-- Table clients (absente dans la base distante)
-- À exécuter : Dashboard Supabase → SQL Editor → New query → Run

create table if not exists public.clients (
  id bigint generated always as identity primary key,
  name text not null default '',
  phone text not null default '',
  email text not null default '',
  city text not null default '',
  address text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists clients_created_at_idx on public.clients (created_at desc);