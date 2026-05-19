# Mode démo + White-label léger + Scénario démo (pitch parc à parc)

> **À coller dans Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** : `CLAUDE.md`, `docs/GOTCHAS.md`, `docs/PAGES_BACKLOG.md`, `docs/PLAN_BACKOFFICE.md`. Cette PR transforme le projet en **outil de démo commerciale** pour démarcher d'autres gérants de parcs de loisirs (bowling, laser game, escape, mini-golf, etc.).
>
> **Pré-requis** : la PR `PUBLIC_FINISHING` (contact + légales + SEO + 404) doit être livrée avant. Si elle a introduit des changements de structure que ce prompt n'anticipe pas, adapter sans demander.

## Contexte

Le projet reste en local, **il ne sera PAS mis en prod** pour FGC. Il sert de showcase technique : "voilà ce qu'on peut vous livrer en 2 semaines". L'objectif est de pouvoir, devant un prospect dans son parc :
1. Booter le projet en moins de 60 secondes,
2. Changer en 30 secondes le nom/logo/couleur primaire pour qu'il s'affiche "à ses couleurs",
3. Dérouler un scénario de 12 min qui raconte une histoire utilisateur complète, sans bug.

3 chantiers groupés dans cette PR (~2,5j).

## Scope strict

### A. Mode démo robuste (`make demo`, ~1j)

1. **Script `make demo`** (Makefile racine) qui en une commande :
   - Installe les deps si besoin (`composer install`, `npm install`),
   - Démarre Postgres dev (docker-compose si dispo, sinon assume qu'il tourne déjà),
   - `doctrine:migrations:migrate --no-interaction`,
   - **Drop puis recharge les fixtures démo** (séparer `--group dev` et `--group demo` — les fixtures démo sont riches, voir point 2),
   - Lance `apps/api` (port 8000) et `apps/web` (port 3000) en background avec PID files (`make demo-stop` pour tout couper),
   - Ouvre automatiquement `http://localhost:3000` dans le navigateur en fin de boot.

2. **Fixtures `demo` riches** dans `apps/api/src/DataFixtures/Demo/` (séparer dossier de la fixture dev, pour ne pas polluer le mode dev normal) :
   - **50 `DemandeReservation`** réparties sur 6 mois (passé 3 mois + futur 3 mois), tous statuts représentés, noms parents/enfants français variés (générer avec Faker), formules réparties (40% Super Bowler, 35% New Bowler, 25% Pro Bowler), upsell VR sur ~30%, allergies/gâteau renseignés sur ~40% (pour montrer les détails), `internalContactedAt/ConfirmedAt` cohérents avec status.
   - **15 `B2BRequest`** réparties sur les 6 stages, mix `seminaire / team_building / soiree / arbre_noel`, montants estimés crédibles (800€ → 8000€), notes admin sur ~50%.
   - **10 `ContactMessage`** (si livré par PUBLIC_FINISHING), statuts mixtes.
   - **10 `Media`** : générer des PNG placeholder colorés (`apps/api/src/DataFixtures/Demo/posters/*.png`, taille 800×1000, 4-5 variantes de couleurs FGC), 6 tags représentés.
   - **3 `User`** : 1 admin (`admin@demo.fgc / Demo2026!`), 1 manager (`manager@demo.fgc / Demo2026!`), 1 staff (`staff@demo.fgc / Demo2026!`). Avatars colorés différents.
   - **Historique 12 mois** sur les KPI dashboard : ajouter un seeder qui pose des stats agrégées (peut être en dur dans `DashboardController` derrière un flag `demo_mode=true`) pour que les sparklines aient une vraie courbe d'évolution, pas une ligne plate.

3. **Endpoint `POST /api/demo/reset`** (protégé par variable d'env `DEMO_RESET_ENABLED=1` + header `X-Demo-Token: <token>`, jamais activé hors démo) :
   - Drop + recharge fixtures démo en arrière-plan.
   - Bouton "🔄 Reset démo" visible en bas-droite de l'admin uniquement si `NEXT_PUBLIC_DEMO_MODE=1`. Confirme + appelle l'endpoint + reload.

4. **Banner "Mode démo"** (composant `<DemoBanner>`) visible en haut de TOUTES les pages publiques + admin si `NEXT_PUBLIC_DEMO_MODE=1` : texte court "Démonstration interactive — les données sont fictives", couleur amber discrète, dismissible session uniquement. Aucun effet si flag à 0.

5. **README dédié `docs/DEMO.md`** : pré-requis (Docker, Node 20+, PHP 8.3+), commande unique (`make demo`), accès admin, comment reset, troubleshooting top 5 (port occupé, DB pas démarrée, fixtures plantées, npm cache, JWT keys absentes).

### B. White-label léger (~1j)

6. **Fichier `apps/web/src/config/branding.ts`** qui centralise TOUT ce qui est marque :
   ```typescript
   export const branding = {
     name: 'Family Games Center',
     shortName: 'FGC',
     tagline: 'Bowling, laser game et arcade à Blois',
     slogan: 'Le plus grand parc de jeux de la région',
     logo: { src: '/branding/logo.svg', width: 180, height: 60 },
     colors: { primary: '#FFD93D', secondary: '#FF2D87', accent: '#5E2DB8' },
     contact: { phone: '02 54 74 85 21', email: 'contact@familygamescenter.fr', address: '...' },
     social: { instagram: '@familygamescenter', facebook: 'familygamescenter' },
   } as const;
   ```
   Toutes les pages publiques + Header + Footer + emails Twig consomment ce fichier — **chasser et remplacer toutes les chaînes en dur** "Family Games Center", "FGC", "Blois", n° de tel, etc.

7. **Côté API : `apps/api/config/branding.yaml`** symétrique + service `BrandingProvider` injecté dans les mailers Twig (variable globale `{{ branding.name }}` etc.).

8. **Couleurs primaires dérivées dynamiquement** dans `tailwind.config.ts` : si tu changes `colors.primary` dans le branding, les tokens Tailwind suivent. Implémentation simple : générer un fichier `tailwind.tokens.css` à partir de `branding.ts` au build, injecté dans `globals.css`. Évite la sur-ingénierie : un `--brand-primary` CSS variable par couleur, mappé via `theme.extend.colors`.

9. **Logo "swappable"** : `public/branding/logo.svg` lit `currentColor` au max pour qu'un changement de `colors.primary` se reflète automatiquement. Sinon, fallback simple : SVG textuel "{{ shortName }}" stylé avec les couleurs branding (gentil pour démo, on n'est pas un studio de design).

10. **Mode preview white-label** : un toggle dans le Tweaks Panel admin (`PR8`) "Personnaliser la marque" qui ouvre une mini-UI (nom, slogan, 3 couleurs) → patch `localStorage` `fgc.branding.override`. Les composants lisent cet override en priorité, fallback sur `branding.ts`. **Reset au reload** (pas de persistance serveur — c'est juste pour le wow effect en RDV).

11. **Documenter dans `docs/WHITE_LABEL.md`** : où changer le branding "en dur" (vrai déploiement) vs "en démo" (override session). 1 page max.

### C. Scénario de démo écrit (~0,5j)

12. **`docs/DEMO_SCRIPT.md`** : script pas-à-pas avec timing indicatif et captures à anticiper :
    ```
    [0:00 — 0:30] Intro : "Je vais vous montrer comment une parent réserverait l'anniversaire de son fils"
    [0:30 — 2:30] Tunnel anniv : remplissage 5 étapes, parler du upsell VR, montrer la résa
    [2:30 — 3:30] Notification immédiate : refresh admin → la résa apparaît, badge sidebar +1
    [3:30 — 5:30] Gestion résa : drawer, transitions, note admin, kanban
    [5:30 — 6:30] Switch B2B : pipeline commercial, drag&drop, devis
    [6:30 — 8:30] Dashboard : KPI 12 mois, sparklines
    [8:30 — 10:30] Contenus : édition formules tarifs en direct, "vous gardez la main sur tout"
    [10:30 — 11:30] White-label : "regardez, on met votre marque" → change couleurs+nom devant lui
    [11:30 — 12:00] Sortie : "voilà ce qu'on peut vous livrer en 2 semaines"
    ```
    Inclure : "ce qu'on dit pas" (ce qui peut planter, ce qui est différé V2 mais qu'il faut pas mentionner spontanément).

13. **`docs/DEMO_FAQ.md`** : 10-15 questions probables d'un prospect parc de loisirs ("Combien ça coûte ?", "Vous hébergez ?", "Et si je veux ajouter X ?", "Comment vous gérez les paiements ?", "Mes données m'appartiennent ?") avec réponses-types courtes. Pas commercial, posture conseil.

### À NE PAS faire (chantier suivant)

- Plaquette / deck PDF (= chantier "support commercial" suivant).
- Page `/positionnement` vs concurrence (= chantier suivant).
- Vrai système d'instance multi-tenant (tu vends du sur-mesure, pas du SaaS).
- Theming poussé (typo swappable, dark mode, etc.).
- Vidéo de démo enregistrée (V2 quand le script est rodé après 2-3 RDV réels).

## Contraintes

- Le mode démo ne casse JAMAIS le mode dev normal. Toutes les modifs sont conditionnées par un flag env (`NEXT_PUBLIC_DEMO_MODE`, `DEMO_RESET_ENABLED`).
- Les fixtures démo ne touchent pas aux fixtures dev. Deux dossiers, deux groupes Doctrine.
- White-label : zéro hex en dur dans le JSX **doit rester vrai**. Si tu trouves une chaîne en dur, c'est une dette à corriger.
- Pas d'install de dep lourde. Faker est sans doute déjà en dev (sinon `--dev`).
- Le bouton "Reset démo" n'est jamais visible en mode dev normal (vérifier).
- Les avatars users démo : trois couleurs distinctes (vert, bleu, rose) pour les distinguer visuellement en sidebar.

## Auto-vérification

1. `make demo-stop && make demo` depuis un clone neuf → tout boot en <60s, le navigateur s'ouvre sur la home, banner "Mode démo" visible.
2. Login admin avec `admin@demo.fgc / Demo2026!` → dashboard riche (KPI réalistes, sparkline avec courbe, 50 résa + 15 B2B visibles).
3. Click "🔄 Reset démo" (admin) → confirmation → reload → 50 résa + 15 B2B à nouveau (les actions test sont effacées).
4. Dans le Tweaks Panel admin, ouvrir "Personnaliser la marque" → changer "Family Games Center" → "Le Bowling de Tours", couleur primaire → orange. Sans reload, le header public et l'admin reflètent le changement.
5. Refresh → retour à FGC (override session, pas persistant — comportement voulu).
6. `NEXT_PUBLIC_DEMO_MODE=0 npm run dev` (mode dev normal) → banner démo invisible, bouton reset invisible, override branding ignoré.
7. `make test-api` → tous tests verts (les fixtures démo doivent passer le boot sans corrompre les tests).
8. `npm run build` → 0 erreur TS.
9. `docs/DEMO.md`, `docs/WHITE_LABEL.md`, `docs/DEMO_SCRIPT.md`, `docs/DEMO_FAQ.md` rédigés et lisibles.
10. `docs/CHANGELOG.md` : entrée dédiée "mode démo + white-label léger + scénario démo".

## Si bloqué

- Si tailwind-from-branding pose souci (CSS vars + tokens) : V1 = couleurs primaires en CSS variables directement injectées via `<style>` dans `layout.tsx`, Tailwind reste sur ses tokens fixes pour les autres surfaces (texte, bordures). C'est moins propre architectural mais ça marche pour la démo.
- Si Faker pose souci en PHP : alternative = liste statique de 50 prénoms/noms français dans le fixture, picker via modulo.
- Doute structurel : arrête et demande à Kévin.

*Fin PROMPT_CLAUDE_CODE_DEMO_READY.md*
