# PROMPT_CLAUDE_CODE_BOOTSTRAP.md

> **Usage** : ouvrir Claude Code à la racine du monorepo et coller le prompt ci-dessous. Il enchaîne le bootstrap du frontend (header / footer / page placeholder). Pour le backend Symfony, voir le prompt § B plus bas.

---

## A. PROMPT — Bootstrap frontend (`chore/web-bootstrap` + `feat/web-layout-shell`)

```
Tu vas bootstrapper le frontend du repo (apps/web) et livrer le "shell" du
site (header + footer + page home placeholder), en respectant strictement
le DESIGN_SYSTEM.md à la racine.

Stack : Next.js 14 App Router + Tailwind + TypeScript strict.
Backend Symfony (apps/api) → NE PAS TOUCHER dans cette PR.

Étapes obligatoires, dans cet ordre :

1. Lecture
   - Lis CLAUDE.md (racine) en entier — focus sur §§ 3, 5, 6.
   - Lis DESIGN_SYSTEM.md en entier (NE PAS SKIM).
   - Lis docs/API_CONTRACT.md pour comprendre ce que le front consommera plus tard.
   - Lis docs/PAGES_BACKLOG.md.

2. Installation
   - `cd apps/web && npm install`
   - Si une dépendance majeure manque pour démarrer, demande confirmation
     avant d'ajouter.

3. Header partagé (apps/web/src/components/layout/Header.tsx, 'use client')
   - Sticky, backdrop-blur, fond rgba(10,4,32,0.78), border-bottom or
     translucide (cf. DS § 7).
   - Brand : logo-mark carré 42×42 jaune avec shadow 3D + logo-text en 3
     lignes "Family / GAMES / CENTER" (cf. DS § 7.2).
   - Nav : utilise la config exportée par src/lib/nav.ts. Dropdown au hover
     pour "Activités". État `active` sur le lien courant (usePathname).
   - CTA "Réserver" sur fond btn-primary, target _blank vers
     `process.env.NEXT_PUBLIC_RESERVATION_URL`.
   - Mobile (≤720px) : burger qui toggle .open sur la nav.

4. Footer partagé (apps/web/src/components/layout/Footer.tsx, RSC)
   - InfoStrip 4 items (📅 Ouvert 7J/7, 🥤 Snack & Bar, ☺ Ambiance, 🎉
     Anniversaires).
   - Footer grid 4 colonnes (2fr 1fr 1fr 1fr), brand + tagline + socials,
     puis 3 colonnes de liens.
   - Coordonnées tirées des variables NEXT_PUBLIC_PHONE / EMAIL /
     ADDRESS_LINE1 / ADDRESS_LINE2.
   - Socials Facebook + Instagram (URLs dans partials.js de la maquette source).
   - Footer-bottom dashed avec "© 2026 Family Games Center — Bowling de Blois".

5. Intégration layout
   - Modifie apps/web/src/app/layout.tsx pour insérer <Header /> avant <main>
     et <Footer /> après. Conserver <div className="bg-ambient" aria-hidden />.

6. Page d'accueil placeholder
   - Garde apps/web/src/app/page.tsx tel quel pour cette PR. Le contenu
     home sera fait dans `feat/web-home`.

7. Vérification
   - Lance `npm run dev` et vérifie qu'il n'y a aucune erreur console.
   - Lance `npm run build` — doit être vert.
   - Capture 2 screenshots (desktop + mobile 360px) dans
     docs/screenshots/01-shell-desktop.png et 01-shell-mobile.png.

8. Livrable final
   - Résumé bref (≤ 10 lignes) : fichiers créés/modifiés, déviations DS
     éventuelles (avec justification), questions ouvertes.

Contraintes :
- Aucune valeur hex / px en dur dans le JSX : tokens uniquement.
- TypeScript strict, pas de `any` sans justification.
- Ne touche PAS apps/api dans cette PR.
```

---

## B. PROMPT — Bootstrap backend (`chore/api-bootstrap`)

À lancer en parallèle ou juste après la PR shell. Prérequis : PHP 8.3+ et Composer 2.7+ installés.

```
Tu vas bootstrapper le backend Symfony (apps/api) du repo.

Stack : Symfony 8 + API Platform 4 + Doctrine + Postgres 16 + JWT (Lexik) +
NelmioCors + Mailer + Stripe SDK.

Étapes obligatoires :

1. Lecture
   - Lis CLAUDE.md (racine) — focus § 7.
   - Lis apps/api/README.md.
   - Lis docs/API_CONTRACT.md en entier pour comprendre les endpoints à
     préparer.

2. Initialisation Composer (à faire UNE FOIS)
   - `cd apps/api`
   - `composer create-project symfony/skeleton:"^8.0" .`
   - `composer require webapp`
   - `composer require api nelmio/cors-bundle lexik/jwt-authentication-bundle stripe/stripe-php`
   - `composer require --dev symfony/maker-bundle`
   - `php bin/console lexik:jwt:generate-keypair`

3. Configuration
   - Copier `.env` en `.env.local` (cf. apps/api/.env.example).
   - Configurer DATABASE_URL (Postgres local), JWT_PASSPHRASE,
     STRIPE_SECRET_KEY (laisser sk_test_xxx pour l'instant),
     CORS_ALLOW_ORIGIN (regex fournie).
   - Vérifier `config/packages/nelmio_cors.yaml` (utilise %env(CORS_ALLOW_ORIGIN)%).
   - Vérifier `config/packages/api_platform.yaml` (formats: jsonld + json).

4. Entité minimale + endpoint health
   - Créer src/Controller/HealthController.php exposant GET /api/health
     qui renvoie {"status":"ok"} (sécurité: public).
   - Cet endpoint sert à valider que la stack tourne.

5. Vérification
   - `php bin/console doctrine:database:create` (si pas déjà existante).
   - `symfony serve -d` → http://127.0.0.1:8000/api affiche Swagger UI.
   - `curl http://127.0.0.1:8000/api/health` → `{"status":"ok"}`.
   - Depuis apps/web (autre terminal) : `npm run dev` + `curl http://localhost:3000/api/health` → même réponse (preuve que le rewrite Next fonctionne).

6. Livrable
   - Résumé : packages installés, version Symfony, commande pour lancer
     les deux apps en parallèle.

Contraintes :
- PHP 8.3+ requis.
- Pas de logique métier dans cette PR — juste squelette + health.
- Commiter composer.json, composer.lock, .env (sans secrets), config/, src/HealthController.php.
```

---

## C. Variantes de prompt pour les PR suivantes

Une fois shell + backend bootstrap validés, prompts courts type :

```
PR : feat/web-home

Lis CLAUDE.md et DESIGN_SYSTEM.md (sections 8 et 12).
Implémente apps/web/src/app/page.tsx d'après index.html de la maquette
(~/Downloads/family-games-center-website-2026-2027/project/index.html).

Sections à livrer, dans l'ordre :
  1. Hero (.hero / .hero-grid / .hero-stats / .hero-visual / .hero-float-badge)
  2. Activités (.activities — grille 3×3, données dans src/lib/nav.ts)
  3. Offres (.offers — 4 affiches issues de public/assets/)
  4. InfoStrip (composant partagé existant)
  5. Horaires (.schedule — 7 day-cards, today auto-détecté)
  6. Section "L'expérience FGC" (.page-hero-grid 1.2fr 1fr)

Contraintes habituelles : tokens, DS, TS strict, screenshots, résumé.
```

```
PR : feat/api-contact-forms

Lis CLAUDE.md § 7 et docs/API_CONTRACT.md (section "Contact" + "Devis B2B").

Implémente dans apps/api :
  - Entités/DTO ContactRequest + EntrepriseDevisRequest avec Assert\*
  - Controllers POST /api/contact et POST /api/entreprises/devis
  - Service Mailer dédié (templates Twig dans templates/emails/)
  - Tests WebTestCase couvrant : 201 nominal, 400 payload invalide, 422 email malformé.
  - Rate limit basique (Symfony RateLimiter) — 5 req/min/IP.

Documentation : ajoute un exemple de payload dans docs/API_CONTRACT.md si manquant.
```

---

## D. Garde-fous récurrents à rappeler à Claude Code

À copier en fin de prompt PR si dérive observée :

- **Tokens d'abord** : ne pas inventer de couleurs / tailles hors `tailwind.config.ts` (front) ou de constantes magiques (back).
- **Ne pas reprendre `STYLE_GUIDE.md`** de la maquette source — c'est un guide IA pour générer des affiches, pas le DS du site.
- **Respecter la signature 3D** des boutons (shadow décalée plate).
- **Toujours doubler les emojis décoratifs** d'un `aria-hidden`.
- **Ne pas ajouter shadcn/ui** sans validation préalable.
- **Côté API** : DTO + Assert systématique, pas de `Request::get()` direct.
- **Secrets** : jamais commiter de clé Stripe / SMTP / JWT.
