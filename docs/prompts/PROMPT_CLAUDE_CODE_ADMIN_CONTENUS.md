# PR4 — Module Contenus (6 tabs) + KILL EasyAdmin

> **À coller dans une session Claude Code, depuis la racine du repo `fgc-website-claude/`.**

## Contexte

PR4 du chantier back-office (`docs/PLAN_BACKOFFICE.md`). **Deux phases obligatoirement dans cet ordre** :
- **Phase 1 — BUILD** : module Contenus à 6 tabs (4 du mockup + 2 nouveaux pour couvrir Offres/Menu encore utilisés par le site public).
- **Phase 2 — KILL** : suppression complète et propre d'EasyAdmin (cohérence "pas de code dormant" demandée par Kévin).

**On ne passe à la Phase 2 que quand la Phase 1 est validée fonctionnellement.**

Source design : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/contenus.jsx` (à lire en entier, surtout `FormulesEditor`, `TarifsEditor`, `ActivitesEditor`, `HorairesEditor`). Pour Offres + Bar & Snack, pas de mockup → s'inspirer du style des autres éditeurs (cards + switch visible/invisible + bouton modifier).

---

## PHASE 1 — BUILD module Contenus

### Côté Symfony (`apps/api/`)

1. **Audit préalable** : pour chaque entité ciblée, vérifier ses `#[ApiResource]` existants. Probablement publics aujourd'hui (utilisés par le site public via `lib/content-api.ts`). **Préserver les operations GET publiques** (le site doit continuer à marcher) et **ajouter** des operations POST/PUT/PATCH/DELETE avec `security: "is_granted('ROLE_STAFF')"`. Soit en étendant l'annotation existante, soit en créant un `#[ApiResource]` admin séparé. Préférer l'extension de l'existant pour limiter la duplication.

2. **DTOs Input** Symfony Validator pour chaque write operation, avec `Assert\*` (cf. `CLAUDE.md` §7.2). Pas de `Request->get()` direct.

3. **Endpoints attendus** (chaque entité a son CRUD admin) :
   - `/api/hebdo_cards`, `/api/pass_cards`, `/api/resa_cards`, `/api/anniv_cards`, `/api/vip_features`
   - `/api/tarif_cards`, `/api/tarif_price_lines`
   - `/api/activity_page_contents`
   - `/api/day_schedules`
   - `/api/offers`
   - `/api/menu_sections`, `/api/menu_categories`, `/api/menu_items`

4. **Tests minimum par entité** : `WebTestCase` qui vérifie 401 sans token, 403 avec ROLE_USER, 200/201 avec ROLE_STAFF, 400 sur payload invalide.

### Côté Next.js (`apps/web/`)

5. **Page conteneur** `app/admin/(shell)/contenus/page.tsx` : header (titre + bouton "Prévisualiser sur le front" qui ouvre `/` dans nouvel onglet, bouton "Publier" placeholder sans logique en V1), nav à 6 tabs, contenu du tab actif.

6. **Routing tabs** : par segment d'URL (`/admin/contenus/formules`, `.../tarifs`, etc.) plutôt que state local — permet de partager une URL profonde. La route racine `/admin/contenus` redirect vers `/admin/contenus/formules` (premier tab).

7. **6 composants éditeurs** dans `components/admin/contenus/` :
   - `FormulesEditor` — 5 groupes (hebdo/pass/résa/anniv/vip) avec cards items (nom, prix, badges, switch visible). Drawer/modal d'édition.
   - `TarifsEditor` — table éditable des `TarifCard` + sous-table `TarifPriceLine`.
   - `ActivitesEditor` — liste des 8 activités (`ActivityPageContent`) avec édition du contenu de la page activité (titre, sous-titre, hero text, etc.).
   - `HorairesEditor` — semaine type éditable (`DaySchedule`) + section "exceptions" si modélisable (sinon noter en TODO).
   - `OffresEditor` — cards des `Offer` actives sur la home, drag-to-reorder si simple sinon ordre par champ `position`.
   - `BarSnackEditor` — arborescence Sections > Catégories > Items, édition inline.

8. **Composants génériques admin** dans `components/admin/ui/` : `Switch`, `Tabs`, `Drawer`, `Field` (input + label + erreur), `ConfirmDialog` (pour suppressions).

9. **Hooks data** : un hook par entité dans `lib/admin-hooks/` qui wrappe React Query (`useFormules`, `useTarifs`, etc.) avec `getQueryClient` partagé. Mutations avec invalidation auto du cache.

10. **Toasts** sur succès/échec mutations (réutiliser le pattern existant si déjà en place après PR2/PR3, sinon ajouter une lib légère ou un système maison de 30 lignes).

### Validation Phase 1 (avant Phase 2)

- Naviguer entre les 6 tabs depuis `/admin/contenus` : chaque tab charge ses données.
- Modifier une formule, sauvegarder, vérifier que `/tarifs-et-formules` côté site public reflète le changement (sans refresh manuel — Next ISR ou revalidatePath sur mutation).
- Désactiver une offre, vérifier qu'elle disparaît de la home publique.
- Modifier un item du menu bar, vérifier sur `/bar-snack` public.
- `npm run build` ✓ 0 erreur.
- `cd apps/api && bin/phpunit` ✓ vert.

---

## PHASE 2 — KILL EasyAdmin

**Exécuter intégralement la checklist de `docs/PLAN_BACKOFFICE.md` section "Checklist exhaustive de suppression EasyAdmin" (Étapes 0 à 5).**

Rappel des points clés :
- **Étape 0 dry-run obligatoire** : `grep -r "EasyCorp\|easyadmin" --include="*.php" --include="*.yaml" --include="*.twig" -l apps/api/` → ne doit retourner QUE les fichiers à supprimer listés. Si autre chose remonte, **stop et investiguer avant de continuer**.
- **Étape 4 vérifications finales** : 4 commandes doivent toutes retourner 0 résultat lié à EasyAdmin (`cache:clear`, `grep` global, `debug:router | grep admin`, `debug:container | grep easyadmin`).
- **Étape 5** : commit séparé `chore(api): remove EasyAdmin (replaced by Next.js admin)` pour traçabilité.

### Points d'attention spécifiques à cette PR

- Le **DashboardController EasyAdmin** (`src/Controller/Admin/DashboardController.php`) ne doit pas être confondu avec le **DashboardController Api** (`src/Controller/Api/Admin/DashboardController.php`, créé en PR3). Seul le premier est supprimé.
- Le **firewall `admin`** dans `security.yaml` doit être retiré, mais le provider `app_user_provider` doit rester (utilisé par le firewall `api`).
- L'**access_control `^/admin`** doit être retiré (sinon il bloque les ressources statiques Next côté `/admin`).
- Vérifier que **après le kill**, `http://localhost:8000/admin` (Symfony) retourne 404 (et non plus une route EasyAdmin), et que `http://localhost:3000/admin` (Next) continue de fonctionner.

---

## À NE PAS faire (différé)

- Workflow de "draft / publish" — V1 = publication immédiate (cf. mockup : "les changements sont publiés immédiatement").
- Versioning / historique des changements (V2).
- Édition WYSIWYG (textarea + markdown au max en V1).
- Upload d'images dans cette PR (réservé module Médias, PR7).
- Module Réservations (PR5).
- Cmd+K (PR8).

## Auto-vérification

1. Phase 1 build : 6 tabs naviguent et éditent les entités via API.
2. Site public reflète immédiatement les modifications faites depuis le back-office.
3. Phase 2 kill : checklist `PLAN_BACKOFFICE.md` Étapes 0-5 exécutée intégralement.
4. `http://localhost:8000/admin` → 404. `http://localhost:3000/admin` → fonctionne.
5. `grep -r "EasyCorp\|easyadmin" --include="*.php" --include="*.yaml" --include="*.twig" apps/api/` → 0 résultat.
6. `cd apps/api && composer.lock` ne contient plus `"name": "easycorp/easyadmin-bundle"`.
7. `npm run build` ✓ 0 erreur TypeScript. `bin/phpunit` ✓ vert.
8. `docs/CHANGELOG.md` : 2 entrées séparées — `feat(admin,api): module Contenus 6 tabs (PR4 phase 1)` et `chore(api): remove EasyAdmin (PR4 phase 2) — -15 controllers, -1 bundle, -3 security blocks, -1 route file`.

## Si tu es bloqué

- Doute sur la structure d'un éditeur : ouvre `back-office-mockup/contenus.jsx` + la prévis Claude Design dans `back-office-mockup/back-office.html`.
- Doute sur l'API Platform security : doc officielle https://api-platform.com/docs/core/security/.
- Doute structurel : **arrête et demande à Kévin**.

*Fin PROMPT_CLAUDE_CODE_ADMIN_CONTENUS.md*
