-- =====================================================================
-- BaolElectronik — Schéma complet Supabase
-- Exécuté depuis : Dashboard Supabase > SQL Editor (la page que vous avez ouverte)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null default '',
  slug text unique not null,
  description text default '',
  price numeric default 0,
  old_price numeric,
  stock integer default 0,
  category text default '',
  subcategory text default '',
  brand text default '',
  images jsonb default '[]'::jsonb,
  colors jsonb default '[]'::jsonb,
  storage jsonb default '[]'::jsonb,
  rating numeric default 0,
  reviews_count integer default 0,
  featured boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  number text unique,
  status text default 'pending',
  total numeric default 0,
  customer_name text default '',
  customer_phone text default '',
  customer_email text default '',
  customer_city text default '',
  customer_address text default '',
  items jsonb default '[]'::jsonb,
  note text default '',
  created_at timestamptz default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text default '',
  phone text default '',
  email text default '',
  city text default '',
  address text default '',
  note text default '',
  created_at timestamptz default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  name text default '',
  url text default '',
  created_at timestamptz default now()
);

create table if not exists public.settings (
  id integer primary key,
  data jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);

-- Profils : liés aux comptes d'authentification (le rôle "admin" contrôle l'accès au back-office)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- RLS (Règles d'accès)
-- ---------------------------------------------------------------------

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.clients enable row level security;
alter table public.media enable row level security;
alter table public.settings enable row level security;
alter table public.profiles enable row level security;

create policy "products public" on public.products for all using (true) with check (true);
create policy "orders public" on public.orders for all using (true) with check (true);
create policy "clients public" on public.clients for all using (true) with check (true);
create policy "media public" on public.media for all using (true) with check (true);
create policy "settings public" on public.settings for all using (true) with check (true);
create policy "profiles read" on public.profiles for select using (true);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);

-- ---------------------------------------------------------------------
-- Auto-création du profil lors de la création d'un compte auth
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- Bucket de stockage "media" (pour la médiathèque)
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media bucket read" on storage.objects for select using (bucket_id = 'media');
create policy "media bucket insert" on storage.objects for insert with check (bucket_id = 'media');
create policy "media bucket update" on storage.objects for update using (bucket_id = 'media');
create policy "media bucket delete" on storage.objects for delete using (bucket_id = 'media');

-- =====================================================================
-- Données initiales (démo)
-- =====================================================================

-- Paramètres de la boutique (ligne id = 1)
insert into public.settings (id, data)
values (1, '{
  "primary": "#1E40AF",
  "secondary": "#0A1929",
  "whatsapp": "221771242657",
  "logo": "",
  "favicon": "",
  "categories": [
    {"name": "Smartphones", "subcategories": ["Apple", "Samsung", "Google", "Xiaomi"]},
    {"name": "Audio", "subcategories": ["Écouteurs", "Casques", "Enceintes"]},
    {"name": "Montres", "subcategories": ["Connectées", "Sport"]},
    {"name": "Accessoires", "subcategories": ["Chargeurs", "Batteries", "Coques"]}
  ],
  "payments": [],
  "hero": {
    "title": "Légère. Rapide. Sans limites.",
    "subtitle": "Découvrez l''iPhone 16 Pro et toute une gamme de tech premium à prix imbattables.",
    "cta": "Acheter Maintenant",
    "image": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80"
  },
  "promo": {
    "title": "Jusqu''à 30% de réduction",
    "text": "Offres exceptionnelles sur une sélection de smartphones et accessoires. Stock limité !",
    "discount": "-30%"
  },
  "footer": {
    "text": "Baol Electronik — Votre boutique tech premium de confiance. Smartphones, accessoires et plus encore."
  },
  "address": "Dakar, Sénégal",
  "email": "contact@baolelectronik.sn"
}'::jsonb)
on conflict (id) do nothing;

-- Produits démo (12)
insert into public.products (name, slug, description, price, old_price, stock, category, subcategory, brand, images, colors, storage, rating, reviews_count, featured, created_at)
values
('iPhone 16 Pro Max', 'iphone-16-pro-max', 'L''iPhone 16 Pro Max redéfinit la puissance mobile avec la puce A18 Pro, un écran Super Retina XDR 6,9" et un appareil photo 48 Mpx révolutionnaire. Titane premium, autonomie exceptionnelle.', 899000, 1050000, 25, 'Smartphones', '', 'Apple', '["https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&q=80","https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80"]'::jsonb, '[{"name":"Titane Naturel","hex":"#B8AFA3"},{"name":"Titane Noir","hex":"#2C2C2E"},{"name":"Titane Blanc","hex":"#E8E6E3"}]'::jsonb, '[{"label":"256 Go","delta":0},{"label":"512 Go","delta":120000},{"label":"1 To","delta":250000}]'::jsonb, 4.9, 128, true, now() - interval '12 days'),
('Samsung Galaxy S25 Ultra', 'galaxy-s25-ultra', 'Galaxy S25 Ultra : Galaxy AI, S Pen intégré, écran AMOLED 6,9" et triple capteur 200 Mpx. Le sommet de la technologie Samsung.', 749000, 899000, 30, 'Smartphones', '', 'Samsung', '["https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&q=80","https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=900&q=80"]'::jsonb, '[{"name":"Violet Titanium","hex":"#6B5B8E"},{"name":"Gris Acier","hex":"#8E8E93"},{"name":"Noir","hex":"#1C1C1E"}]'::jsonb, '[{"label":"256 Go","delta":0},{"label":"512 Go","delta":100000},{"label":"1 To","delta":200000}]'::jsonb, 4.8, 94, true, now() - interval '10 days'),
('Google Pixel 9 Pro', 'pixel-9-pro', 'Pixel 9 Pro : l''IA de Google au service de la photo. Puce Tensor G4, écran Super Actua et 7 ans de mises à jour.', 549000, 649000, 18, 'Smartphones', '', 'Google', '["https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&q=80"]'::jsonb, '[{"name":"Obsidienne","hex":"#1C1C1E"},{"name":"Porcelaine","hex":"#F0EBE3"},{"name":"Iris","hex":"#7B6C9E"}]'::jsonb, '[{"label":"128 Go","delta":0},{"label":"256 Go","delta":70000}]'::jsonb, 4.7, 61, true, now() - interval '8 days'),
('Xiaomi 14 Ultra', 'xiaomi-14-ultra', 'Xiaomi 14 Ultra : optique Leica Summilux, écran AMOLED WQHD+ 120 Hz et charge 90W. Photo de niveau professionnel.', 629000, 749000, 12, 'Smartphones', '', 'Xiaomi', '["https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=900&q=80"]'::jsonb, '[{"name":"Noir","hex":"#1C1C1E"},{"name":"Blanc","hex":"#F5F5F7"}]'::jsonb, '[{"label":"256 Go","delta":0},{"label":"512 Go","delta":90000}]'::jsonb, 4.6, 47, true, now() - interval '6 days'),
('iPhone 15', 'iphone-15', 'iPhone 15 : Dynamic Island, capteur 48 Mpx, USB-C et puce A16 Bionic. L''essentiel d''iPhone, en aluminium et verre.', 499000, 599000, 40, 'Smartphones', '', 'Apple', '["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900&q=80"]'::jsonb, '[{"name":"Rose","hex":"#F2D4D0"},{"name":"Bleu","hex":"#A9C4D6"},{"name":"Noir","hex":"#1C1C1E"},{"name":"Jaune","hex":"#F5E6A8"}]'::jsonb, '[{"label":"128 Go","delta":0},{"label":"256 Go","delta":80000}]'::jsonb, 4.8, 203, false, now() - interval '20 days'),
('Samsung Galaxy A55', 'galaxy-a55', 'Galaxy A55 : écran Super AMOLED 120 Hz, caméra 50 Mpx et batterie 5000 mAh. Le meilleur rapport qualité-prix.', 289000, 349000, 55, 'Smartphones', '', 'Samsung', '["https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=900&q=80"]'::jsonb, '[{"name":"Iceblue","hex":"#B7CDD9"},{"name":"Lilac","hex":"#C9B8D6"},{"name":"Graphite","hex":"#3A3A3C"}]'::jsonb, '[{"label":"128 Go","delta":0},{"label":"256 Go","delta":50000}]'::jsonb, 4.5, 88, false, now() - interval '15 days'),
('AirPods Pro 2 (USB-C)', 'airpods-pro-2', 'AirPods Pro 2 avec USB-C : réduction de bruit active, audio adaptatif et boîtier MagSafe. Son immersif partout.', 229000, 269000, 60, 'Audio', '', 'Apple', '["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=80","https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=900&q=80"]'::jsonb, '[{"name":"Blanc","hex":"#F5F5F7"}]'::jsonb, '[]'::jsonb, 4.9, 312, true, now() - interval '5 days'),
('Casque Sony WH-1000XM5', 'sony-wh-1000xm5', 'Casque sans fil ANC leader du marché : 30 heures d''autonomie, audio haute résolution et microphones haute précision.', 349000, 399000, 22, 'Audio', '', 'Sony', '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80","https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=900&q=80"]'::jsonb, '[{"name":"Noir","hex":"#1C1C1E"},{"name":"Bleu","hex":"#2E4A6B"},{"name":"Argent","hex":"#C0C0C0"}]'::jsonb, '[]'::jsonb, 4.8, 176, false, now() - interval '18 days'),
('Apple Watch Series 10', 'apple-watch-s10', 'Apple Watch Series 10 : écran OLED plus grand, capteurs santé avancés et charge rapide. Votre allié santé au quotidien.', 399000, 459000, 28, 'Montres', '', 'Apple', '["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80","https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=900&q=80"]'::jsonb, '[{"name":"Acier Noir","hex":"#1C1C1E"},{"name":"Acier Crème","hex":"#E8DCC8"}]'::jsonb, '[{"label":"42 mm","delta":0},{"label":"46 mm","delta":40000}]'::jsonb, 4.7, 95, true, now() - interval '9 days'),
('Chargeur GaN 100W', 'chargeur-gan-100w', 'Chargeur rapide GaN 100W avec 3 ports USB-C + USB-A. Chargez laptop, smartphone et écouteurs simultanément.', 49000, 69000, 120, 'Accessoires', '', 'Anker', '["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=80"]'::jsonb, '[{"name":"Blanc","hex":"#F5F5F7"},{"name":"Noir","hex":"#1C1C1E"}]'::jsonb, '[]'::jsonb, 4.6, 54, false, now() - interval '25 days'),
('Powerbank 20 000 mAh', 'powerbank-20000', 'Batterie externe 20 000 mAh avec charge rapide 65W et affichage LED. Autonomie pour plusieurs jours.', 39000, 49000, 85, 'Accessoires', '', 'Anker', '["https://images.unsplash.com/photo-1609592806596-b43bada2f4be?w=900&q=80"]'::jsonb, '[{"name":"Noir","hex":"#1C1C1E"}]'::jsonb, '[]'::jsonb, 4.5, 41, false, now() - interval '30 days'),
('Enceinte JBL Flip 6', 'jbl-flip-6', 'Enceinte portable JBL Flip 6 : son JBL Original Pro, résistance IP67 et 12 heures d''écoute.', 129000, 159000, 40, 'Audio', '', 'JBL', '["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80"]'::jsonb, '[{"name":"Noir","hex":"#1C1C1E"},{"name":"Bleu","hex":"#1E40AF"},{"name":"Rouge","hex":"#B22222"}]'::jsonb, '[]'::jsonb, 4.7, 133, false, now() - interval '22 days')
on conflict (slug) do nothing;

-- Commandes démo (8)
insert into public.orders (number, status, total, customer_name, customer_phone, customer_email, customer_city, customer_address, items, note, created_at)
values
('BE-1001', 'delivered', 919000, 'Aminata Diop', '+221 77 123 45 67', '', 'Dakar', '', '[{"product_id":"p1","name":"iPhone 16 Pro Max","price":899000,"qty":1,"color":"Titane Noir","storage":"256 Go","image":"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&q=80"}]'::jsonb, '', now() - interval '12 days'),
('BE-1002', 'delivered', 229000, 'Moussa Ba', '+221 76 555 44 33', '', 'Thiès', '', '[{"product_id":"p7","name":"AirPods Pro 2 (USB-C)","price":229000,"qty":1,"color":"Blanc","storage":"","image":"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=80"}]'::jsonb, '', now() - interval '10 days'),
('BE-1003', 'shipped', 749000, 'Fatou Ndiaye', '+221 78 222 11 00', '', 'Dakar', '', '[{"product_id":"p2","name":"Samsung Galaxy S25 Ultra","price":749000,"qty":1,"color":"Violet Titanium","storage":"256 Go","image":"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=900&q=80"}]'::jsonb, '', now() - interval '7 days'),
('BE-1004', 'shipped', 598000, 'Ibrahima Sow', '+221 70 999 88 77', '', 'Saint-Louis', '', '[{"product_id":"p3","name":"Google Pixel 9 Pro","price":549000,"qty":1,"color":"Obsidienne","storage":"128 Go","image":"https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=900&q=80"},{"product_id":"p10","name":"Chargeur GaN 100W","price":49000,"qty":1,"color":"Noir","storage":"","image":"https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=900&q=80"}]'::jsonb, '', now() - interval '5 days'),
('BE-1005', 'pending', 1128000, 'Aïssatou Fall', '+221 77 888 77 66', '', 'Ziguinchor', '', '[{"product_id":"p1","name":"iPhone 16 Pro Max","price":899000,"qty":1,"color":"Titane Naturel","storage":"256 Go","image":"https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=900&q=80"},{"product_id":"p7","name":"AirPods Pro 2 (USB-C)","price":229000,"qty":1,"color":"Blanc","storage":"","image":"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=900&q=80"}]'::jsonb, '', now() - interval '3 days'),
('BE-1006', 'pending', 349000, 'Cheikh Kane', '+221 76 111 22 33', '', 'Dakar', '', '[{"product_id":"p8","name":"Casque Sony WH-1000XM5","price":349000,"qty":1,"color":"Noir","storage":"","image":"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900&q=80"}]'::jsonb, '', now() - interval '2 days'),
('BE-1007', 'pending', 548000, 'Mariama Cissé', '+221 77 444 55 66', '', 'Kaolack', '', '[{"product_id":"p9","name":"Apple Watch Series 10","price":399000,"qty":1,"color":"Acier Noir","storage":"42 mm","image":"https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=900&q=80"},{"product_id":"p12","name":"Enceinte JBL Flip 6","price":129000,"qty":1,"color":"Bleu","storage":"","image":"https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900&q=80"}]'::jsonb, '', now() - interval '1 day'),
('BE-1008', 'cancelled', 289000, 'Ousmane Dieng', '+221 70 333 22 11', '', 'Mbour', '', '[{"product_id":"p6","name":"Samsung Galaxy A55","price":289000,"qty":1,"color":"Lilac","storage":"128 Go","image":"https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=900&q=80"}]'::jsonb, '', now() - interval '6 days')
on conflict (number) do nothing;

-- Clients démo (dérivés des commandes)
insert into public.clients (name, phone, email, city, address, note, created_at)
values
('Aminata Diop', '+221 77 123 45 67', '', 'Dakar', '', '', now() - interval '12 days'),
('Moussa Ba', '+221 76 555 44 33', '', 'Thiès', '', '', now() - interval '10 days'),
('Fatou Ndiaye', '+221 78 222 11 00', '', 'Dakar', '', '', now() - interval '7 days'),
('Ibrahima Sow', '+221 70 999 88 77', '', 'Saint-Louis', '', '', now() - interval '5 days'),
('Aïssatou Fall', '+221 77 888 77 66', '', 'Ziguinchor', '', '', now() - interval '3 days'),
('Cheikh Kane', '+221 76 111 22 33', '', 'Dakar', '', '', now() - interval '2 days'),
('Mariama Cissé', '+221 77 444 55 66', '', 'Kaolack', '', '', now() - interval '1 day'),
('Ousmane Dieng', '+221 70 333 22 11', '', 'Mbour', '', '', now() - interval '6 days');

-- ---------------------------------------------------------------------
-- IMPORTANT : pour accéder au back-office, créez votre compte admin :
--   1) Dashboard > Authentication > Users > "Add user" (email + mot de passe)
--   2) Copiez l'UUID du nouvel utilisateur et exécutez :
--        update public.profiles set role = 'admin'
--        where id = '<ID_DE_VOTRE_UTILISATEUR>';
-- =====================================================================