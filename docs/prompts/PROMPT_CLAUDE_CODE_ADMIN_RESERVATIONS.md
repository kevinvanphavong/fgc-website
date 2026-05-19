# PR5 — Back-office : gestion des demandes de réservation anniv

> **À coller dans Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** : `CLAUDE.md`, `docs/GOTCHAS.md`, `docs/PLAN_BACKOFFICE.md` §PR5, `docs/API_CONTRACT.md`. L'entité `DemandeReservation` existe déjà (livrée par le tunnel anniv PR10/13) — on construit l'écran admin par-dessus, on ne refait pas l'entité.

## Contexte

Le tunnel anniv `/reserver-anniversaire` produit des `DemandeReservation` avec cycle `nouveau → contacte → confirme | refuse | passe`. Le gérant doit pouvoir voir, filtrer, faire transiter les demandes, et ajouter des notes internes (rappel téléphone, paiement reçu, etc.).

**Source design** : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/reservations.jsx` + `data.jsx` (consts `RESERVATIONS`, `STATUS_META`) à lire avant de coder.

**Simplification V1 (vs mockup)** :
- Pas de vue Calendrier (over-engineering pour le volume actuel — Kanban + Tableau suffisent).
- Pas de bandeau "conflits détectés" : le tunnel les bloque déjà via 409 en amont.
- Pas de "Nouvelle réservation" depuis l'admin (V2 si besoin de saisie manuelle téléphone).
- Pas de B2B / groupes : V1 = anniv uniquement (le mockup mélange les deux, on garde la structure pour ajouter facilement, mais on n'expose que les anniv).

## Scope strict

### Côté Symfony (`apps/api/`)

1. **Endpoints admin sur `DemandeReservation`** (toutes les ops `ROLE_STAFF`, sans toucher à l'op publique POST existante) :
   - `GET /api/admin/demandes-reservation` (uriTemplate explicite — gotcha #6) avec filtres `?status=nouveau,contacte&from=2026-05-01&to=2026-06-30&search=foo&page=1&itemsPerPage=25`. Recherche : `reference`, `parentLastName`, `parentEmail`, `childName`. Tri défaut `createdAt DESC`.
   - `GET /api/admin/demandes-reservation/{id}` (détail complet).
   - `PATCH /api/admin/demandes-reservation/{id}` — accepte uniquement les champs `status`, `adminNote`, `internalContactedAt`, `internalConfirmedAt`. Pas de modif des champs client (RGPD/traçabilité).

2. **Machine d'état status** côté `DemandeReservationProcessor` (ou un `StateTransitionValidator` dédié si tu préfères propre) : valide les transitions autorisées et rejette 422 sinon.
   ```
   nouveau    → contacte | refuse
   contacte   → confirme | refuse
   confirme   → passe    | refuse
   refuse     → (terminal)
   passe      → (terminal)
   ```
   À chaque transition, **stamp** la timestamp correspondante (`internalContactedAt`, `internalConfirmedAt`, etc. — ajouter ces colonnes à l'entité via migration).

3. **Champ `adminNote`** (text nullable, max 2000) sur l'entité, exposé en read/write admin uniquement (groupe `demande:admin`). Migration Doctrine.

4. **Endpoint `GET /api/admin/demandes-reservation/stats`** : counts par status + count `nouveau` du jour. Sert au badge "à traiter" dans la sidebar admin et au futur dashboard.

5. **Tests** : transitions valides 200, transitions interdites 422, filtres listing OK, accès sans token 401, accès avec `ROLE_STAFF` 200.

### Côté Next.js (`apps/web/src/app/admin/`)

6. **Page `/admin/reservations`** (RSC fetch initial via proxy + hydratation client) :
   - Toolbar : barre de recherche, sélecteur de période (preset "7j / 30j / Tous"), filtres status (chips multi-select).
   - **Tabs Kanban / Tableau** (state local + persist `localStorage` clé `fgc.admin.resa.view`).
   - Kanban : 5 colonnes (nouveau, contacte, confirme, passe, refuse). Drag&drop entre colonnes adjacentes autorisées seulement (cf. machine d'état). DnD via dépendance déjà au boot si possible (sinon HTML5 natif).
   - Tableau : colonnes ref, date événement, créneau, parent, formule, enfants, status (pill), créé le, actions (ouvrir drawer).
   - Pagination 25 / page, scroll infini OK.

7. **Drawer détail** (composant `<ReservationDrawer>`) — ouvre sur clic ligne / card :
   - Bloc 1 : récap client (parent, contact, enfant, formule, date, créneau, gâteau, allergies, message, source, upsellVR, newsletter).
   - Bloc 2 : actions transitions (boutons disabled selon machine d'état). Confirmation modale pour `refuse` ("êtes-vous sûr ? le client recevra-t-il un email ?" — V1 : pas d'email auto, juste check visuel).
   - Bloc 3 : note interne (textarea autosave debounce 800ms → PATCH).
   - Bloc 4 : timeline (créée le, contactée le, confirmée le… affichage des stamps non-null).

8. **Badge sidebar** : count `nouveau` en pastille rouge sur l'item "Réservations" de la sidebar (fetch `/stats` au mount + revalidate toutes les 60s ou sur focus onglet).

9. **Dashboard KPI** (la PR3 livre des mocks) : remplacer le mock `reservationsToday.value` par le vrai count `nouveau` du jour. Pas la peine de refondre tout le dashboard, juste cette ligne.

10. **Toasts** sur chaque action : "Demande marquée contactée", "Note enregistrée", etc.

### À NE PAS faire (V2)

- Vue calendrier mensuelle / hebdo.
- Export CSV (V2 si volume justifie).
- Notification mail au client sur transition (V2, dépend décision "automatiser ou pas le 'on vous rappelle' V1 manuel").
- Création de demande depuis l'admin.
- Détection de conflits côté admin (tunnel le fait déjà côté création).
- Module B2B (= PR6 séparée).

## Contraintes

- Réutiliser `makeEntityHooks<T>` + proxy `/api/admin/proxy/[...path]` posés en PR4. Si une spécificité du PATCH oblige à dévier, encapsuler dans `useDemandeReservation` plutôt que de fork le pattern.
- Tokens DS admin (`admin-*` violet `#5E2DB8` pour primary). Status pills : reprendre les couleurs du mockup `STATUS_META` mais via tokens (`admin-amber` nouveau, `admin-blue` contacte, `admin-green` confirme, `admin-gray` passe, `admin-red` refuse).
- Gotcha #6 obligatoire sur `/api/admin/demandes-reservation` (uriTemplate explicite).
- Pas de dépendance lourde pour le DnD : préférer `@dnd-kit/core` si pas déjà installé (léger, accessible), sinon HTML5 drag events.

## Auto-vérification

1. `make test-api` → tous tests verts, dont les nouveaux sur transitions et filtres.
2. `npm run build` → 0 erreur TS, route `/admin/reservations` présente.
3. Naviguer : log admin → onglet "Réservations" affiche les 3 fixtures + celles créées en test depuis le tunnel.
4. Kanban : drag d'une carte `nouveau` → `contacte` → carte se déplace + toast vert + stamp `internalContactedAt` posé en BDD (vérifier via curl `GET /{id}`).
5. Tentative drag d'une carte `passe` → n'importe : visuel reste, toast rouge "transition non autorisée".
6. Drawer : édition d'une note autosave OK, refresh page → note persistée.
7. Badge sidebar : créer une nouvelle demande via le tunnel `/reserver-anniversaire` → badge passe de N à N+1 dans la minute (ou sur reload).
8. `docs/CHANGELOG.md` : `feat(admin,api): gestion des demandes de réservation anniv (PR5) — listing + filtres, kanban DnD, drawer, transitions status, note interne, badge sidebar`.
9. `docs/API_CONTRACT.md` : documenter les 3 nouveaux endpoints admin + le payload PATCH.
10. Mettre à jour `docs/PLAN_BACKOFFICE.md` §PR5 : marquer livrée, ajuster les hypothèses obsolètes (pas de calendrier V1, etc.).

## Si bloqué

- Si une transition de status devient ambigüe en prod (ex. faut-il pouvoir "rouvrir" une refus ?) : V1 = non, terminal. Si Mr Vong demande, V2.
- Conflit avec une convention déjà posée par PR4 (`makeEntityHooks`, proxy) : aligne-toi sur l'existant, ne forke pas.
- Doute structurel : arrête et demande à Kévin.

*Fin PROMPT_CLAUDE_CODE_ADMIN_RESERVATIONS.md*
