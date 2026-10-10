-- =====================================================================
-- BaolElectronik — Migration 0002 : correctifs auth (roles + RLS)
-- À exécuter dans : Dashboard Supabase > SQL Editor (projet qjsqkvbwrwtponvuwkux)
-- =====================================================================

-- 1) Rôle courant en ignorants la RLS (contournement : security definer,
--    s'exécute en tant que postgres => toujours fiable)
create or replace function public.get_my_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- 2) Vérificateur d'administrateur (réconcilié entre les 2 schémas)
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

-- 3) Auto-création du profil à l'inscription (compatible 2 schémas)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4) RLS `profiles` réconciliée (supprime les anciennes politiques des 2 schémas)
drop policy if exists "profiles read" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;
drop policy if exists "profiles: lecture propre profil ou admin" on public.profiles;
drop policy if exists "profiles: mise a jour propre profil" on public.profiles;

create policy "profiles select" on public.profiles
  for select using (auth.uid() = id or is_admin());

create policy "profiles update" on public.profiles
  for update using (auth.uid() = id or is_admin())
  with check (auth.uid() = id or is_admin());

create policy "profiles insert" on public.profiles
  for insert with check (is_admin());

-- 5) Lien des commandes à un compte client (préparatoire aux comptes clients)
alter table public.orders add column if not exists user_id uuid references public.profiles(id) on delete set null;

-- 6) Garantir l'administrateur (à adapter si l'email admin diffère)
insert into public.profiles (id, role, full_name)
select id, 'admin', 'Serigne Fallou Sall'
from auth.users
where email = 'fadalsall1997@gmail.com'
on conflict (id) do update set role = 'admin', full_name = excluded.full_name;

-- =====================================================================
-- Vérifications
-- =====================================================================
select p.id, p.role, p.full_name, u.email, u.confirmed_at
from public.profiles p
join auth.users u on u.id = p.id
where u.email = 'fadalsall1997@gmail.com';