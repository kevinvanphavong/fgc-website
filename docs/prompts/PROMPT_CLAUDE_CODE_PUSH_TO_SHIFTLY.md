# Émission des réservations vers Shiftly (pont FGC → Shiftly) — v1

> Quand une réservation est créée dans `apps/api`, la **pousser** vers Shiftly (hub de gestion) de façon **asynchrone et résiliente** — sans jamais faire échouer la réservation web si Shiftly est indisponible.

## Contexte
Répartition des rôles : FGC gère le web (ce repo), **Shiftly** stocke et gère les réservations pour
l'opérationnel. À chaque réservation anniversaire créée ici, on envoie un POST à l'endpoint
d'ingestion Shiftly. **Périmètre v1 : réservations B2C (anniversaires) uniquement.**

## Contrat de l'endpoint Shiftly (figé — ne pas inventer)
```
POST  {SHIFTLY_INGEST_URL}/api/ingest/reservations
Header: X-Shiftly-Ingest-Key: {SHIFTLY_INGEST_KEY}
Body (JSON):
{
  "sourceRef":   "<DemandeReservation.reference>",
  "eventDate":   "YYYY-MM-DD",
  "timeSlot":    "HH:MM",
  "guestName":   "<parentFirstName parentLastName>",
  "email":       "<parentEmail>",
  "phone":       "<parentPhone>",
  "partySize":   <kidsCount>,
  "formuleLabel":"<libellé de formuleKey>",
  "amountCents": <unitPriceCentsSnapshot * kidsCount>,
  "status":      "<status en minuscule>"
}
```
Réponse attendue : 200/201. Toute autre réponse = à réessayer (retry).

## Décisions actées (ne pas rediscuter)
1. **Async via Messenger** : l'envoi ne bloque pas la création de résa et ne la fait pas échouer.
2. Déclenchement **après** persistance locale réussie, depuis le State Processor existant
   (`BirthdayReservationProcessor`) — dispatch d'un message `PushReservationToShiftly(reservationId)`.
3. Le handler recharge la résa, construit le payload figé ci-dessus, POST via `HttpClientInterface`,
   avec la clé. Échec réseau/HTTP → exception → **retry** Messenger (backoff).
4. **Secrets en env** : `SHIFTLY_INGEST_URL` et `SHIFTLY_INGEST_KEY` dans `.env.local`
   (jamais committé) ; ajoute-les à `.env` avec des valeurs vides + doc.
5. Idempotence garantie côté Shiftly par `sourceRef` → un retry ne crée pas de doublon.

## Fichiers à lire avant de coder
- `apps/api/src/State/BirthdayReservationProcessor.php` — point de branchement
- `apps/api/src/Entity/DemandeReservation.php` — champs source du mapping
- `apps/api/config/packages/messenger.yaml` (créer/compléter si besoin, transport async)
- `apps/api/composer.json` — vérifier `symfony/http-client` (l'ajouter si absent)
- `docs/GOTCHAS.md` — pièges connus du repo

## Tâche
1. Vérifie/active un transport **async** Messenger (`MESSENGER_TRANSPORT_DSN`, ex. Doctrine).
2. Crée le message `PushReservationToShiftly` (porte l'`id` de la `DemandeReservation`) + son handler
   (`#[AsMessageHandler]`) : recharge l'entité, construit le payload figé, POST via `HttpClientInterface`
   avec le header clé. Non-2xx → throw (retry).
3. Dans `BirthdayReservationProcessor`, **après** le persist/flush réussi, `dispatch(new PushReservationToShiftly($id))`.
   Ne bloque pas la réponse web ; aucune exception du pont ne doit remonter à l'utilisateur.
4. Mappe `formuleKey → formuleLabel` via la table de libellés déjà utilisée sur le site (réutilise
   l'existant, ne réinvente pas). `status` en minuscule.
5. Env : `SHIFTLY_INGEST_URL`, `SHIFTLY_INGEST_KEY` (dans `.env` vides + `.env.local` réel).

## Ce qu'il ne fait PAS
- Pas d'émission B2B ni avis en v1.
- Ne modifie pas la logique de création/paiement existante (juste un dispatch en fin de parcours).
- Ne rend pas l'appel synchrone (jamais dans le chemin critique de la résa).

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de livraison tant qu'une case est rouge.

### Après chaque commit
```bash
cd apps/api && php bin/console lint:container && php bin/console doctrine:schema:validate
php bin/console messenger:stats   # le transport async existe
```

### Tests fonctionnels (Shiftly lancé sur SHIFTLY_INGEST_URL, clé valide en .env.local)
- [ ] Créer une réservation anniversaire sur le site → un message est mis en file (`messenger:stats`).
- [ ] `php bin/console messenger:consume async -vv` → POST envoyé, Shiftly répond 200/201, la résa
      apparaît dans le cockpit Shiftly.
- [ ] **Shiftly coupé** : la réservation web réussit quand même ; le message reste en file et est
      **rejoué** avec succès quand Shiftly revient.
- [ ] Rejouer le même message → pas de doublon côté Shiftly (idempotence `sourceRef`).

### Critères d'acceptation
- [ ] L'envoi est async : aucune latence ni échec ajouté au parcours de réservation.
- [ ] `SHIFTLY_INGEST_KEY`/`URL` en env, jamais en dur, `.env.local` non committé.
- [ ] Respect des conventions du repo (`CLAUDE.md`, `GOTCHAS.md`), pas de secret committé.
- [ ] `lint:container` + `schema:validate` passent.

### Auto-relecture du diff
`git diff` en hostile : une exception du pont peut-elle faire échouer la résa web ? la clé est-elle
committée/loggée ? le mapping du montant (× kidsCount) est-il correct ?

## Livraison
1. Commits atomiques (`chore(api): transport messenger async`, `feat(api): push réservation vers Shiftly`).
2. Une ligne dans `docs/CHANGELOG.md`.
3. Rapport de vérification (preuve du consume + résa vue dans Shiftly).
4. Tu push pas. Kévin push.
