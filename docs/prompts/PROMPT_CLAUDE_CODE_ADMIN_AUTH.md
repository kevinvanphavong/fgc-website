# PR2 — Auth admin (JWT + multi-rôles)

> **À coller dans une session Claude Code, depuis la racine du repo `fgc-website-claude/`.**

## Contexte

PR2 du chantier back-office (`docs/PLAN_BACKOFFICE.md`). On met en place l'auth réelle : refacto de `AdminUser` en `User` multi-rôles, login JWT côté Symfony, page de login + middleware côté Next.js. **EasyAdmin reste en place** (suppression = PR4) — donc le firewall historique doit continuer de fonctionner en parallèle du nouveau firewall API JWT.

## Scope strict

### Côté Symfony (`apps/api/`)

1. **Installer Lexik JWT** : `composer require lexik/jwt-authentication-bundle`. Générer les clés (`bin/console lexik:jwt:generate-keypair`). Ajouter `JWT_PASSPHRASE` à `.env.local` (laisser un placeholder dans `.env`).

2. **Refacto `AdminUser` → `User`** :
   - Renommer entité + table BDD via nouvelle migration Doctrine.
   - Ajouter rôles métier : `ROLE_ADMIN`, `ROLE_MANAGER`, `ROLE_STAFF`. Le user par défaut a `ROLE_ADMIN` (qui doit hériter de tout).
   - Ajouter champ `firstName`, `lastName`, `avatarColor` (gradient CSS pour avatar — voir `Avatar.tsx`).
   - Refacto `AdminUserFixture` → `UserFixture` : 1 super-admin par défaut (email/password depuis vars env `.env.local` pour ne pas commiter de creds).

3. **Refacto `config/packages/security.yaml`** :
   - Renommer `admin_provider` → `app_user_provider` (pointe sur `App\Entity\User`).
   - **Garder le firewall `admin`** (EasyAdmin) tel quel — il pointe maintenant sur `app_user_provider`. Sera supprimé en PR4.
   - Ajouter un firewall `api_login` (pattern `^/api/auth/login`, stateless, json_login) qui produit un JWT via Lexik.
   - Modifier le firewall `api` : stateless, JWT authenticator Lexik.
   - Access control : `^/api/admin` = `ROLE_STAFF` minimum, `^/api/auth` = public, `^/api` reste public (lecture site).

4. **Endpoints API** :
   - `POST /api/auth/login` (déjà couvert par Lexik via le firewall json_login) → retourne `{ token, user: { id, email, firstName, lastName, roles, avatarColor } }`.
   - `GET /api/auth/me` (controller dédié, ROLE_STAFF) → retourne le user courant depuis le JWT.
   - `POST /api/auth/logout` côté Next seulement (suppression cookie) — pas d'endpoint Symfony nécessaire en JWT stateless.

### Côté Next.js (`apps/web/`)

5. **Page `/admin/login`** (`app/admin/login/page.tsx`, server component qui rend un form client) :
   - Form email + password, états loading + erreur, design cohérent avec l'admin shell (palette `admin-*`).
   - Submit → server action ou route handler `app/api/admin/login/route.ts` qui POST vers `NEXT_PUBLIC_API_BASE_URL/api/auth/login`, récupère le JWT, le stocke en **cookie httpOnly Secure SameSite=Lax** (`admin_token`), redirect vers `/admin`.

6. **Middleware `apps/web/middleware.ts`** :
   - Matcher : `/admin/:path*` sauf `/admin/login`.
   - Si pas de cookie `admin_token` → redirect `/admin/login?next=<originalPath>`.
   - Pas besoin de valider le JWT côté Next (l'API le valide à chaque appel) — juste vérifier la présence.

7. **Récupération user courant** :
   - `apps/web/src/lib/admin-auth.ts` : helper `getCurrentUser()` server-side qui fetch `/api/auth/me` avec le cookie, cache la requête au niveau request (React `cache()`).
   - `AdminShell` consomme ce user pour afficher footer sidebar (remplace le hard-code "Élise Caron"). Avatar utilise `user.avatarColor`.

8. **Bouton déconnexion** :
   - Dans le footer sidebar (menu sur l'avatar) ou dans le bouton settings existant.
   - Route handler `app/api/admin/logout/route.ts` qui supprime le cookie + redirect `/admin/login`.

9. **Toast erreurs login** : message clair pour 401 ("Email ou mot de passe incorrect"), 500 ("Erreur serveur, réessaie dans un instant").

### À NE PAS faire (différé)
- Refresh token / rotation (PR8 polish, ou jamais si TTL long suffit).
- Reset password / forgot password (V2).
- Gestion multi-users en interface (PR7 module Users).
- Suppression EasyAdmin (PR4).
- 2FA / passkeys (V2 si besoin).

## Contraintes techniques

- **TTL du JWT** : 7 jours en V1 (long, simple, suffisant pour un back-office interne). Valeur dans `lexik_jwt.yaml` : `token_ttl: 604800`.
- **Cookie** : `httpOnly: true`, `secure: true` en prod (depuis `NODE_ENV`), `sameSite: 'lax'`, `path: '/'`, max-age aligné sur TTL JWT.
- **CORS** : déjà configuré côté Symfony (NelmioCorsBundle dans starter). Vérifier que `Access-Control-Allow-Credentials: true` est OK sur les routes auth.
- **Pas de password en plaintext nulle part** — passer par `UserPasswordHasher` côté Symfony, jamais loguer le mot de passe côté Next.
- **TypeScript strict**, RSC par défaut, `'use client'` uniquement sur le form login et le menu déconnexion.

## Auto-vérification

1. `cd apps/api && symfony console doctrine:migrations:migrate -n` → nouvelle migration appliquée, table `user` créée.
2. `cd apps/api && symfony console doctrine:fixtures:load -n --append` → super-admin créé (email visible dans logs).
3. `curl -X POST http://localhost:8000/api/auth/login -H "Content-Type: application/json" -d '{"email":"<admin>","password":"<pass>"}'` → 200 avec `{ token, user }`.
4. `curl http://localhost:8000/api/auth/me -H "Authorization: Bearer <token>"` → 200 avec user.
5. `curl http://localhost:8000/api/auth/me` (sans token) → 401.
6. Navigateur : `http://localhost:3000/admin` (sans cookie) → redirect `/admin/login?next=/admin`.
7. Login form → soumission OK → cookie posé → redirect `/admin` → footer sidebar affiche le vrai user (plus "Élise Caron").
8. Click déconnexion → cookie supprimé → redirect `/admin/login`.
9. **EasyAdmin doit toujours fonctionner** : `http://localhost:8000/admin` (Symfony) → écran login EasyAdmin → connexion avec mêmes credentials → dashboard EasyAdmin OK. (Sanity check : on n'a pas cassé l'admin existant.)
10. `npm run build` côté web ✓ 0 erreur TypeScript.
11. `docs/CHANGELOG.md` : `feat(admin,api): auth JWT + multi-rôles (PR2) — User entity refactor + Lexik JWT + login Next.js + middleware`.

## Si tu es bloqué

- Doc Lexik : https://github.com/lexik/LexikJWTAuthenticationBundle/blob/2.x/Resources/doc/index.md
- Pattern cookie httpOnly Next 14 App Router : `cookies()` API depuis `next/headers` dans route handler / server action.
- Doute structurel : **arrête et demande à Kévin** (notamment sur le mot de passe initial du super-admin — il doit choisir).

*Fin PROMPT_CLAUDE_CODE_ADMIN_AUTH.md*
