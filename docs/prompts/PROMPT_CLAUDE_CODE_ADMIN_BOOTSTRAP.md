# PR1 — Bootstrap back-office admin shell

> **À coller dans une session Claude Code, depuis la racine du repo `fgc-website-claude/`.**

## Contexte

On démarre le chantier "back-office Next.js full mockup" décrit dans `docs/PLAN_BACKOFFICE.md`. PR1 = bootstrap. **Aucune data réelle, aucune auth, aucune logique métier.** Juste le shell visuel et la navigation entre les 7 sections.

Source de vérité du design : `~/Desktop/FAMILY GAMES CENTER/back-office-mockup/`. Lis impérativement `app.jsx` (shell + routing) et `ui.jsx` (primitifs) avant de commencer.

## Scope strict de cette PR

### À faire
1. Créer la route `/admin` dans `apps/web/src/app/admin/` avec un `layout.tsx` qui contient le shell complet (sidebar + topbar). Sous-routes : `/admin` (= dashboard), `/admin/reservations`, `/admin/b2b`, `/admin/clients`, `/admin/contenus`, `/admin/medias`, `/admin/users`.
2. **Sidebar** : 3 sections (Pilotage / Site web / Réglages), branding "F" + "Family Games / Back Office", 7 items avec icônes Lucide, état actif, badges (vide en PR1), avatar admin en bas (hard-codé "Élise Caron / Administrateur" pour l'instant).
3. **Topbar** : breadcrumb (Back office / {section courante}), bouton recherche placeholder ("Rechercher partout… ⌘K"), bouton Aide, bouton Notifications avec dot rouge (popover vide en PR1).
4. **Tokens design admin** dans `tailwind.config.ts` : ajouter une palette `admin-*` séparée des tokens FGC publics (violet primaire `#5E2DB8`, fond `#F5F6FA`, etc.). Lire les variables CSS du mockup dans `app.jsx` / `ui.jsx` pour les valeurs exactes.
5. **Primitifs UI admin** dans `apps/web/src/components/admin/ui/` : `Button`, `Icon` (wrapper Lucide), `Avatar`, `Badge`, `Card`. Calqués sur ce qu'utilise `app.jsx`.
6. **Chaque page** = composant "Coming soon" stylé avec le titre de la section + un petit message "Module en cours d'implémentation — PR# à venir".

### À NE PAS faire
- Auth (PR2)
- Vraie data (PR3+)
- Cmd+K fonctionnel (PR8 — juste le bouton + raccourci ⌘K qui ouvre rien)
- Tweaks panel (PR8)
- Toucher à EasyAdmin (PR4)
- Toucher à l'API Symfony (rien à faire côté backend dans cette PR)

## Contraintes techniques

- **TypeScript strict** partout.
- **RSC par défaut**, `'use client'` uniquement sur le layout admin (parce que sidebar collapse + breadcrumb réactif).
- **Tailwind v3** : tous les styles via tokens du `tailwind.config.ts`. Pas de couleurs hex en dur dans le JSX.
- **Icons** : `lucide-react` (déjà dans le starter ou à ajouter — vérifie `package.json`).
- **Responsive** : sidebar collapse en `<lg`, topbar adapté. Mobile pas prioritaire mais ne doit pas casser.
- **Pas de localStorage** pour l'état sidebar dans cette PR (PR8).
- Convention commits : `feat(admin): ...` avec scope `admin`.

## Workflow git

Conformément à `CLAUDE.md` §5 : commit + merge direct sur `main`. Pas de PR séparée sauf demande explicite.

## Auto-vérification (avant de finir la PR)

1. `npm run dev` depuis la racine, ouvrir `http://localhost:3000/admin` → le shell s'affiche, on peut cliquer sur les 7 items du menu et l'URL change.
2. `npm run build` → 0 erreur TypeScript, 0 warning lint bloquant.
3. La sidebar respecte visuellement le mockup (palette, espacements, icônes) — comparer côté à côté avec `back-office-mockup/back-office.html` ouvert dans le navigateur.
4. Le toggle "replier la barre latérale" (bouton topbar gauche) fonctionne.
5. Le bouton ⌘K ouvre un placeholder (modal vide ou console.log) — fonctionnel = PR8.
6. Aucun fichier touché côté `apps/api/` (sanity check : `git diff apps/api` doit être vide).
7. `docs/CHANGELOG.md` mis à jour : ligne `feat(admin): bootstrap admin shell (PR1) — route /admin + sidebar 3 sections + 7 pages placeholder`.

## Si tu es bloqué

- Doute sur un token / une couleur : ouvre `back-office-mockup/back-office.html` dans le navigateur et inspecte.
- Doute sur un comportement : relis `back-office-mockup/app.jsx` lignes 84-205.
- Doute structurel : **arrête et demande à Kévin** plutôt que d'inventer.

*Fin PROMPT_CLAUDE_CODE_ADMIN_BOOTSTRAP.md*
