# PR8 — Back-office Polish (Cmd+K · Tweaks · Raccourcis · A11y · Responsive)

> **À coller dans Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** : `CLAUDE.md`, `docs/GOTCHAS.md`, `docs/PLAN_BACKOFFICE.md` §PR8.

## Contexte

Dernière PR du chantier back-office. C'est ce qui transforme l'outil "utilisable" en outil "agréable" — court mais à haut effet ressenti. **Source design** : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/cmdk.jsx`, `tweaks-panel.jsx`, `app.jsx` (shell + raccourcis).

## Scope strict

### 1. Command Palette ⌘K (`apps/web/src/components/admin/cmdk/`)

- Trigger : `⌘K` (mac) / `Ctrl+K` (windows). Modal centrée, overlay 60% opacité, input autofocus.
- 5 sections : **Aller à** (10 pages admin), **Actions** (raccourcis : nouvelle résa, créer demande B2B, importer média, exporter CSV — actions différées V2 affichées en disabled avec mention "bientôt"), **Réservations** (top 30 résa récentes via `/api/admin/demandes-reservation?itemsPerPage=30`), **B2B** (idem `/admin/b2b-requests`), **Clients** (depuis l'agrégat PR7).
- Recherche fuzzy front (lib légère type `fuse.js` OU implémentation maison : on accepte une dep ici si gain DX clair).
- Navigation clavier : ↑↓ entre items, Enter active l'action, Esc ferme. Index visible (item actif avec fond accent).
- Sélection résa/B2B → ouvre le drawer correspondant directement dans la page cible (router push + state du drawer via query param `?open=ID`).

### 2. Tweaks Panel (`apps/web/src/components/admin/tweaks/`)

- Toggle visibilité via `⌘.` (mac) / `Ctrl+.` (windows). Bouton flottant bas-droite par défaut, masquable.
- 3 réglages, **persistés `localStorage` clé `fgc.admin.tweaks`** :
  - **Densité** : `compact | regular | comfy` (impacte padding cards, hauteur ligne tableau, font-size base). Implémenter via attribut data sur `<html>` + variables CSS dans le shell admin.
  - **Sidebar** : `expanded | collapsed | floating` (collapsed = icônes uniquement avec tooltip au hover ; floating = drawer overlay sur mobile/tablette).
  - **Thème** : `system | light | dark` (V1 : dark seulement marqué "bientôt" si trop lourd à implémenter proprement — sinon mettre les 3 tokens DS en mode dark dans `tailwind.config.ts` et changer la `class="dark"` sur `<html>`).
- Hook `useAdminTweaks()` partagé. Pas de prop drilling.

### 3. Raccourcis clavier globaux (`apps/web/src/lib/admin-keyboard.ts`)

- `g d` → Dashboard, `g r` → Réservations, `g b` → B2B, `g c` → Clients, `g m` → Médias, `g u` → Users (g séquentiel, comme Gmail/Linear).
- `?` → modale "Liste des raccourcis" (overlay avec table key/action).
- `/` → focus barre de recherche de la page courante (si présente).
- Tous les raccourcis désactivés quand un input/textarea/select a le focus (pour ne pas hijacker la frappe).

### 4. Page 404 admin (`/admin/[...not-found]` ou `not-found.tsx` du segment admin)

- Layout admin gardé (sidebar + topbar). Message centré "Cette page n'existe pas", bouton "Retour au dashboard".

### 5. A11y (sweep transversal)

- `focus-visible` : ring `--admin-brand` 2px offset 2px sur tous les éléments interactifs. Audit Chrome DevTools onglet Lighthouse → 100% accessibilité sur `/admin` + 1 page de chaque module.
- ARIA : `aria-current="page"` sur item sidebar actif, `aria-label` sur tous les `<button>` qui n'ont que des icônes (sidebar collapsed, actions row tableaux).
- Skip link `<a href="#main">Aller au contenu</a>` en haut de chaque layout admin (visible au focus uniquement).
- Drawer : `role="dialog"`, `aria-modal="true"`, focus trap quand ouvert, restitution du focus au déclencheur à la fermeture.
- ConfirmDialog : idem + `aria-describedby` sur le bouton confirm pointant vers le message.

### 6. Responsive (`/admin` ≥ tablette)

- Sidebar : passe en mode `floating` automatiquement sous 1024px (drawer overlay déclenché par un bouton hamburger dans la topbar).
- Tableaux : scroll horizontal sous 900px, colonnes "actions" toujours visible (sticky right).
- Kanban : sous 1024px, devient un select de stage + liste verticale (le kanban à 6 colonnes serait illisible).
- Cards KPI : grid 4 → 2 → 1 selon viewport.
- Drawers : largeur fixe 560px desktop → 100% mobile avec close button bien visible.
- Mobile "minimum viable" : on n'optimise pas pour la saisie longue, juste pour la consultation (tu fais une résa téléphone en bureau, pas en attendant le bus).

### 7. Polish divers

- Toasts : empilage propre quand plusieurs apparaissent vite (stack vertical, max 3 visibles).
- Loading states : skeletons partout (cards, lignes tableau, drawer), pas de spinner global.
- Empty states : illustration + texte + CTA sur listes vides ("Pas encore de demandes ? Bouge pas, ça arrive").
- Animations : transitions `150ms ease` sur les hover, `220ms` sur les drawer open/close (cohérent DS).

### À NE PAS faire (V2)

- Multi-langue (`/admin` reste FR-only).
- Personnalisation poussée du dashboard (widgets drag&drop).
- Notifications push navigateur.
- Mode hors-ligne / PWA.
- Optimisation mobile fine (le back-office est outil bureau, mobile = consultation).

## Contraintes

- **Pas d'install de dépendance lourde** pour ⌘K : si tu veux du fuzzy search, `fuse.js` (~5kb) acceptable ; sinon implem maison via score `includes` + boost matchs début. Pas de `cmdk` library officielle (trop opinionée sur le styling).
- Tokens DS uniquement, pas de hex.
- Tous les raccourcis testables au clavier sans souris.
- Performance : ⌘K doit ouvrir en <100ms perçu, fuzzy search en <16ms sur 200 items (mesure perf React DevTools profiler une fois).

## Auto-vérification

1. `make test-api` toujours vert (aucune modif backend cette PR).
2. `npm run build` → 0 erreur TS.
3. ⌘K : ouvre via raccourci, tape "anniv" → matche page Réservations + résa récentes contenant "anniv". Enter sur une résa → drawer ouvert sur la bonne page.
4. Tweaks : densité `compact` → cards plus tassées, persisté entre reloads. Sidebar `collapsed` → icônes seules, tooltip au hover.
5. `g r` au clavier (focus body) → navigue vers /admin/reservations. Même séquence dans un `<input>` → rien (frappe normale).
6. `?` → modale raccourcis visible, Esc ferme.
7. Lighthouse a11y sur `/admin/dashboard` et `/admin/reservations` ≥ 95.
8. Resize navigateur à 800px : sidebar devient hamburger, kanban devient liste, tout reste lisible.
9. Drawer ouvert + Tab → focus reste piégé dedans + Shift+Tab cycle inverse. Close → focus revient au bouton qui l'a ouvert.
10. `/admin/n-existe-pas` → page 404 avec layout admin conservé.
11. `docs/CHANGELOG.md`, `docs/PLAN_BACKOFFICE.md` (§PR8 livrée, chantier back-office complet), `docs/GOTCHAS.md` si nouveau piège.

## Si bloqué

- Si l'implémentation dark mode demande de retoucher tous les composants admin (tokens couleurs partout), V1 = livrer juste light + marquer "Mode sombre — bientôt" disabled dans le tweaks panel. Mieux que livrer un dark cassé.
- Si fuzzy search maison devient un cas particulier de plus à chaque section : accepte `fuse.js`.
- Doute structurel : arrête et demande à Kévin.

*Fin PROMPT_CLAUDE_CODE_ADMIN_POLISH.md*
