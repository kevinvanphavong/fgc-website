# Soirées hebdomadaires V2 — sync front + back (fixtures + BDD locale)

> Aligne les données des `HebdoCard` côté Symfony sur la V2 décidée. Les changements `formules.ts` (fallback front) sont déjà faits — on synchronise maintenant le back + la BDD locale du gérant.

## Contexte
Le gérant a refondu les Soirées hebdomadaires :
- `bowling-illimite` → renommé `bowling-a-volonte`, libellé "Bowling à volonté", prix 20€, lun/mar 20h30→fermeture, **1 soda offert**, **100 premiers/jour** (plafond ajouté).
- `jeudi-a-gogo` retravaillé : prix passe de 24,90€ à **20€**, horaires **17h → 22h**, **plus de billard** dans l'offre de base, soda offert, 100 premiers.
- `afterwork` : ne tourne plus que **jeudi & vendredi soir** (au lieu de lun→jeu).

Le front (`formules.ts`) est à jour mais sert juste de fallback. Tant que le back Symfony tourne en local, le gérant voit les vieilles données de `ContentFixtures.php` chargées en BDD. Faut sync.

## Fichiers à lire avant de coder
- `apps/api/src/DataFixtures/ContentFixtures.php` — lignes 161-163, c'est là que vivent les HebdoCards en seed.
- `apps/api/src/Entity/HebdoCard.php` — schema, vérifie qu'aucun champ obligatoire ne manque.
- `apps/web/src/lib/formules.ts` — source de vérité V2 pour Bowling à volonté + Jeudi à gogo + Pack Afterwork (déjà à jour).
- `CLAUDE.md` racine — règles projet (notamment règle 15 si tu touches à la BDD).

## Tâche
1. Dans `ContentFixtures.php`, remplace les 3 entrées HebdoCards (`bowling-illimite`, `jeudi-a-gogo`, `afterwork`) par la nouvelle V2, en miroir exact de `HEBDO_CARDS` dans `apps/web/src/lib/formules.ts`. Renommer la clé `bowling-illimite` → `bowling-a-volonte`.
2. **Important** : le gérant a déjà une BDD locale peuplée. Choisis l'approche la moins destructrice :
   - Si une commande type `app:content:sync` existe déjà → la réutiliser/l'étendre.
   - Sinon, créer une **commande Symfony courte** `app:hebdo:sync-v2` (one-shot, dans `apps/api/src/Command/`) qui upsert les 3 cartes à partir du seed. Pattern : findOneBy(key) → si existe, update les champs ; sinon, créer. Flush à la fin.
   - Évite `doctrine:fixtures:load` (purge toute la BDD locale du gérant).
3. Documenter dans le rapport de livraison la commande exacte à lancer côté gérant (ex. `php bin/console app:hebdo:sync-v2`).

## Décisions actées (à NE PAS remettre en cause)
- Bowling à volonté : 20€, lun/mar 20h30→fermeture, soda + chaussures, 100 premiers, sans réservation.
- Jeudi à gogo : 20€, jeu 17h→22h, soda + chaussures, 100 premiers, **plus de billard** (différence vs V1).
- Pack Afterwork : 68€/groupe, **jeudi & vendredi soir uniquement**, mêmes inclus.
- Pas de migration BDD (les champs de `HebdoCard` n'évoluent pas, seules les valeurs changent).

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de livraison tant qu'une case est rouge.

### Après modif
```bash
# Backend
cd apps/api
php bin/console doctrine:schema:validate
php bin/console lint:container
php bin/console app:hebdo:sync-v2   # ou le nom que tu as choisi
# Vérifie le contenu en BDD
php bin/console doctrine:query:sql "SELECT key, title, price FROM hebdo_card ORDER BY position"
```

### Tests fonctionnels
- [ ] L'endpoint `/api/formules/hebdo` renvoie bien 3 cartes avec les nouveaux libellés/prix/clés.
- [ ] La carte `bowling-a-volonte` existe ; `bowling-illimite` n'existe plus.
- [ ] Le front `http://localhost:3001/tarifs-et-formules` (port 3001 chez le gérant) affiche les nouveaux libellés sans rebuild.
- [ ] Aucune fixture autre que HebdoCards n'a été modifiée.

### Critères d'acceptation
- [ ] `ContentFixtures.php` à jour (V2 miroir de `formules.ts`).
- [ ] Commande de sync créée et idempotente (la relancer 2 fois ne crée pas de doublon).
- [ ] BDD locale du gérant mise à jour sans purge.
- [ ] `doctrine:schema:validate` passe vert.

### Auto-relecture du diff
`git diff main..HEAD` — relis en hostile : un seed cassé ailleurs ? une clé renommée qui casserait une FK ? une commande qui purge plus que prévu ?

**Si une case est NON → tu corriges et tu re-vérifies tout.**

## Livraison
1. Commits atomiques :
   - `feat(api): aligne fixtures HebdoCards sur la V2 des soirees hebdo`
   - `feat(api): commande app:hebdo:sync-v2 pour upsert sans purge`
2. Rapport au gérant : commande exacte à lancer en local + résultat attendu du SELECT SQL.
3. Tu push pas. Le gérant push.
