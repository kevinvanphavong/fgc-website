# Push v1.1 — remonter les changements de statut vers Shiftly (FGC)

> À exécuter dans ce repo (`fgc-website-claude`, côté `apps/api`).
> En plus de la création, pousse vers Shiftly **chaque changement de statut** d'une réservation, et envoie le statut BRUT (Shiftly fait le mapping).

## Contexte
Le pont v1 ne pousse qu'à la création (statut toujours `nouveau`). On étend : quand le gérant change
le statut dans l'admin (`nouveau → contacte → confirme | refuse → passe`), ça doit remonter vers
Shiftly pour que le hub reflète l'état réel. Contrat : `docs/prompts/…` côté Shiftly + le mapping est
fait **côté Shiftly** — FGC envoie juste son statut brut. Respecte le `CLAUDE.md` de ce repo + `docs/GOTCHAS.md`.

## Décisions actées (ne pas rediscuter)
1. **FGC envoie le statut BRUT** : le champ `statut` du payload = `DemandeReservationStatus->value`
   (`nouveau`/`contacte`/`confirme`/`refuse`/`passe`). Plus de mapping/traduction côté FGC.
2. **Push aussi sur transition** : après chaque changement de statut réussi (admin), redispatcher le
   message `PushReservationToShiftly` (même `sourceRef` → Shiftly met à jour). Async + best-effort,
   comme à la création : un changement de statut ne doit jamais échouer si Shiftly est indisponible.
3. Périmètre : réservations anniversaire seulement. Rien d'autre ne change.

## Fichiers à lire avant de coder
- `CLAUDE.md` + `docs/GOTCHAS.md`
- `apps/api/src/MessageHandler/PushReservationToShiftlyHandler.php` — **retirer** `mapStatus()`, envoyer `->value`
- `apps/api/src/State/AdminDemandeReservationProcessor.php` — point d'accroche des transitions de statut (PATCH admin)
- `apps/api/src/Enum/DemandeReservationStatus.php` — valeurs
- `apps/api/src/State/BirthdayReservationProcessor.php` — cohérence avec le dispatch existant à la création

## Tâche
1. **Handler** : remplace la logique `mapStatus()` par l'envoi du statut brut
   (`$demande->getStatus()->value`) dans le champ `statut` du payload. Supprime la méthode devenue inutile.
2. **Dispatch sur transition** : dans le processor/handler qui applique le changement de statut admin,
   **après** le flush réussi, dispatcher `PushReservationToShiftly` (même mécanisme async que la création).
3. Vérifie qu'aucune transition (confirme/refuse/passe) ne peut échouer à cause de Shiftly (dispatch async, hors transaction).

## Ce qu'il ne fait PAS
- Ne modifie pas la machine d'état FGC (les transitions autorisées restent celles de l'enum).
- Pas de B2B/avis. Aucun changement du flux de création ni du paiement.

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de livraison tant qu'une case est rouge.

### Après chaque commit
```bash
cd apps/api && php bin/phpunit
```

### Tests fonctionnels (Shiftly v1.1 lancé sur :8000, worker `messenger:consume async -vv`)
- [ ] Créer une résa → arrive dans Shiftly en `EN_ATTENTE_ACOMPTE` (statut brut `nouveau` envoyé).
- [ ] La passer à `confirme` dans l'admin → un message repart → la `Reservation` Shiftly passe à `CONFIRMEE` (même sourceRef, pas de doublon).
- [ ] `refuse` → Shiftly `ANNULEE` · `passe` → `TERMINEE`.
- [ ] Shiftly coupé pendant un changement de statut → la transition admin réussit quand même, le message est rejoué ensuite.

### Critères d'acceptation
- [ ] Le champ `statut` envoyé = valeur brute de l'enum (aucune traduction côté FGC).
- [ ] Push déclenché à la création **et** à chaque transition de statut.
- [ ] Async best-effort : jamais d'échec de transition dû à Shiftly.
- [ ] Conventions du `CLAUDE.md` de ce repo respectées.

### Auto-relecture du diff
`git diff` en hostile : le dispatch est-il bien **après** le flush de la transition ? reste-t-il une
traduction de statut parasite côté FGC ? le même `sourceRef` est-il conservé (pour l'upsert Shiftly) ?

**Si une case est NON → tu corriges et tu re-vérifies tout.**

## Livraison
1. Commits atomiques, scope `api:` (`feat(api): envoi du statut brut`, `feat(api): push sur transition de statut`).
2. Rapport de vérification (création → confirme → refuse remontés dans Shiftly).
3. Ligne dans `docs/CHANGELOG.md`.
4. Tu push pas. Kévin push.
