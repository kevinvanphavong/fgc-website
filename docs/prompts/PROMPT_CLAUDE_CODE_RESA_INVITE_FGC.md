# Revenir à la réservation anniversaire en mode invité (+ compte optionnel)

> À exécuter dans ce repo (`fgc-website-claude`). On annule le « login obligatoire » avant le tunnel anniversaire : retour à la **réservation invité** (priorité conversion, CLAUDE.md §11), le compte devient **optionnel**.

## Contexte
Un précédent chantier a rendu la réservation anniversaire réservée aux comptes (`ROLE_CLIENT` sur le
POST + redirection `/connexion` avant le tunnel). Décision revue : ça met un péage sur le tunnel
prioritaire n°1 → on revient à l'**invité** (nom + email + coordonnées suffisent), et on **propose**
seulement le compte, sans l'imposer. Respecte le `CLAUDE.md` de ce repo + `docs/GOTCHAS.md`.

## Décisions actées (ne pas rediscuter)
1. `POST /reservations/anniversaire` redevient accessible **sans authentification** (invité). Email obligatoire.
2. **Rattachement au compte optionnel** : si un client est connecté (cookie), la demande est rattachée
   à son compte ; sinon elle reste une demande invité (pas de compte requis).
3. Le tunnel `/reserver-anniversaire` est de nouveau accessible **sans login** (retirer la redirection `/connexion`).
4. Le push vers Shiftly reste inchangé (une résa invité se pousse comme une autre).

## Fichiers à lire avant de coder
- `git log`/`git show` du commit qui a ajouté le gate (`feat(api)…` réservation aux comptes) — pour cibler ce qui doit être défait
- `apps/api/src/Entity/DemandeReservation.php` — retirer `security: is_granted('ROLE_CLIENT')` sur l'opération POST
- `apps/api/src/State/BirthdayReservationProcessor.php` — rattachement compte → **optionnel** (connecté = rattaché, sinon invité)
- `apps/api/tests/…/AnnivReservationTest.php` — remettre le POST anonyme en **201**, retirer/adapter `testRejectsAnonymous`
- `apps/web/src/app/(public)/reserver-anniversaire/page.tsx` — retirer le gate `getCurrentClient()` → redirection `/connexion`

## Tâche
1. **Backend** : retire la restriction `ROLE_CLIENT` sur le POST anniversaire (retour public/invité).
   Le `BirthdayReservationProcessor` rattache la demande au compte **si** le contexte est authentifié,
   sinon la crée en invité (email obligatoire, aucune erreur si pas de compte).
2. **Front** : retire la redirection vers `/connexion` ; le tunnel est accessible directement. Ne garde
   aucune dépendance à un compte pour démarrer/soumettre une réservation.
3. **Tests** : POST anonyme → 201 (invité) ; POST connecté → 201 rattaché au compte. Supprime le test qui exigeait l'auth.
4. *(Optionnel, seulement si trivial)* : après soumission réussie, afficher un CTA « Créer un compte pour suivre ma réservation » — sans jamais bloquer. Sinon, laisse pour plus tard.

## Ce qu'il ne fait PAS
- Ne supprime pas le système de comptes clients (il reste, juste plus obligatoire ici).
- Ne touche pas au push Shiftly ni au paiement.

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de livraison tant qu'une case est rouge.

### Après chaque commit
```bash
cd apps/api && php bin/phpunit
cd ../web && npm run build
```

### Tests fonctionnels
- [ ] `POST /reservations/anniversaire` **sans** cookie → 201 (demande invité créée, email requis).
- [ ] Même POST **avec** cookie client → 201, demande rattachée au compte.
- [ ] `GET /reserver-anniversaire` **sans** cookie → 200 (page accessible, plus de redirection `/connexion`).
- [ ] La demande invité est bien poussée vers Shiftly (worker) comme avant.

### Critères d'acceptation
- [ ] Plus aucune exigence `ROLE_CLIENT` pour réserver un anniversaire.
- [ ] Rattachement compte strictement optionnel (connecté = bonus, jamais bloquant).
- [ ] Suite de tests verte, build web OK.
- [ ] Conventions du `CLAUDE.md` de ce repo respectées.

### Auto-relecture du diff
`git diff` en hostile : reste-t-il un `ROLE_CLIENT` ou une redirection `/connexion` sur le chemin
anniversaire ? le processor plante-t-il si pas de compte ? l'email est-il toujours obligatoire (invité) ?

**Si une case est NON → tu corriges et tu re-vérifies tout.**

## Livraison
1. Commits atomiques, scope pertinent (`fix(api): réservation anniversaire de nouveau en invité`, `fix(web): retire le gate login du tunnel anniv`).
2. Rapport de vérification (201 anonyme + 201 connecté + page accessible sans cookie).
3. Ligne dans `docs/CHANGELOG.md`.
4. Tu push pas. Kévin push.
