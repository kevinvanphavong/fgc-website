# CHANGELOG — Site FGC 2026/2027

> Un bullet par PR significative. Date | branch | scope | décisions notables.

## 2026-05-18

- **`main`** — `feat(admin,api)`: module Contenus 6 tabs (PR4 phase 1).
  - **API** : 13 entités du site public (HebdoCard, PassCard, ResaCard, AnnivCard, VipFeature, TarifCard, TarifPriceLine, DaySchedule, Offer, ActivityPageContent, MenuSection, MenuCategory, MenuItem) étendues avec opérations admin Post/Put/Delete sécurisées `ROLE_STAFF`. GET publics préservés. `denormalizationContext` séparé du `normalizationContext` (groupe `xxx:write`). Validator `Assert\NotBlank` sur 1-3 champs critiques par entité. `id` + `position` exposés en lecture. Installé `symfony/expression-language` (requis par les expressions `is_granted(...)` dans `security`).
  - **Migration** : `Version20260518150000` ajoute `active BOOLEAN NOT NULL DEFAULT TRUE` à `offer` (toggle visibilité home sans suppression). Le mockup propose un flag `active` partout — décision pragmatique V1 : seul Offer en bénéficie (modifier/supprimer suffit pour les autres entités).
  - **Choix d'archi API** : pas de DTO Symfony séparé — entité-as-input avec groupes Serializer + Assert directement sur les propriétés (pattern standard API Platform). Réduit la duplication face à 13 entités. Documenté ; migration vers DTO si besoin (validation cross-field, payload différent du modèle).
  - **Next — primitives admin** : `Switch`, `Tabs` (segmenté par URL), `Drawer`, `Field`/`TextField`/`TextareaField`, `ConfirmDialog`, `Toast` (`ToastProvider` + `useToast`), `EditorCard`.
  - **Next — data layer** : `@tanstack/react-query` installé. Helper client `apiCall` qui passe par le proxy Next. Factory `makeEntityHooks<T>('xxx')` → `useList/useCreate/useUpdate/useRemove` par ressource. `extractErrorMessage` mappant les violations API Platform JSON-LD en string lisible.
  - **Next — proxy admin** : route handler catch-all `app/api/admin/proxy/[...path]/route.ts` qui injecte le cookie httpOnly en `Authorization: Bearer …`, forwarde vers Symfony, et appelle `revalidatePath('/', 'layout')` après chaque mutation. `next.config.mjs` : rewrites `/api/*` passées en `fallback` pour que les Next route handlers (notamment dynamic `[...path]`) gagnent toujours sur le proxy.
  - **Page `/admin/contenus`** : layout client avec 6 tabs URL-routés (`/admin/contenus/{formules,tarifs,activites,horaires,offres,bar-snack}`). `/admin/contenus` redirige vers `/formules`. Header avec bouton "Prévisualiser sur le front" (lien `/` nouvel onglet).
  - **6 éditeurs** :
    - `FormulesEditor` : 5 sous-groupes (hebdo/pass/resa/anniv/vip-features) avec création + édition drawer + suppression + toast. Le plus complet — sert de pattern de référence.
    - `TarifsEditor` : tableau des TarifCard + drawer d'édition. Édition des `TarifPriceLine` individuelles différée (V2 sous-table dédiée).
    - `ActivitesEditor` : grille des 8 ActivityPageContent + drawer d'édition texte. Upload d'image différé en PR7 (module Médias).
    - `HorairesEditor` : 7 jours hebdomadaires éditables (texte libre dans le champ `hours`). Section Exceptions documentée comme V2 (entité dédiée à modéliser).
    - `OffresEditor` : cards des Offer avec toggle Switch `active` → masque sans supprimer. CRUD complet.
    - `BarSnackEditor` : arborescence Sections > Catégories > Items en lecture, édition Section et Item, suppression Item. Création d'item et édition Catégorie différées en V2 (UX imbriquée plus large).
  - **Tests** : tests par entité non livrés en PR4 (infra fixture env test à monter — chantier séparé). Validation E2E via login + proxy + PUT/DELETE + reload public site.
  - **Validé E2E** : `/admin/contenus/{6 tabs}` 200, GET `/api/admin/proxy/hebdo_cards` retourne les items, PUT édite, public `/tarifs-et-formules` reflète l'état courant.

- **`main`** — `feat(admin,api)`: dashboard avec KPIs mockés (PR3) — 4 KPI cards + sparklines + activité + notifs + banner démo.
  - **API** : `App\Controller\Api\Admin\DashboardController` expose `GET /api/admin/dashboard` (ROLE_STAFF) avec un payload `{ meta:{demo,generatedAt}, kpis, recentActivity, notifications }`. Valeurs alignées sur `back-office-mockup/data.jsx`. Flag `meta.demo: true` jusqu'à PR5. Endpoint `POST /api/admin/notifications/mark-read` (no-op 204) ; persistance réelle en PR5.
  - **Tests** : `symfony/test-pack` installé. `DashboardControllerTest` couvre 401 sans token sur les deux endpoints (`php bin/phpunit` → vert). Le test "200 avec token" est différé : il requiert une fixture de user en env test (DB de test, JWT keys) — couverture validée via curl + dev server.
  - **Next.js — lib** : `lib/admin-api.ts` (helper `adminFetch` qui propage le cookie en Bearer et redirige sur 401, `getDashboard` mémoïsé via `react.cache`, typings `DashboardPayload`). `lib/intl.ts` (formatters `currencyEUR`, `percent`, `formatRelative` basé sur `Intl.RelativeTimeFormat`).
  - **Composants admin** :
    - `components/admin/dashboard/Sparkline` : SVG natif `<polyline>` (pas de Chart.js).
    - `KpiCard` (RSC) + `KpiCardSkeleton`. 4 accents (`brand` `green` `amber` `pink`) — couleur sparkline + bg icône issus des tokens admin-*. Trend up/down/flat avec couleur (vert/rouge/muted).
    - `RecentActivity` (RSC) avec icône par type (reservation/payment/user/system) + timestamp relatif FR.
    - `DemoBanner` (client) dismissible via `sessionStorage` — re-affiché à chaque session navigateur.
    - `RefreshButton` (client) → `router.refresh()`.
  - **Page `/admin`** : layout grid 1/2/4 colonnes (mobile/tablette/desktop), KPIs en haut, activité récente en bas. Suspense skeleton pendant le SSR fetch. `dynamic = 'force-dynamic'`.
  - **Topbar** : popover notifications branché sur les notifs du dashboard payload (consommées via `getNotifications()` au layout shell, déduplique le fetch grâce à `react.cache`). Dot rouge si au moins une `unread:true`. "Tout marquer comme lu" → POST `/api/admin/notifications/mark-read` (route handler Next qui proxify vers Symfony) + `router.refresh()`. Plus de hard-coded notifs.
  - **Validé E2E** : `/admin` retourne 200 avec KPIs, activité, "Bonjour Kévin", refresh button. POST notifs mark-read → 204. EasyAdmin reste OK.

- **`main`** — `feat(admin,api)`: auth JWT + multi-rôles (PR2) — User entity refactor + Lexik JWT + login Next.js + middleware.
  - **API** : Lexik JWT bundle installé, paire de clés générée (gitignored), TTL 7 jours.
  - **Entité `AdminUser` → `User`** (table renommée `admin_user` → `app_user` — `user` est réservé Postgres). Ajout `firstName`, `lastName`, `avatarColor`. Constantes `ROLE_STAFF`/`ROLE_MANAGER`/`ROLE_ADMIN`. Migration `Version20260518120000` (rename + ALTER ADD). `UserRepository` ajouté.
  - **`security.yaml`** : provider renommé `app_user_provider`, `role_hierarchy` (ADMIN→MANAGER→STAFF), firewall `api_login` (`^/api/auth/login`, json_login → handler Lexik), firewall `api` stateless JWT, firewall `admin` (EasyAdmin legacy) **conservé** — supprimé en PR4.
  - **`AuthController`** : `GET /api/auth/me` (ROLE_STAFF). `JwtCreatedListener` enrichit le payload JWT (uid, roles) et la réponse `/login` (`{ token, user }`).
  - **`UserFixture`** (group `users`) : seed/backfill idempotent depuis `ADMIN_INITIAL_*` (cf. `.env.example`). Le seed précédent reste valide, la fixture remplit firstName/lastName/avatarColor si absents.
  - **Next.js** : page `/admin/login` (form `react-hook-form` + `zod`), route handlers `/api/admin/login` + `/api/admin/logout` qui posent un cookie `admin_token` `httpOnly` `SameSite=lax` (secure en prod), TTL 7 jours alignés JWT. `lib/admin-auth.ts` expose `getCurrentUser()` mémoïsé via `react.cache`.
  - **`middleware.ts`** (placé dans `src/`) : matcher `/admin/:path*`, redirige vers `/admin/login?next=<original>` si pas de cookie ; n'inspecte pas le JWT (validation déléguée à l'API à chaque appel).
  - **Route groups admin** : `(shell)` pour les modules protégés (consomme `getCurrentUser()` côté server, redirige si null — double garde après middleware), `(auth)` pour `/admin/login` (rendu sans sidebar).
  - **`AdminShell`** : prop `user`, sidebar branchée sur le user réel (avatar avec `avatarColor`, nom = firstName lastName ou email, role label dérivé). Menu compte sur le footer sidebar → action déconnexion (POST `/api/admin/logout` puis `router.push('/admin/login')`).
  - **`next.config.mjs`** : rewrites passés en `afterFiles` pour que les route handlers `/api/admin/*` aient la priorité sur le proxy Symfony.
  - **Validé** : E2E `/admin` (no cookie) → 307 `/admin/login?next=/admin`. `/admin/login` (déjà loggué) → 307 `/admin`. Login good creds → cookie posé + user retourné. Login bad creds → 401 message FR. `/api/auth/me` 401 sans token, 200 avec. EasyAdmin (`localhost:8000/admin`) reste fonctionnel.

- **`main`** — `feat(admin)`: bootstrap admin shell (PR1) — route `/admin` + sidebar 3 sections + 7 pages placeholder.
  - **Scope** : `apps/web/` uniquement. `apps/api/` non touché (la modif visible sur `DashboardController.php` est antérieure à PR1).
  - **Routing** : pages publiques déplacées dans le route group `app/(public)/` (URLs inchangées). Root layout réduit à `<html>/<body>` + fonts ; chaque shell (public, admin) appose ses propres styles via wrapper scoppé (`.fgc-public`, `.admin-root`).
  - **Tokens admin** : palette `admin-*` ajoutée à `tailwind.config.ts` (brand `#5E2DB8`, fond `#F5F6FA`, etc.) — séparée des tokens FGC publics.
  - **Shell** : `AdminShell` (client) + `Sidebar` + `Topbar` dans `components/admin/shell/`. Sidebar collapsible (toggle topbar + auto-collapse <980px), breadcrumb réactif via `usePathname`. Footer sidebar hard-codé "Élise Caron / Administrateur" (branché en PR2).
  - **Primitifs** : `Button`, `Icon` (wrapper Lucide), `Avatar`, `Badge`, `Card`/`CardHead`/`CardBody` dans `components/admin/ui/`.
  - **Nav admin** : config dans `lib/admin-nav.ts` (7 routes, icônes Lucide, helper `findRouteByPath`).
  - **⌘K** : raccourci et bouton wirés sur un `console.log` placeholder — implémentation PR8.
  - **Dépendance** : ajout `lucide-react`.

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
