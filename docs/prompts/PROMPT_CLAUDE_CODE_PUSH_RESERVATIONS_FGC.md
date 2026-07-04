# Émission des réservations FGC → Shiftly (push async)

> À exécuter dans ce repo (`fgc-website-claude`, côté `apps/api`).
> Quand une réservation est créée sur le site FGC, la pousser vers Shiftly de façon asynchrone et résiliente.

## Contexte
Nouvelle archi (répartition FGC/Shiftly) : `apps/api` reste maître de la création web ; Shiftly est le
hub de gestion. Après chaque réservation créée localement, FGC **émet** la donnée vers l'endpoint
d'ingestion Shiftly. Périmètre v1 : **réservations anniversaire** (`DemandeReservation`) seulement.
Respecte le `CLAUDE.md` **de ce repo** et `docs/GOTCHAS.md`.

## Décisions actées (ne pas rediscuter)
1. **Async obligatoire** (Symfony Messenger) : le push ne doit **jamais** faire échouer ni ralentir la
   création d'une réservation web. Shiftly indisponible → la résa web réussit, le message est **rejoué**.
2. **Idempotence** : `sourceRef` = la `reference` de la `DemandeReservation` (Shiftly déduplique dessus).
3. Secrets en `.env.local` (jamais committé) ; `.env.example` committé avec les clés vides.

## Contrat cible (défini par Shiftly — respecter EXACTEMENT)
`POST {SHIFTLY_INGEST_URL}/api/ingest/reservations` · header `X-Shiftly-Ingest-Key: {SHIFTLY_INGEST_KEY}` · body :
```json
{
  "sourceRef": "<DemandeReservation.reference>",
  "source": "fgc-web",
  "type": "anniversaire",
  "dateCreneau": "<eventDate + timeSlot, ISO 8601>",
  "nbPersonnes": <kidsCount>,
  "client": { "nom": "<parentFirstName parentLastName>", "email": "<parentEmail>", "telephone": "<parentPhone>" },
  "formule": "<formuleKey>",
  "montantTotalCents": <unitPriceCentsSnapshot * kidsCount>,
  "statut": "<map depuis DemandeReservationStatus>"
}
```
Réponses attendues : 201 (créée), 200 (déjà ingérée). Toute autre → retry Messenger.

## Fichiers à lire avant de coder
- `CLAUDE.md` + `docs/GOTCHAS.md` (racine du repo) — conventions & pièges
- `apps/api/src/State/BirthdayReservationProcessor.php` — point d'accroche (après persistance)
- `apps/api/src/Entity/DemandeReservation.php` — champs à mapper (+ l'enum de statut)
- `apps/api/config/packages/messenger.yaml` — configurer un transport async (créer si absent)
- `apps/api/composer.json` — vérifier `symfony/messenger` + `symfony/http-client` (installer si absents)

## Tâche
1. **Prérequis** : assure-toi que Messenger a un transport **async** (ex. Doctrine/Redis) et que
   `symfony/http-client` est présent. Configure une **stratégie de retry** (ex. 3 essais, backoff).
2. **Message** `PushReservationToShiftly` portant l'id (ou la `reference`) de la `DemandeReservation`.
3. **Dispatch** depuis `BirthdayReservationProcessor`, **après** le flush local réussi (jamais avant :
   pas de push d'une résa non persistée ; pas dans la même transaction).
4. **Handler** (`#[AsMessageHandler]`) : recharge la `DemandeReservation`, construit le payload du
   contrat ci-dessus, `POST` via `HttpClientInterface` vers `SHIFTLY_INGEST_URL` avec le header clé.
   200/201 → OK ; sinon lève une exception → Messenger retente. Mappe l'enum de statut FGC → `statut`.
5. **Config** : `SHIFTLY_INGEST_URL` + `SHIFTLY_INGEST_KEY` en env (`.env.example` committé, valeurs vides).

## Ce qu'il ne fait PAS
- Pas de B2B ni d'avis (v2).
- Ne modifie pas le flux de création web ni le paiement (juste un dispatch async après coup).
- Aucune lecture depuis Shiftly (unidirectionnel).

## Auto-vérification (obligatoire)

> Tu t'auto-corriges. Pas de livraison tant qu'une case est rouge.

### Après chaque commit
```bash
cd apps/api && php bin/console lint:container && php bin/console doctrine:schema:validate
# si des tests existent :
php bin/phpunit
```

### Tests fonctionnels (Shiftly lancé avec l'endpoint d'ingestion + une clé de démo)
- [ ] Créer une réservation anniversaire sur le site FGC → un message part → la `Reservation`
      apparaît dans le cockpit Shiftly quelques secondes après (worker Messenger consommé).
- [ ] **Shiftly coupé** : la réservation web réussit quand même ; au redémarrage de Shiftly + du worker,
      le message est rejoué et la résa arrive (idempotence : pas de doublon si déjà passée).
- [ ] Rejouer deux fois le même message → une seule `Reservation` côté Shiftly (même `sourceRef`).

### Critères d'acceptation
- [ ] Le push est **async** (Messenger), jamais synchrone dans le processor.
- [ ] La création web ne dépend jamais de la disponibilité de Shiftly.
- [ ] `sourceRef` = `reference` de la `DemandeReservation` (idempotence).
- [ ] Secrets non committés ; `.env.example` à jour.
- [ ] Conventions du `CLAUDE.md` **de ce repo** respectées (DTO, pas de logique mailer/HTTP dans le controller, etc.).

### Auto-relecture du diff
`git diff` en hostile : le dispatch est-il bien **après** le flush ? une erreur HTTP Shiftly peut-elle
casser la création web ? la clé est-elle hors du code (env) ? le mapping de date (eventDate+timeSlot → ISO) est-il correct ?

**Si une case est NON → tu corriges et tu re-vérifies tout.**

## Livraison
1. Commits atomiques, scope `api:` (`feat(api): message + handler push réservation vers Shiftly`, `chore(api): transport messenger async + http-client`).
2. Rapport de vérification (preuve : résa créée sur FGC visible dans Shiftly + test Shiftly-down/retry).
3. Une ligne dans `docs/CHANGELOG.md` (convention du repo).
4. Tu push pas. Kévin push.
