# TH Coaching

Site vitrine de **TH Coaching** — accompagnement et coaching professionnel.

- **Framework** : Next.js 15 (App Router) + TypeScript
- **Style** : CSS moderne (variables, responsive), sans dépendance UI externe
- **Hébergement** : Vercel — domaine `thcoaching.business`

## Développement

```bash
npm install
npm run dev
```

Le site tourne sur http://localhost:3000.

## Build de production

```bash
npm run build
npm run start
```

## Structure

```
app/
  layout.tsx    En-tête, pied de page, métadonnées SEO
  page.tsx      Landing page (hero, services, méthode, à propos, témoignages, contact)
  globals.css   Design system (couleurs, typographie, composants)
  icon.svg      Favicon
```

## Contenu

Les textes (services, témoignages, statistiques) sont des données de départ
dans `app/page.tsx` — à personnaliser avec les vraies offres et références.
L'adresse de contact est `contact@thcoaching.business`.

## Déploiement

Projet Vercel `thcoaching`. Le domaine `thcoaching.business` se rattache
depuis le dashboard Vercel : **Project → Settings → Domains**.
