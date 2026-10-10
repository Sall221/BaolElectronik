# Baol Electronik — Plateforme E-commerce complète

Boutique en ligne premium (smartphones & accessoires) + panneau d'administration, conçue avec **React + Vite + Tailwind CSS** et **Supabase** (PostgreSQL, Auth, Storage).

## Démarrage rapide

```bash
npm install
npm run dev          # Boutique : http://localhost:5173
```

L'application démarre en **mode démonstration** (données locales, sans configuration) :
- Boutique complète avec 12 produits, commandes et clients de démo
- Admin : `http://localhost:5173/admin/login` — **admin@baol.sn / admin123**

## Activer Supabase (production)

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Dans le SQL Editor, exécutez **`supabase/schema.sql`** puis **`supabase/seed.sql`**
3. Copiez `.env.example` vers `.env` et renseignez :
   ```
   VITE_SUPABASE_URL=https://votre-projet.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-cle-anon
   VITE_WHATSAPP_NUMBER=221770000000
   ```
4. Créez votre compte admin dans Supabase (Authentication → Add user), puis promuez-le :
   ```sql
   update public.profiles set role = 'admin' where id = 'UUID-DE-VOTRE-UTILISATEUR';
   ```

Toutes les règles RLS sont incluses dans le schéma (lecture publique des produits, écriture réservée aux admins, commandes insérables anonymement pour le checkout).

## Flux de commande WhatsApp

1. Le client ajoute des articles au panier et clique sur **« Passer la commande »**
2. La commande est enregistrée (statut : *En attente*) et **envoyée automatiquement sur votre WhatsApp** avec le détail complet (référence, articles, couleurs, stockages, quantités, total)
3. Le client clique sur **« Rejoindre sur WhatsApp »** pour vous rejoindre et vous confirmer ses informations de livraison
4. Aucun formulaire de livraison ni paiement sur le site — tout se finalise dans la discussion
5. En cas d'annulation côté client, vous changez le statut en **Annulé** depuis le panneau admin

Le numéro WhatsApp se configure dans **Admin → Thème & Textes**.

## Fonctionnalités Boutique

- **Accueil** : hero personnalisable, barre de confiance, populaires, bannière promo, shop by brand, meilleures offres
- **Boutique** : recherche, filtres (catégorie, marque, prix), tri
- **Fiche produit** : galerie, variantes couleurs & stockage (supplément prix), note/avis, ajout au panier
- **Panier & commande** : quantités, suppression, résumé, checkout WhatsApp
- **Favoris**, **Promos**, **À propos**, newsletter, responsive mobile/tablette/desktop

## Fonctionnalités Admin (`/admin`)

- **Tableau de bord** : ventes totales, commandes, clients, stock faible + graphiques (ventes 14 jours, top produits)
- **Produits** : CRUD complet, images multiples, couleurs, stockages, stock, catégories, marques
- **Commandes** : filtres par statut, détail client, changement de statut (En attente → Expédié → Livré / Annulé)
- **Médiathèque** : upload, aperçu, copie d'URL, suppression
- **Thème & Textes** : couleurs principale/secondaire, numéro WhatsApp, textes hero / promo / footer
- **Clients** : historique d'achat et dépenses agrégés

## Stack

| Couche | Technologie |
|---|---|
| Frontend | React 18, React Router 6, Tailwind CSS |
| Graphiques | Recharts |
| Icônes | Lucide React |
| Backend / BDD | Supabase (PostgreSQL + RLS) |
| Auth | Supabase Auth (rôle `admin`) |
| Médias | Supabase Storage (bucket `media`) |
| Notifications | react-hot-toast |
