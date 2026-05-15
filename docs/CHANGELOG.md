# CHANGELOG — Site FGC 2026/2027

> Un bullet par PR significative. Date | branch | scope | décisions notables.

## 2026-05-15

- **`docs/brief-produit`** — Session de brief produit (Kévin + IA copilote) :
  - Cf. `~/Desktop/FAMILY GAMES CENTER/refonte-site/00_brief-projet.md` pour le détail business.
  - **Priorité business V1 tranchée** : anniversaires enfants (panier moyen actuel <200 €, levier upsell Super Bowler → Pro Bowler = +5 k€/an estimé).
  - **Identité marque** : Family Games Center unique. Migration bowling-de-blois.fr → familygamescenter.fr en 301. Renommage FB BowlingWorldBlois et Insta bowling.blois.
  - **V1 SANS paiement Stripe** : le tunnel anniv produit une demande, gérant valide manuellement, acompte sur place. Stripe = V2. CLAUDE.md § 11 et PAGES_BACKLOG mis à jour en conséquence.
  - **Pas de mini-admin CMS V1** : contenu en dur dans code/fixtures. Mini-admin EasyAdmin éventuellement V2.
  - Cf. `02_skill1-audit-tunnel-anniv.md` pour le plan d'upsell détaillé (5 leviers, impact +11-21 k€/an estimé).

## 2026-05-14

- **`chore/starter-bundle-monorepo`** — Bootstrap initial du repo en **monorepo** :
  - `apps/web/` : Next.js 14 + Tailwind + TypeScript strict. Tokens FGC dans `tailwind.config.ts`, CSS custom properties dans `src/styles/tokens.css`, helper API `src/lib/api.ts`, nav `src/lib/nav.ts`. Rewrite `/api/*` → backend Symfony en dev (`next.config.mjs`).
  - `apps/api/` : placeholder Symfony 8 + procédure d'init Composer dans `apps/api/README.md`. `.env.example` avec JWT, Stripe, CORS, Mailer.
  - Racine : `DESIGN_SYSTEM.md` (17 sections, extrait 1:1 de la maquette Claude Design source), `CLAUDE.md` (stack + ordre de travail), `README.md`, `docs/PROMPT_CLAUDE_CODE_BOOTSTRAP.md` (prompts A bootstrap web, B bootstrap api, C variantes PR, D garde-fous), `docs/PAGES_BACKLOG.md`, `docs/API_CONTRACT.md` (endpoints contact, devis B2B, résa anniversaire + Stripe, auth JWT, /me).
  - Décisions :
    - Stack alignée Shiftly : Symfony 8 backend + Next.js 14 frontend.
    - API Platform 4 pour exposer les ressources (OpenAPI auto).
    - JWT Lexik pour l'auth client.
    - Stripe pour l'acompte 50€ tunnel anniversaire (acompte côté Symfony via webhook).
    - Pas de shadcn/ui (DS trop spécifique).
    - Focus visible ajouté côté front (`outline cyan`) — dette d'accessibilité de la maquette d'origine comblée.
