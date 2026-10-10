-- =====================================================
-- Baol Electronik — Schéma Supabase (PostgreSQL)
-- À exécuter dans le SQL Editor de votre projet Supabase
-- =====================================================

-- PROFILS (rôles utilisateurs)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'client' check (role in ('client', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

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

create policy "profiles: lecture propre profil ou admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: mise a jour propre profil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- PRODUITS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  price numeric(12,2) not null,
  old_price numeric(12,2),
  stock integer not null default 0,
  category text not null default 'Smartphones',
  brand text not null default 'Apple',
  images text[] not null default '{}',
  colors jsonb not null default '[]',
  storage jsonb not null default '[]',
  rating numeric(2,1) not null default 5.0,
  reviews_count integer not null default 0,
  featured boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "products: lecture publique"
  on public.products for select using (true);
create policy "products: admin ecrit"
  on public.products for insert
  with check (public.is_admin());
create policy "products: admin maj"
  on public.products for update
  using (public.is_admin())
  with check (public.is_admin());
create policy "products: admin suppression"
  on public.products for delete
  using (public.is_admin());

-- COMMANDES
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  items jsonb not null default '[]',
  total numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'shipped', 'delivered', 'cancelled')),
  customer_name text,
  customer_phone text,
  customer_city text,
  note text,
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "orders: insertion anonyme (checkout WhatsApp)"
  on public.orders for insert with check (true);
create policy "orders: admin lecture"
  on public.orders for select using (public.is_admin());
create policy "orders: admin maj"
  on public.orders for update using (public.is_admin())
  with check (public.is_admin());

-- MÉDIATHÈQUE
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  created_at timestamptz not null default now()
);

alter table public.media enable row level security;

create policy "media: lecture publique"
  on public.media for select using (true);
create policy "media: admin ecrit"
  on public.media for insert with check (public.is_admin());
create policy "media: admin suppression"
  on public.media for delete using (public.is_admin());

-- PARAMÈTRES CMS (thème, textes, WhatsApp)
create table if not exists public.settings (
  id integer primary key default 1,
  data jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

create policy "settings: lecture publique"
  on public.settings for select using (true);
create policy "settings: admin maj"
  on public.settings for update using (public.is_admin())
  with check (public.is_admin());
create policy "settings: admin insertion"
  on public.settings for insert with check (public.is_admin());

insert into public.settings (id, data)
values (1, '{
  "primary": "#1E40AF",
  "secondary": "#0A1929",
  "whatsapp": "221770000000",
  "hero": {
    "title": "L\\u00e9g\\u00e8re. Rapide. Sans limites.",
    "subtitle": "D\\u00e9couvrez l\\u2019iPhone 16 Pro et toute une gamme de tech premium \\u00e0 prix imbattables.",
    "cta": "Acheter Maintenant",
    "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80"
  },
  "promo": {
    "title": "Jusqu\\u00e0 30% de r\\u00e9duction",
    "text": "Offres exceptionnelles sur une s\\u00e9lection de smartphones et accessoires. Stock limit\\u00e9 !",
    "discount": "-30%"
  },
  "footer": {
    "text": "Baol Electronik — Votre boutique tech premium de confiance. Smartphones, accessoires et plus encore."
  }
}'::jsonb)
on conflict (id) do nothing;

-- STORAGE : bucket médias
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "storage: lecture publique"
  on storage.objects for select using (bucket_id = 'media');
create policy "storage: upload admin"
  on storage.objects for insert
  with check (bucket_id = 'media' and public.is_admin());
create policy "storage: suppression admin"
  on storage.objects for delete
  using (bucket_id = 'media' and public.is_admin());

-- Pour devenir admin : après inscription, exécuter :
-- update public.profiles set role = 'admin' where id = 'UUID-DE-VOTRE-UTILISATEUR';
