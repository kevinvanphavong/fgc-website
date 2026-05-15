# Family Games Center — Site 2026/2027

Refonte du site vitrine du Family Games Center (Blois). **Monorepo** :

- `apps/web/` → Frontend **Next.js 14** + Tailwind + TypeScript
- `apps/api/` → Backend **Symfony 8** + API Platform 4 (PHP 8.3+)

## Démarrage rapide

### Prérequis

- Node.js ≥ 20
- pnpm ou npm (utiliser ce que tu préfères — exemples avec `npm`)
- PHP ≥ 8.3, Composer ≥ 2.7
- Docker (recommandé pour Postgres local), ou Postgres 16 installé

### Frontend (apps/web)

```bash
cd apps/web
npm install
cp .env.example .env.local
# Copier les affiches depuis la maquette d'origine
cp -r ~/Downloads/family-games-center-website-2026-2027/project/assets/* public/assets/
npm run dev
```

Ouvrir http://localhost:3000.

### Backend (apps/api)

```bash
cd apps/api
# Première fois — créer le projet Symfony (voir apps/api/README.md pour détails)
composer create-project symfony/skeleton:"^8.0" .

# Ensuite, à chaque clone
composer install
cp .env .env.local
# Configurer DATABASE_URL, MAILER_DSN, JWT_SECRET, STRIPE_SECRET_KEY
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
symfony serve -d
```

Ouvrir http://127.0.0.1:8000/api (OpenAPI / Swagger UI).

## Fichiers à lire (dans l'ordre)

1. **`CLAUDE.md`** — Instructions pour Claude Code (ordre de travail, règles, stack).
2. **`DESIGN_SYSTEM.md`** — Source de vérité UI (tokens, composants, anti-patterns).
3. **`docs/API_CONTRACT.md`** — Endpoints REST attendus côté backend.
4. **`docs/PAGES_BACKLOG.md`** — Liste ordonnée des pages et endpoints à construire.
5. **`docs/PROMPT_CLAUDE_CODE_BOOTSTRAP.md`** — Prompts prêts à coller dans Claude Code.

## Scripts utiles

```bash
# Frontend
cd apps/web
npm run dev      # Dev server
npm run build    # Build production
npm run lint
npm run format

# Backend
cd apps/api
symfony serve -d                                  # Dev server
php bin/console make:entity                       # Génère entité
php bin/console doctrine:migrations:diff          # Génère migration
php bin/console doctrine:migrations:migrate       # Applique migrations
php bin/phpunit                                   # Tests
```

## Déploiement

- **Frontend** : Vercel — branche `main` = prod, `preview` = preview.
- **Backend** : hébergeur PHP (OVH/Scaleway/Clever Cloud — à arbitrer). Domaine cible : `api.familygamescenter.fr`.

## Contact projet

Kévin Vong · contact@familygamescenter.fr
