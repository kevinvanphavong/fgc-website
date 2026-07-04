# Workflow GitHub Actions — déploiement automatique sur GitHub Pages

> Automatise le build Next.js export-static + la publication sur `kevinvanphavong.github.io/fgc-website` à chaque push sur `main`.

## Contexte
Le site front (Next.js, `apps/web/`) est aujourd'hui déployé manuellement sur GitHub Pages. `next.config.mjs` est déjà prêt (`output: 'export'`, `basePath: /fgc-website`, `assetPrefix`) si la variable `GITHUB_PAGES=true` est passée au build. Il manque uniquement le workflow CI qui build et publie. L'API Symfony n'est PAS joignable depuis GitHub Pages — c'est volontaire : le front tombe automatiquement sur les fallbacks statiques (`PASS_CARDS`, `HEBDO_CARDS`, etc.).

## Fichiers à lire avant de coder
- `apps/web/next.config.mjs` — confirme que la branche `isGithubPages` est OK (basePath + assetPrefix + output export)
- `apps/web/package.json` — récupère le nom du script de build (`npm run build`) et la version de Node ciblée
- `package.json` racine + `apps/web/package-lock.json` — détecte le package manager (npm vs pnpm) pour cacher la dépendance
- `.gitignore` racine — confirme que `apps/web/out/` est bien ignoré (sinon ajoute-le)

## Tâche
1. Crée **`.github/workflows/deploy-pages.yml`** à partir du squelette ci-dessous (à adapter si pnpm/yarn).
2. Vérifie que `apps/web/out/` est dans `.gitignore`. Sinon, ajoute-le et commit séparé.
3. Build local de validation : `cd apps/web && GITHUB_PAGES=true npm run build` doit produire `apps/web/out/index.html` et `apps/web/out/tarifs-et-formules/index.html`.
4. **Commit unique** : `ci(pages): workflow de deploiement automatique GitHub Pages`
5. **Push autorisé** sur `main` (exception explicite — le gérant l'a demandé).

## Squelette `.github/workflows/deploy-pages.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: apps/web/package-lock.json
      - run: npm ci
      - name: Build Next.js (export static)
        env:
          GITHUB_PAGES: 'true'
        run: npm run build
      - name: Add .nojekyll (Next.js _next folder)
        run: touch out/.nojekyll
      - uses: actions/upload-pages-artifact@v3
        with:
          path: apps/web/out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

## Décisions actées (à NE PAS remettre en cause)
- Actions GitHub officielles (`actions/upload-pages-artifact@v3` + `actions/deploy-pages@v4`), pas `peaceiris/actions-gh-pages`. Plus simple, intégré à Pages mode "GitHub Actions".
- Pas de pipeline `gh-pages` branch — on passe par l'artifact officiel.
- Node 20 LTS (à confirmer au regard du `engines` du `package.json`, sinon adapter).
- `.nojekyll` ajouté en post-build : indispensable, sinon GitHub Pages ignore les dossiers `_next/` et le CSS/JS casse.
- Le front en prod tombe sur les fallbacks statiques de `formules.ts` & co. — c'est volontaire.

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de push tant qu'une case est rouge.

### Build & validation locale
```bash
cd apps/web
GITHUB_PAGES=true npm run build
ls out/tarifs-et-formules/index.html
ls out/_next/ | head
```

### Tests fonctionnels
- [ ] Le build produit bien `apps/web/out/` (dossier statique).
- [ ] `out/tarifs-et-formules/index.html` existe et contient la chaîne "Conditions d'utilisation".
- [ ] `out/_next/` existe (assets compilés).
- [ ] `.gitignore` ignore bien `apps/web/out/` (rien d'untracked en trop après build).
- [ ] Le yaml passe `yamllint` ou au moins n'a pas d'erreur de syntaxe évidente.

### Critères d'acceptation
- [ ] Diff limité à `.github/workflows/deploy-pages.yml` (+ `.gitignore` si modifié).
- [ ] Aucune autre modif silencieuse.
- [ ] Le squelette ci-dessus est respecté (actions officielles, permissions, concurrency, `.nojekyll`).

### Auto-relecture du diff
`git diff main..HEAD` — relis en hostile : version d'action obsolète ? permissions trop larges ? working-directory oublié ? cache-dependency-path correct ?

**Si une case est NON → tu corriges et tu re-vérifies tout.**

## Livraison
1. 1 commit atomique : `ci(pages): workflow de deploiement automatique GitHub Pages`
2. `git push origin main`.
3. **Action humaine requise côté GitHub (à dire au gérant dans le rapport)** :
   - Aller dans `Settings → Pages` du repo `kevinvanphavong/fgc-website`
   - **Source** : choisir **"GitHub Actions"** (et plus "Deploy from a branch")
   - Sans ce réglage, le workflow build mais Pages n'affichera rien.
4. Une fois le réglage fait, le premier déploiement se lance tout seul. URL finale : `https://kevinvanphavong.github.io/fgc-website/tarifs-et-formules`.
5. Rapport : SHA commit + lien du run Actions + rappel du réglage Pages.
