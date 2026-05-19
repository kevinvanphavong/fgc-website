# PLAN_BACKOFFICE — Refonte du back-office FGC

> **Source de vérité** pour le chantier "back-office Next.js full mockup".
> Décision : 2026-05-18 (Mr Vong). Scope C confirmé : on remplace EasyAdmin par un mini CMS custom Next.js, basé sur le mockup `back-office-mockup/`.
> Effort estimé : **15-30 jours** de sessions Claude Code. Source design : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/` (12 modules JSX extraits du proto Claude Design).

## Hypothèses tranchées

1. **Localisation** : `apps/web/src/app/admin/` (même Next.js que le site public, route `/admin` protégée).
2. **Stack** : RSC + `'use client'` à la demande (forms, dropdowns, dnd). Tailwind v3 + tokens FGC. React Query pour data fetching admin. Pas de Next admin séparé.
3. **Auth** : JWT Lexik côté Symfony, cookie httpOnly côté Next, middleware `/admin/*`. Multi-rôles dès la PR1 (ROLE_ADMIN, ROLE_MANAGER, ROLE_STAFF).
4. **EasyAdmin** : supprimé à la fin de la PR4 (quand le CRUD core est en place côté Next). Pas avant.
5. **Couleur primaire admin** : violet `#5E2DB8` du mockup (volontairement différent du site public — usage interne, identité "back-office").
6. **Mock data** : `data.jsx` du mockup sert de modèle pour les fixtures Doctrine de chaque PR.

## Découpage en 8 PRs séquentielles

### PR1 — `feat/admin-bootstrap` (3-4j)
**Scope** : route `/admin`, layout app-shell (sidebar + topbar), hash routing → routes Next.js, tokens admin, primitifs UI (Button, Icon, Avatar, Badge, Card, Field). Page Dashboard placeholder. Aucune data réelle.
**Sortie** : on peut naviguer entre les 7 sections (sidebar fonctionne), chaque page = "Coming soon", responsive OK.
**Bloque** : toutes les autres PR.
**Prompt** : `docs/prompts/PROMPT_CLAUDE_CODE_ADMIN_BOOTSTRAP.md`

### PR2 — `feat/admin-auth` (2-3j)
**Scope** : entité `User` (refactor `AdminUser` existant) avec rôles, endpoint `/api/auth/login` JWT, page `/admin/login`, middleware Next.js qui protège `/admin/*`, déconnexion, refresh token. Toast erreurs.
**Sortie** : on se logge, le shell affiche le nom/avatar du user connecté (footer sidebar), redirect login si pas auth.
**Dépend** : PR1.

### PR3 — `feat/admin-dashboard` (3-4j)
**Scope** : module Dashboard. 4 KPIs (CA jour, résa du jour, taux remplissage, CA mois) + graphes mini sparklines + tableau activité récente + notifications (popover topbar). Endpoint `/api/admin/dashboard` qui agrège.
**Sortie** : KPIs branchés sur données réelles (au minimum CA + résa). Premier vrai écran fonctionnel.
**Dépend** : PR1, PR2.

### PR4 — `feat/admin-contenus` (5-7j) ⚠ Migration + KILL EasyAdmin
**Scope** : module Contenus à **6 tabs** (scope élargi 2026-05-18 après audit des entités encore utilisées par le site public) :
- **Formules** (HebdoCard, PassCard, ResaCard, AnnivCard, VipFeature)
- **Tarifs** (TarifCard, TarifPriceLine)
- **Activités** (ActivityPageContent)
- **Horaires** (DaySchedule)
- **Offres home** (Offer) — *ajout vs mockup, pour ne pas perdre l'éditabilité de la home après kill EasyAdmin*
- **Bar & Snack** (MenuSection, MenuCategory, MenuItem) — *ajout vs mockup, pour ne pas perdre l'éditabilité de la carte bar après kill EasyAdmin*

Réutilise toutes les entités existantes. Aucune nouvelle entité à créer en PR4.

**Sortie** : tout ce qu'EasyAdmin permet aujourd'hui, en mieux, dans le shell custom. **Et plus aucune trace d'EasyAdmin dans le repo.**

**Dépend** : PR1, PR2, PR3.

#### Checklist exhaustive de suppression EasyAdmin (à exécuter EN FIN de PR4, après que le module Contenus fonctionne)

**Étape 0 — Dry-run de sécurité (obligatoire avant suppression)**
- `cd apps/api && grep -r "EasyCorp\\|easyadmin" --include="*.php" --include="*.yaml" --include="*.twig" -l` → doit ne retourner QUE les fichiers à supprimer ci-dessous. Si autre chose remonte, on a oublié un usage, stop et investiguer.
- Vérifier que `/admin/login` Next.js fonctionne (PR2) et que le nouveau back-office gère les mêmes entités que celles couvertes par les CrudControllers EasyAdmin.

**Étape 1 — Suppression code PHP**
- `rm -rf apps/api/src/Controller/Admin/` (15 fichiers : DashboardController + LoginController + 13 CrudControllers)
- `rm -rf apps/api/templates/admin/` (login.html.twig + dossier)

**Étape 2 — Suppression config**
- `rm apps/api/config/routes/easyadmin.yaml`
- Édition `apps/api/config/packages/security.yaml` : supprimer le bloc `admin_provider` (provider), le bloc `admin:` (firewall), et la ligne d'access_control `^/admin` (3 blocs). Vérifier que `admin_provider` n'est plus référencé ailleurs avant suppression.

**Étape 3 — Suppression dépendance**
- `cd apps/api && composer remove easycorp/easyadmin-bundle` → retire la dépendance, met à jour composer.lock, et déclenche `assets:install` qui nettoie les assets EasyAdmin. Vérifier que `config/bundles.php` n'a plus la ligne `EasyAdminBundle`.

**Étape 4 — Verifications finales**
- `cd apps/api && symfony console cache:clear` → 0 erreur
- `cd apps/api && grep -r "EasyCorp\\|easyadmin\\|/admin/\\|admin_login\\|admin_logout" --include="*.php" --include="*.yaml" --include="*.twig" --include="*.lock" .` → ne doit retourner AUCUN résultat (sauf historique dans `composer.lock` qui peut être normal selon comment composer le met à jour — vérifier qu'il n'y a plus la ligne `"name": "easycorp/easyadmin-bundle"`).
- `cd apps/api && symfony console debug:router | grep -i admin` → ne doit retourner QUE les routes API du nouveau back-office (`/api/admin/*` éventuellement), pas de routes EasyAdmin résiduelles.
- `cd apps/api && symfony console debug:container | grep -i easyadmin` → 0 résultat.
- Démarrer `apps/api` + `apps/web`, tester `/admin` Next.js → fonctionne. Tester l'URL historique `/admin` (Symfony) → 404 (et non plus l'écran EasyAdmin).

**Étape 5 — Commit propre**
- Commit dédié à la suppression : `chore(api): remove EasyAdmin (replaced by Next.js admin)` — séparé du commit feature pour traçabilité git.
- Update `docs/CHANGELOG.md` avec : `chore(api): kill EasyAdmin (PR4 final) — -15 controllers, -1 bundle, -3 security blocks, -1 route file`.

#### Ce qu'on NE supprime PAS (volontairement)
- Les 13 entités Doctrine métier (TarifCard, PassCard, HebdoCard, ResaCard, AnnivCard, VipFeature, MenuSection, MenuCategory, MenuItem, DaySchedule, Offer, ActivityPageContent, TarifPriceLine) → réutilisées par les CRUD Next.js via API Platform.
- `symfony/twig-bundle` → conservé pour les emails transactionnels (CLAUDE.md §7.3).
- L'entité `User` (ex-`AdminUser` refactorisée en PR2) et sa fixture.
- Les `#[ApiResource]` sur les entités → c'est l'interface que consomme Next.js admin.

### PR5 — `feat/admin-reservations` — ✅ Livrée 2026-05-19
**Scope livré** (anniversaires uniquement, V1) : extension de `DemandeReservation`
(adminNote + 4 stamps) + 3 endpoints admin sur `#[ApiResource]` (`GET` listing
avec `SearchFilter`/`DateFilter`, `GET` item, `PATCH` validé par machine d'état)
+ `GET /admin/demandes-reservation/stats` (custom controller) + page
`/admin/reservations` avec toolbar (search/période/chips status), tabs
Kanban (drag&drop `@dnd-kit/core`) / Tableau, drawer détail (transitions +
note interne autosave 800ms + timeline stamps), badge live rouge sidebar sur
count `nouveau`, KPI dashboard `reservationsToday` branché sur le réel.

**Décisions V1 vs prompt initial** :
- Pas de **vue Calendrier** (over-engineering pour le volume actuel — Kanban + Tableau suffisent).
- Pas de **détection de conflits** côté admin (le tunnel anniv les bloque déjà en 409 à la création — PR10).
- Pas de **création de demande** depuis l'admin (V2 si besoin saisie tél).
- Pas de **module B2B / groupes** dans cette PR (= PR6, structure pensée pour ajouter facilement).
- Pas d'**email auto** sur refus (V1 manuel — le gérant prévient par téléphone).

**Sortie** : 6 tests admin verts, build OK 22 kB sur /admin/reservations, smoke endpoints OK via proxy Next, dashboard `reservationsToday` reflète la donnée réelle.
**Différé V2** : calendrier, export CSV, email auto, création manuelle.
**Dépend** : PR1, PR2, PR3, PR10 (tunnel = créateur des demandes).

### PR6 + PR9 — `feat/admin-b2b` — ✅ Livrée 2026-05-19

Groupée avec le branchement du formulaire public `/entreprises` (PR9 du backlog initial — ça n'avait pas de sens de livrer l'admin sans la source).

**Scope effectif** :
- **API** : entité `B2BRequest` + enums `B2BStage`/`B2BType`, DTO+Processor pour le POST public, AdminProcessor + 3 ops admin (GetCollection / Get / Patch avec machine d'état), endpoint `/stats`, mails Twig best-effort, fixtures 6 demandes (1 par stage), tests publics + admin (12 nouveaux, suite full = 97).
- **Web public** : formulaire `/entreprises` branché en RHF + zodResolver (validation Zod miroir du DTO), confirmation inline + référence.
- **Web admin** : `/admin/b2b` = 4 KPI cards (ouvertes / pipeline € / taux transfo / délai moyen réponse) + toolbar (search + filtre type) + Kanban 6 colonnes drag&drop avec count+somme € en haut de chaque colonne + drawer 560px (récap, contact, montant estimé éditable autosave, transitions selon machine d'état, note autosave, timeline, footer mailto pré-rempli).
- **Sidebar** : badge rouge B2B `nouveau` live (polling 60s React Query).
- **Dashboard** : 5ᵉ tuile "Pipeline B2B" (somme `openValueCents` €).

**Décisions V1 vs prompt** :
- Naming snake_case partout côté PHP & JSON (`devis_envoye` au lieu de `devis-envoye` du mockup) — cohérence avec PR5.
- Envoi devis = mailto pré-rempli (V1) ; génération PDF auto = V2.
- Kanban uniquement (pas de vue Tableau) — couvre 95% de l'usage commercial.
- Type B2B étendu à 5 valeurs (`seminaire`, `team_building`, `soiree`, `arbre_noel`, `autre`) pour matcher le formulaire public.

**Sortie** : `make test-api` → 97 tests verts, `npm run build` → 0 erreur TS (`/admin/b2b` ƒ 8.79 kB, `/entreprises` ƒ 6.12 kB), curl smoke 201/422 OK, drag&drop validé.
**Différé V2** : PDF du devis, workflow d'envoi auto, vue Tableau/Calendrier, export CSV, création manuelle admin, module CRM (= PR7), relances auto.
**Dépend** : PR1, PR2 (livrées).

### PR7 — `feat/admin-clients-medias-users` — ✅ Livrée 2026-05-19

3 modules indépendants en une PR (effort réel ~même journée vs 3-4j estimé) :

**Clients (lecture seule)** : `ClientsController` agrège anniv + B2B par email, tags calculés à la volée (`fidele/vip/b2b`), pas d'entité Client en BDD (V1 volume FGC ≪1k résa/an). Endpoints `/admin/clients`, `/admin/clients/{email}`, `/admin/clients/stats`. Page `/admin/clients` : 4 KPI + tableau filtrable + drawer historique chronologique.

**Médias** : entité `Media` + enum `MediaTag` (6 tags) + `MediaUploader` (disque local `public/uploads/medias/{yyyy}/{mm}/`, 5 Mo max, mime whitelist, 4000×4000 max). `MediaUploadController` dédié pour le POST multipart (proxy Next.js patché pour stream multipart). GET/PATCH/DELETE via ApiResource. `MediaDeleteListener#postRemove` purge disque. Page `/admin/medias` : toolbar tags + bouton Importer (modale drag&drop) + grille thumbnails.

**Users & rôles** : refacto `User` avec `enabled` + reset tokens 24h + `lastLoginAt`/`createdAt`. `AppUserChecker` plug sur firewall json_login bloque `enabled=false` avant émission JWT. `UsersController` ROLE_ADMIN-only avec endpoints listing/invite/detail/PATCH/DELETE-403 + auto-protections (pas de self-disable, pas d'auto-déclassement). `POST /auth/reset-password` public (active le compte au passage). `security.yaml` ROLE_ADMIN sur `/api/admin/users`. Page `/admin/users` : 3 couches de défense (sidebar hide + RSC redirect + API 403), tableau + sidebar droite "Rôles & permissions" + modale invite + drawer édition. Page publique `/admin/setup-password` exclue du middleware admin.

**Tests** : `ClientsAggregateTest` (5 scénarios). Suite full : **102 tests, 312 assertions, 0 failure, 2.6s**.

**Auto-vérification** : build OK (`/admin/clients` 4.47 kB, `/admin/medias` 7.67 kB, `/admin/users` 6.5 kB, `/admin/setup-password` 2.38 kB statique). Smoke complet : invitation→login bloqué→reset token→login OK ; self-disable=422 ; DELETE=403 ; manager sur `/admin/users`=403 ; upload PNG=201 + servable, upload PDF=400.

**Différé V2** : export CSV, matrice permissions dynamique, suppression hard user (jamais), tags clients custom, redimensionnement/compression images, génération IA affiches (flux séparé), 2FA admin.

**Dépend** : PR2 (User+JWT), PR5 (pattern proxy+PATCH), PR6 (B2BRequest pour l'agrégat Clients).

### PR8 — `feat/admin-polish` — ✅ Livrée 2026-05-19

**Cmd+K** (`fuse.js` léger ~5 kb) : modale 5 sections (Aller à / Actions V2 disabled / Réservations 30 / B2B 30 / Clients page 1), fuzzy front, navigation clavier. Sélection résa/B2B/client → `router.push?open={id}`.

**Tweaks Panel** ⌘. : densité (compact/regular/comfy via `html[data-admin-density]` + CSS vars), sidebar (expanded/collapsed/floating, auto-bascule floating <1024px), thème (light only — dark marqué "bientôt" V2 pour ne pas livrer cassé). Persisté `localStorage`, hook `useAdminTweaks()` + sync `storage` event multi-onglets.

**Raccourcis** : séquence `g` + `d/r/b/c/m/u` (timeout 1.5s style Gmail), `?` aide modale, `/` focus `[data-admin-search]`. Désactivés sur input/textarea/select/contentEditable.

**A11y** : focus trap Drawer + restitution focus déclencheur, skip link `#admin-main`, `aria-current="page"`, `aria-label` sur boutons icons-only, `focus-visible` ring `admin-brand-ring`.

**Responsive** : sidebar burger floating <1024px, Kanban → `<select>` + liste verticale (Réservations + B2B), drawer full-width mobile, toasts plein largeur mobile, paddings réduits.

**404 admin** : `app/admin/(shell)/not-found.tsx` dans le shell parent (sidebar+topbar conservés), CTA retour + rappel ⌘K.

**Polish** : toast stack max 3 visibles (`.slice(-3)`), transitions cohérentes via `[data-admin-anim]`.

**Auto-vérification** : `make test-api` 102 verts, `npm run build` 0 erreur TS, smoke complet (⌘K + tweaks persisté + g-shortcuts + ? help + responsive 800px + 404 + Drawer focus trap).

**Différé V2** : dark mode (tokens dark dans tailwind.config), multi-langue, widgets drag&drop dashboard, push notifs, PWA offline, optim mobile fine.

**Dépend** : PR1 à PR7 (toutes livrées). 🎉 **Chantier back-office complet.**

## Total

| Phase | Effort | Cumul |
|---|---|---|
| PR1 Bootstrap | 3-4j | 4j |
| PR2 Auth | 2-3j | 7j |
| PR3 Dashboard | 3-4j | 11j |
| PR4 Contenus (6 tabs + kill EasyAdmin) | 5-7j | 18j |
| PR5 Réservations | 5-7j | 23j |
| PR6 B2B | 3-4j | 27j |
| PR7 Clients/Médias/Users | 3-4j | 31j |
| PR8 Polish | 2-3j | 34j |

Soit **~22 jours minimum, 34 jours réaliste**. Si on travaille 4h/jour effectives sur Claude Code = **2 à 3 mois calendaires**.

## Rappels importants

- **Tunnel anniversaires enfants** (priorité business n°1 d'après le brief V1) est mis en pause. Décision assumée par Mr Vong le 2026-05-18.
- **EasyAdmin** reste en place jusqu'à fin PR4. Pendant ce temps, deux back-offices coexistent (rare, mais nécessaire pour ne pas perdre la main).
- **Mock data du mockup** = source pour les fixtures Doctrine. Pas besoin de partir d'une page blanche pour les schémas de données.
- **Pas de Stripe** dans ce chantier — comme dans le brief V1. La gestion des acomptes reste manuelle (champ `paid` + bouton "Marquer payé").

## À ouvrir avant chaque PR

1. Le mockup correspondant dans `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/` (module .jsx + data.jsx)
2. Ce fichier (PLAN_BACKOFFICE.md)
3. Le prompt Claude Code dans `docs/prompts/PROMPT_CLAUDE_CODE_ADMIN_*.md`

*Fin PLAN_BACKOFFICE.md*
