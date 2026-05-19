# Fixes API Platform pré-tunnel — gotchas #5 et #6

> **À coller dans Claude Code avant de lancer le prompt tunnel anniv.** Effort estimé : 30-60 min.
>
> Lis : `docs/GOTCHAS.md` (entrées #5 et #6), `apps/api/src/Entity/*.php`.

## Contexte

La PR de suivi tests a découvert 2 pièges API Platform 4 qui ont produit au moins une régression silencieuse en prod (`/api/tarif_cards` admin-only au lieu de public, masquée par un fallback front). Avant de coder le tunnel anniv (qui ajoute encore des `#[ApiResource]`), on audite et on corrige.

## Scope strict

### 1. Audit des 13 entités existantes (gotcha #6)

Pour chaque fichier `apps/api/src/Entity/*.php` qui a `#[ApiResource]` :
- Liste les opérations déclarées. Si une entité a **deux `new GetCollection()` sans `name:` distinct et sans `uriTemplate:` distinct**, c'est buggé : la 2ᵉ écrase la 1ʳᵉ.
- Référence connue déjà cassée : `TarifCard.php` (vérifié).
- Référence connue saine : `AnnivCard.php` (la 1ʳᵉ GetCollection a un `uriTemplate: '/formules/anniversaires'`).
- Sortie de l'audit : liste à plat dans le commit message + un check par entité.

### 2. Fix de toutes les entités buggées

Pour chaque cassée, **option lisible préférée** : ajouter un `uriTemplate:` explicite à la GetCollection publique (ex. `/formules/tarifs`, `/formules/hebdo`, `/horaires`, etc. — naming cohérent avec `AnnivCard`).

**Côté front** : mettre à jour `apps/web/src/lib/content-api.ts` pour appeler les nouveaux uriTemplate publics et **retirer les fallbacks codés en dur** qui masquaient la régression. Garder un seul fallback générique (ex. erreur API → message d'erreur, pas données silencieuses).

### 3. Audit gotcha #5 (IRI custom non-mutable)

Pour les entités qui mélangent `Get(uriTemplate: ...)` custom + opérations admin par défaut (`ActivityPageContent` notamment) : vérifier que le **front admin** (hooks React Query générés par `makeEntityHooks<T>`) utilise bien l'URI admin pour PUT/DELETE et pas l'`@id` retourné par le POST. Si un hook utilise `@id` → patcher pour reconstruire `<adminUri>/<id>`.

### 4. Tests de régression

Pour chaque fix de gotcha #6 : ajouter dans le fichier de tests d'entité correspondant un `testGetCollectionPublic()` qui appelle l'URI publique **sans token** et assert 200. Ces tests existent déjà (PR de suivi tests) mais pointaient peut-être sur la mauvaise URI — vérifier et ajuster.

## Auto-vérification

1. `bin/phpunit tests/Api/` → vert (incluant les nouveaux tests publics).
2. `curl http://localhost:8000/api/formules/tarifs` (ou le nouvel URI public) → 200 sans token.
3. `curl http://localhost:8000/api/tarif_cards` → 401 (route admin uniquement, c'est le comportement attendu maintenant que le public a son URI dédié).
4. Navigateur : page `/tarifs-et-formules` charge les vrais tarifs API (pas le fallback hardcodé).
5. Back-office : éditer un `TarifCard` toujours OK, recharger la page publique → la modif apparaît.
6. `docs/CHANGELOG.md` : `fix(api,web): expose les GetCollection publiques sur uriTemplate dédié (gotcha #6) + cleanup fallbacks content-api`.
7. `docs/GOTCHAS.md` : retirer le `**À fixer V2**` de l'entrée #6, remplacer par `**Fixé** : PR fixes API Platform pré-tunnel, 2026-05-XX`.

## Si tu es bloqué

- Si un fix sur uriTemplate casse un test front existant : préfère adapter le test plutôt que de garder une URI cassée. La cohérence des URI publiques compte plus que la rétro-compat des tests internes.
- Doute structurel : arrête et demande à Kévin.

*Fin PROMPT_CLAUDE_CODE_FIXES_API_PLATFORM.md*
