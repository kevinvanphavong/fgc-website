# CLAUDE.md — Instructions Claude Code · Site FGC 2026/2027

> **Lis ce fichier en premier, avant toute autre chose.** Il définit le contexte, les règles, la stack et l'ordre de travail pour ce repo.
>
> **Lis aussi `docs/GOTCHAS.md`** au début de chaque session : c'est le journal des pièges techniques déjà rencontrés sur ce repo. Si tu retombes sur un nouveau piège en cours de PR, **ajoute-le en fin de PR** (format documenté dans le fichier).

---

## 1. Contexte projet

- **Quoi** : Nouveau site vitrine du **Family Games Center** (Blois) pour la saison 2026/2027.
- **Pour qui** : Familles, jeunes adultes, comités d'entreprise, organisateurs d'anniversaires/EVG/EVJF.
- **Pourquoi** : Refonte complète du site actuel (`bowling-de-blois.fr`) pour aligner la présence digitale sur l'ADN visuel "arcade premium nocturne" déjà déployé en affiches.
- **Owner** : Kévin Vong (gérant FGC). Single point of contact pour toutes les décisions produit/design.

---

## 2. Source de vérité du design

**Le seul fichier qui fait foi pour l'UI est `DESIGN_SYSTEM.md`** (à la racine).

Il a été extrait fidèlement de la maquette Claude Design d'origine, qui se trouve dans **`~/Downloads/family-games-center-website-2026-2027/`** sur la machine de Kévin. Tu peux y revenir pour vérifier un composant.

**Ne JAMAIS** :
- Inventer des couleurs / spacings / radius hors de ceux listés dans `DESIGN_SYSTEM.md`.
- Utiliser un `STYLE_GUIDE.md` trouvé dans la maquette d'origine pour styliser des composants — celui-ci est un guide de **prompting IA pour générer des affiches**, pas le DS du site.
- Ignorer les anti-patterns de la section 15 du DS (style flat, font Inter en heading, bouton sans shadow décalée, etc.).

---

## 3. Stack technique — monorepo deux apps

```
fgc-site-2026-2027-starter/
├── apps/
│   ├── web/   ← Frontend Next.js 14 (App Router, TypeScript)
│   └── api/   ← Backend PHP / Symfony (à init avec Composer)
└── docs/      ← Documentation partagée
```

### 3.1 Frontend (`apps/web/`)

| Couche       | Choix                                                            |
| ------------ | ---------------------------------------------------------------- |
| Framework    | **Next.js 14 (App Router)** + TypeScript strict                  |
| Styling      | **Tailwind CSS v3** avec tokens FGC dans `tailwind.config.ts`    |
| Composants   | React Server Components par défaut, `'use client'` à la demande  |
| Forms        | `react-hook-form` + `zod`                                        |
| Data fetching| `fetch` natif côté RSC ; `@tanstack/react-query` si interactivité|
| Fonts        | `Lilita One` + `Fredoka` via `next/font/google`                  |
| Animations   | CSS pur d'abord (cf. DS § 11) ; `framer-motion` si nécessaire    |
| Hosting cible| Vercel                                                           |

### 3.2 Backend (`apps/api/`)

| Couche       | Choix                                                            |
| ------------ | ---------------------------------------------------------------- |
| Framework    | **Symfony 8** (LTS dernière) + PHP 8.3+                          |
| API          | **API Platform 4** (REST + JSON-LD, OpenAPI auto-généré)         |
| ORM          | Doctrine ORM                                                     |
| DB           | PostgreSQL 16                                                    |
| Auth         | LexikJWTAuthenticationBundle (JWT)                               |
| Mailer       | Symfony Mailer (transport `smtp` ou `brevo+api://`)              |
| Paiement     | Stripe SDK PHP (acompte 50€ tunnel anniversaire) — **⚠ DIFFÉRÉ EN V2** (cf. § 11) |
| Tests        | PHPUnit + Symfony WebTestCase                                    |
| Hosting cible| OVH / Scaleway / Clever Cloud (à arbitrer avec Kévin)            |

**Justification** : aligné avec ta stack Shiftly (Symfony 8 + Next.js 14 + API Platform). Pas de nouvelle technologie à apprendre, code partageable entre les deux projets si pertinent (utilities, conventions).

### 3.3 Comment les deux apps se parlent

- En **dev local** : `apps/web` (port 3000) appelle `apps/api` (port 8000) via la variable `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api`. Le `next.config.mjs` peut ajouter un rewrite `/api/* → http://127.0.0.1:8000/api/*` pour éviter les soucis CORS.
- En **production** : front sur `familygamescenter.fr` (Vercel), API sur `api.familygamescenter.fr` (host PHP), CORS configuré côté Symfony via `NelmioCorsBundle`.
- **Contrat API** : voir `docs/API_CONTRACT.md` (endpoints, payloads, codes retour).

---

## 4. Architecture du repo

```
fgc-site-2026-2027-starter/
├── CLAUDE.md                ← ce fichier
├── DESIGN_SYSTEM.md         ← source de vérité UI (frontend)
├── README.md                ← démarrage humain
├── .gitignore               ← racine (ignore node_modules, vendor, .env*…)
├── docs/
│   ├── PROMPT_CLAUDE_CODE_BOOTSTRAP.md   ← le 1er prompt à coller dans Claude Code
│   ├── PAGES_BACKLOG.md                  ← liste ordonnée des pages à construire
│   ├── API_CONTRACT.md                   ← contrat REST entre web et api
│   └── CHANGELOG.md                      ← un bullet par PR
│
├── apps/
│   ├── web/                              ← Next.js 14
│   │   ├── package.json
│   │   ├── tailwind.config.ts            ← tokens FGC
│   │   ├── postcss.config.js
│   │   ├── next.config.mjs               ← rewrite /api → backend Symfony
│   │   ├── tsconfig.json
│   │   ├── .env.example
│   │   ├── .gitignore
│   │   ├── public/
│   │   │   └── assets/                   ← affiches PNG
│   │   └── src/
│   │       ├── app/                      ← App Router (layout + pages)
│   │       ├── components/{layout,ui,sections}/
│   │       ├── lib/{tokens,nav,cn,api}.ts
│   │       └── styles/tokens.css         ← CSS custom properties FGC
│   │
│   └── api/                              ← Symfony 8 (à init)
│       └── README.md                     ← procédure d'initialisation Composer
```

---

## 5. Ordre de travail recommandé

Pour Claude Code, attaquer dans cet ordre — chaque étape doit être validée par Kévin avant la suivante :

### Phase frontend (priorité absolue — vitrine visible vite)

1. **Bootstrap web** (config Tailwind, layout racine, tokens). → `chore/web-bootstrap`.
2. **Header + Footer + BgAmbient** (shell). → `feat/web-layout-shell`.
3. **Page d'accueil (`/`)**. → `feat/web-home`.
4. **Pages activités** (`/bowling`, `/billard`, etc.) avec template commun. → `feat/web-activity-pages`.
5. **Tarifs + Formules**. → `feat/web-pricing`.
6. **Bar & Snack**. → `feat/web-bar-snack`.
7. **Entreprises + Contact** (forms statiques pour l'instant, mailto). → `feat/web-b2b-contact`.

### Phase backend (en parallèle dès que le contrat est figé)

8. **Bootstrap API Symfony** (init projet, JWT, CORS, OpenAPI). → `chore/api-bootstrap`.
9. **Endpoints contact + entreprises** (POST → mail). → `feat/api-contact-forms`.
10. **Endpoints réservation anniversaire** (POST tunnel + Stripe acompte 50€). → `feat/api-reservation-tunnel`.
11. **Auth client** (register, login JWT, profil). → `feat/api-auth-account`.

### Phase d'intégration

12. **Tunnel réservation côté web** (React 3 steps, branchement API). → `feat/web-reservation-tunnel`.
13. **Espace compte client** (login, dashboard). → `feat/web-auth-account`.
14. **SEO + perf + accessibilité + RGPD**. → `chore/seo-a11y-perf-rgpd`.

**Convention de commits** : Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`). Préfixer le scope par `web:` ou `api:` quand pertinent.

### Workflow git — règle Kévin

**Par défaut, toutes les modifs vont sur `main`** (commit + merge direct si tu pars d'un worktree). Kévin lance `npm run dev` depuis le repo principal — travailler sur une branche isolée le force à switcher de dev server à chaque test, ce qu'il ne veut pas.

**N'utilise une branche dédiée que si Kévin te le dit explicitement** (ex. "fais une PR pour…", "branche feat/…"). Sinon, le worktree de session est juste un dossier de travail technique : tu fais tes modifs directement sur les fichiers de main, tu commit, c'est tout.

---

## 6. Règles d'implémentation — Frontend

### 6.1 Tokens d'abord, valeurs en dur jamais

```tsx
// ❌ NON
<div className="bg-[#160a3a] text-[#fff4e0]">

// ✅ OUI
<div className="bg-fgc-bg text-fgc-cream">
```

Si un token manque dans `tailwind.config.ts`, **l'ajouter là d'abord**, puis l'utiliser.

### 6.2 Composants primitifs avant pages

Implémenter `Button`, `Badge`, `Card`, `Field` avant la 1ère page qui les utilise. Chaque primitif vit dans `apps/web/src/components/ui/`, exporte ses variants via `cva`, n'utilise que des classes Tailwind issues des tokens.

### 6.3 Server vs Client components

Par défaut RSC. Marque `'use client'` uniquement pour :
- Composants avec state local (forms, dropdowns, stepper).
- Composants avec event handlers.
- Tunnel de réservation (entièrement client).

### 6.4 Appels API

Toujours via le helper `src/lib/api.ts` (à créer dans la PR concernée), jamais `fetch` brut dans un composant. Le helper :
- lit `NEXT_PUBLIC_API_BASE_URL`,
- ajoute `Authorization: Bearer <jwt>` quand l'utilisateur est loggué,
- map les erreurs API Platform en exception typée.

### 6.5 Pas de surdépendance

Avant d'ajouter un package, demande-toi : est-ce que je peux le faire en ~30 lignes ? Le DS FGC est custom — la plupart des composants livrés par shadcn devront être réécrits.

---

## 7. Règles d'implémentation — Backend

### 7.1 API Platform first

Toute entité métier exposée doit l'être via une `#[ApiResource]` annotation, avec sécurité explicite (`security: "is_granted('ROLE_USER')"`).

### 7.2 DTO en entrée

Tout endpoint qui reçoit du JSON utilise un DTO Symfony avec `Assert\*` pour la validation. Pas de `Request::request->get()` direct.

### 7.3 Mailer

Mails transactionnels via `MailerInterface` + templates Twig dans `templates/emails/`. Un mail = une classe `Notifier` ou `Mailer` dédiée, pas du code mailer dans les controllers.

### 7.4 Tests

Au minimum un `WebTestCase` par endpoint qui couvre : cas nominal, 400 (payload invalide), 401 (auth requise), 403 (mauvais rôle).

### 7.5 Secrets

Toujours via `.env.local` + variables CI (Vercel/host PHP). Jamais commiter de clé Stripe / SMTP / JWT.

---

## 8. Communication avec Kévin

- Kévin est gérant d'un parc de loisirs, pas dev full-time. Sa connaissance technique est solide (Shiftly) mais son temps est limité.
- **Privilégier des PR petites et focalisées**.
- **Quand tu as un doute design** : demander, ne pas inventer.
- **Pour tout ce qui touche au juridique / RGPD / cookies / mentions légales** : informer Kévin qu'il s'agit d'éléments à faire valider par un expert (avocat ou DPO), ne pas trancher seul.

---

## 9. Mémoire du projet

À chaque PR significative, ajouter une ligne dans `docs/CHANGELOG.md` avec : date, branch, scope (web / api / docs), pages/endpoints touchés, décisions notables.

---

## 10. Si tu es perdu

1. Relis `DESIGN_SYSTEM.md`.
2. Ouvre le fichier source équivalent dans `~/Downloads/family-games-center-website-2026-2027/project/`.
3. Si toujours pas clair, **arrête-toi et demande à Kévin**.

---

## 11. Décisions de scope V1 (mise à jour 2026-05-15)

Décisions prises lors d'une session de brief produit (cf. `~/Desktop/FAMILY GAMES CENTER/refonte-site/00_brief-projet.md` pour le contexte business complet) :

### V1 sans paiement Stripe

Le tunnel de réservation anniversaire (PR `feat/api-reservation-tunnel` + `feat/web-reservation-tunnel`) **n'inclut PAS Stripe en V1**. À la place :

- Le tunnel envoie une **demande de réservation** (POST /api/reservations/anniversaire) → stocke en BDD avec statut `nouveau`.
- Email automatique au gérant avec le récap complet de la demande.
- Email de confirmation au client : *"Demande enregistrée — on vous recontacte sous 24h pour valider la date."*
- Le gérant valide manuellement (rappel téléphone + email de confirmation), le client règle l'acompte de 50 € sur place / par virement.
- L'entité `DemandeReservation` doit modéliser le cycle de vie : `nouveau` → `contacte` → `confirme` / `refuse` → `passe`.

**Raisons** : budget V1 <2k€, pas de PCI-DSS, ship plus rapide, gérant garde la main sur la confirmation. Trade-off no-show possible, compensé par rappel téléphone systématique.

**Stripe = V2** : à activer si volume justifie + retour gérant sur taux de no-show.

### Priorité business V1 = anniversaires enfants

Le tunnel anniv est la priorité commerciale n°1 (cf. brief : panier moyen <200 €/anniv aujourd'hui, levier upsell Super Bowler → Pro Bowler = +5 k€/an estimé sans changer le volume). Conséquences front :
- Hero home parle d'abord aux parents qui organisent un anniv (sans tuer les autres usages).
- CTA principal "Réserver un anniv" dans le header (en plus du CTA "Réserver une partie" actuel vers bowling-de-blois.fr — à migrer).
- Levier upsell à intégrer dans le tunnel : à l'étape "détails enfant" (quand le total apparaît), proposer un toggle "Ajouter la VR pour +4€/enfant → Pro Bowler" si formule = newbowler/superbowler. Cf. `~/Desktop/FAMILY GAMES CENTER/refonte-site/02_skill1-audit-tunnel-anniv.md` pour le plan détaillé.

### Identité de marque tranchée

**Family Games Center** est la marque mère unique. `bowling-de-blois.fr` sera redirigé en 301 page par page vers `familygamescenter.fr` au moment du lancement.

Réseaux : Facebook **BowlingWorldBlois** → renommer "Family Games Center" (avec mention transitoire "ex-Bowling World Blois" pendant 6 mois). Instagram **bowling.blois** idem.

### Pas de mini-admin CMS en V1

Le contenu (formules, prix, activités, horaires) reste en dur dans le code V1 (centralisé dans `apps/web/src/lib/` ou en fixtures Doctrine côté API). Mini-admin EasyAdmin = V2 si besoin réel.

*Fin CLAUDE.md.*
