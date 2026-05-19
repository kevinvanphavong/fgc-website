# PR3 — Dashboard admin (KPIs + sparklines + activité)

> **À coller dans une session Claude Code, depuis la racine du repo `fgc-website-claude/`.**

## Contexte

PR3 du chantier back-office (`docs/PLAN_BACKOFFICE.md`). Premier vrai écran fonctionnel. Les entités métier (Reservation, B2BRequest) n'existent pas encore (PR5/6) → **les KPIs sont mockés côté API avec un flag `demo: true` et un banner visible côté front**. En PR5, on remplacera juste l'implémentation de l'endpoint, le front ne bougera pas.

Source design : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/dashboard.jsx` (à lire en entier). Valeurs de référence cohérentes : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/data.jsx` (RECENT_ACTIVITY, NOTIFS, RESERVATIONS pour les chiffres).

## Scope strict

### Côté Symfony (`apps/api/`)

1. **Endpoint `GET /api/admin/dashboard`** (security `ROLE_STAFF`) dans un nouveau `DashboardController` (pas EasyAdmin — celui-là est `App\Controller\Admin\Api\DashboardController` ou similaire pour éviter la collision de namespace). Retourne :
   ```json
   {
     "meta": { "demo": true, "generatedAt": "ISO8601" },
     "kpis": {
       "revenueToday": { "value": 2751, "delta": 12, "spark": [number, ...7 points] },
       "reservationsToday": { "value": 12, "delta": 3, "spark": [...] },
       "occupancyRate": { "value": 0.74, "delta": -2, "spark": [...] },
       "revenueMonth": { "value": 11455, "delta": 18, "spark": [...] }
     },
     "recentActivity": [
       { "id": "...", "type": "reservation|payment|user|system", "label": "...", "meta": "...", "at": "ISO8601" }
     ],
     "notifications": [
       { "id": "...", "title": "...", "body": "...", "at": "ISO8601", "unread": true }
     ]
   }
   ```
2. **Valeurs cohérentes** avec le mockup (`data.jsx` RECENT_ACTIVITY / NOTIFS / RESERVATIONS). Pas inventer du n'importe quoi — recopier les valeurs du mockup pour que le rendu ressemble à la prévisualisation Claude Design.
3. **Pas de query DB** dans cette PR — retourner les valeurs en dur dans le controller. Marquer `// TODO PR5 : remplacer par vraies queries Reservation/Payment` sur chaque bloc.
4. Tests minimum : `WebTestCase` 200 avec token, 401 sans (cf. `CLAUDE.md` §7.4).

### Côté Next.js (`apps/web/`)

5. **Page dashboard** : `app/admin/(shell)/page.tsx` rendu côté serveur, fetch l'endpoint via le helper `lib/admin-api.ts` (à créer si pas déjà : helper fetch typé qui propage le cookie `admin_token` côté server, gère 401 → redirect login).

6. **Banner démo** (composant `<DemoBanner>` dans `components/admin/`) : visible en haut du contenu si `meta.demo === true`. Texte : *"Les chiffres affichés sont des données de démonstration. Les vraies données seront branchées en PR5 (gestion des réservations)."* Couleur amber, dismissible via `sessionStorage` (re-affiché à chaque session navigateur).

7. **4 KPI cards** (composant `<KpiCard>` dans `components/admin/dashboard/`) :
   - Props : `label`, `value` (formaté €/% selon type), `delta` (en %, color vert si > 0 sinon rouge), `sparkline` (array de nombres), `accentColor` (token tailwind `admin-brand`, `admin-green`, `admin-amber`, `admin-pink`).
   - Sparkline : **SVG natif** avec `<polyline>` (cf. mockup `dashboard.jsx`) — pas de Chart.js pour 4 mini-graphes, c'est over-engineering. Width 100% du card, height 40px.
   - Layout : grid 4 colonnes en desktop, 2 en tablet, 1 en mobile.

8. **Tableau activité récente** (composant `<RecentActivity>`) : liste des `recentActivity` du payload. Icône par type, label + meta secondaire + timestamp relatif ("il y a 3 min"). Utiliser `Intl.RelativeTimeFormat` natif (pas date-fns).

9. **Notifications dans la topbar** : le popover existant (vide en PR1) consomme maintenant `notifications` du payload. Dot rouge si au moins une `unread: true`. Click sur "Tout marquer comme lu" → POST `/api/admin/notifications/mark-read` (endpoint mocké aussi, juste retourne 204). Pas de persistance réelle en PR3.

10. **Bouton refresh manuel** (↻) en haut à droite du dashboard, à côté du titre. Re-fetch l'endpoint. Pas d'auto-refresh.

11. **Skeleton loading** pendant le fetch initial (cards grises avec animation pulse). Pas de spinner global.

### À NE PAS faire (différé)
- Vraies queries DB sur Reservation/Payment (PR5).
- Filtres date range (PR5).
- Drill-down sur les KPIs (PR5+).
- Cmd+K (PR8).
- Tweaks panel (PR8).
- Charts riches (Chart.js, Recharts) — sparkline SVG suffit pour V1.
- Auto-refresh polling (V2 si besoin).

## Contraintes techniques

- **TypeScript strict**, RSC par défaut. Le KpiCard peut être pur RSC. Le DemoBanner est client (sessionStorage). Le popover notifs est client (state ouverture).
- **Pas de dépendance ajoutée** sauf si vraiment justifié. `Intl.*` natifs > date-fns. SVG natif > Chart.js.
- **Couleurs via tokens `admin-*`** : aucun hex en dur dans le JSX (rappel : la dette des 2 gradients de PR1 reste pour PR8, ne pas en ajouter de nouvelle).
- **Format monétaire** : `Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })`.
- **Format %** : `Intl.NumberFormat('fr-FR', { style: 'percent', maximumFractionDigits: 0 })`.
- **Format date relative** : `Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })`.

## Auto-vérification

1. `cd apps/api && symfony console cache:clear` → 0 erreur.
2. `cd apps/api && bin/phpunit tests/Controller/Api/DashboardControllerTest.php` → vert.
3. `curl http://localhost:8000/api/admin/dashboard -H "Authorization: Bearer <token>"` → 200 avec le payload structuré ci-dessus.
4. `curl http://localhost:8000/api/admin/dashboard` (sans token) → 401.
5. Navigateur : `/admin` → 4 KPI cards visibles avec sparklines + tableau activité + popover notifs cliquable + banner démo amber en haut.
6. Click "fermer" sur le banner → disparaît. Reload onglet → banner re-affiché. Nouvel onglet → re-affiché.
7. Click ↻ → fetch refait, valeurs affichées identiques (mock stable).
8. Mobile (375px) → KPI cards en 1 colonne, lisibles.
9. `npm run build` ✓ 0 erreur TypeScript.
10. **EasyAdmin toujours fonctionnel** : `http://localhost:8000/admin` Symfony OK (sanity check).
11. `docs/CHANGELOG.md` : `feat(admin,api): dashboard avec KPIs mockés (PR3) — 4 KPI cards + sparklines + activité + notifs + banner démo`.

## Si tu es bloqué

- Doute design sparkline : ouvre `back-office-mockup/dashboard.jsx` et la prévis SVG dans `back-office-mockup/back-office.html`.
- Doute structurel : **arrête et demande à Kévin**.

*Fin PROMPT_CLAUDE_CODE_ADMIN_DASHBOARD.md*
