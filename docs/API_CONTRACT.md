# API_CONTRACT.md — Contrat REST entre `apps/web` et `apps/api`

> Référence partagée frontend ↔ backend. Toute modification d'endpoint doit passer par une PR qui met à jour ce fichier **avant** d'implémenter.

---

## Conventions

- **Base URL** : `${NEXT_PUBLIC_API_BASE_URL}` côté front (`http://127.0.0.1:8000/api` en dev, `https://api.familygamescenter.fr/api` en prod).
- **Format** : `application/json` en entrée et sortie. API Platform peut aussi servir `application/ld+json` — le front l'accepte mais utilise `json` simple.
- **Auth** : `Authorization: Bearer <JWT>` pour les endpoints protégés. JWT obtenu via `POST /auth/login`, durée de vie 1 h, refresh non implémenté en v1 (login redemandé).
- **Erreurs** : format API Platform Problem Details
  ```json
  {
    "type": "https://tools.ietf.org/html/rfc2616#section-10",
    "title": "An error occurred",
    "status": 400,
    "detail": "Le champ email est invalide",
    "violations": [
      { "propertyPath": "email", "message": "Cette valeur n'est pas une adresse email valide." }
    ]
  }
  ```
- **Rate limit** : 5 req/min/IP sur les endpoints publics POST (anti-spam). 429 si dépassé.
- **CORS** : whitelist regex côté Symfony (cf. `apps/api/.env.example`).

---

## Endpoints

### Santé

#### `GET /health` — public

Sonde de vie, utile pour CI / monitoring.

**Réponse 200**
```json
{ "status": "ok", "version": "0.1.0" }
```

---

### Contact

#### `POST /contact` — public

Formulaire de contact général (page `/contact`).

**Payload**
```json
{
  "nom": "Jean Dupont",
  "email": "jean@example.com",
  "telephone": "+33612345678",
  "sujet": "Question sur les anniversaires",
  "message": "Bonjour, je souhaiterais...",
  "consentRgpd": true
}
```

**Validation côté API** (Assert) :
- `nom` : `NotBlank`, `Length(min=2, max=100)`
- `email` : `NotBlank`, `Email`
- `telephone` : optionnel, regex E.164 ou national FR (`/^(\+33|0)[1-9](\s?\d{2}){4}$/`)
- `sujet` : `NotBlank`, `Length(max=200)`
- `message` : `NotBlank`, `Length(min=10, max=5000)`
- `consentRgpd` : `IsTrue`

**Réponse 201**
```json
{ "id": "uuid", "received": true }
```
Effet de bord : email transactionnel envoyé à `MAILER_FROM` avec template `templates/emails/contact.html.twig`.

**Erreurs** : 400 (payload mal formé), 422 (validation), 429 (rate limit).

---

### Contact (PR9 finitions)

#### `POST /api/contact` — public

Création d'un message contact via le formulaire `/contact`. **Rate limit** : 3/min/IP.

**Payload** (`application/ld+json` ou `application/json`)
```json
{
  "name": "Marie Martin",
  "email": "marie@example.fr",
  "phone": "06 12 34 56 78",
  "subject": "tarifs",
  "message": "Bonjour, question sur les tarifs groupes…",
  "acceptRgpd": true
}
```

**Validation** (DTO `ContactMessageInput`) :
- `name` : `NotBlank`, `Length(1..120)`
- `email` : `NotBlank`, `Email`, `Length(max=180)`
- `phone` : optionnel, regex téléphone FR
- `subject` : `Choice({anniv, b2b, tarifs, partenariat, autre})`
- `message` : `NotBlank`, `Length(10..2000)`
- `acceptRgpd` : `IsTrue`

**Réponse 201** : `{ "@id": "...", "id": …, "reference": "FGC-CT-XXXXXX", "createdAt": "…" }`.
**Codes erreur** : `422` (validation), `429` (rate limit).

### Contact — endpoints admin (PR9 finitions)

Tous protégés `ROLE_STAFF`.

#### `GET /admin/contact-messages` — admin

Listing JSON-LD paginé (25/page), tri `createdAt DESC`. Filtres : `status` (exact), `subject` (exact), `name` (partial), `email` (partial), `createdAt[after|before]`, `order[createdAt|status]`.

#### `GET /admin/contact-messages/{id}` — admin

Détail message (groupe `contact:admin:read`).

#### `PATCH /admin/contact-messages/{id}` — admin

Content-Type **obligatoire** : `application/merge-patch+json`. Édite uniquement `status` (machine d'état : `nouveau ↔ traite ↔ archive`, circulaire) + `adminNote`. Transition interdite → `422`.

#### Cycle de vie (PR9 finitions)

```
nouveau ↔ traite ↔ archive
```

Circulaire pour permettre de rouvrir une archive ou retomber à `nouveau` si on a marqué traité par erreur. Centralisé dans `App\Enum\ContactMessageStatus::canTransitionTo()`.

---

### Devis B2B (PR6)

#### `POST /entreprises/devis` — public

Demande de devis entreprise (page `/entreprises`). Crée une `B2BRequest` au stage `nouveau`, envoie 2 mails best-effort (admin + accusé client). **Rate limit** : 3/min/IP.

**Payload** (`application/ld+json` ou `application/json`)
```json
{
  "type": "team_building",
  "companyName": "ACME Corp",
  "contactFirstName": "Marie",
  "contactLastName": "Martin",
  "contactEmail": "marie@acme.fr",
  "contactPhone": "06 12 34 56 78",
  "eventDate": "2026-09-15",
  "expectedAttendees": 25,
  "message": "Journée team building : bowling + karaoké.",
  "acceptRgpd": true
}
```

**Validation** (DTO `B2BDevisRequestInput`) :
- `type` : `Choice({seminaire, team_building, soiree, arbre_noel, autre})`
- `companyName` : `NotBlank`, `Length(1..120)`
- `contactFirstName` / `contactLastName` : `NotBlank`, `Length(1..80)`
- `contactEmail` : `NotBlank`, `Email`, `Length(max=180)`
- `contactPhone` : `NotBlank`, regex téléphone FR (`+33` ou `0` + indicatif 1-9 + 8 chiffres avec espaces/tirets tolérés)
- `eventDate` : optionnel, `YYYY-MM-DD`, si renseigné ≥ today+14j
- `expectedAttendees` : `NotNull`, `Range(min=10, max=300)`
- `message` : optionnel, `Length(max=2000)`
- `acceptRgpd` : `IsTrue` ("Le consentement RGPD est requis.")

**Réponse 201** (groupes `b2b:read`)
```json
{
  "@context": "/api/contexts/B2BRequest",
  "@id": "/api/admin/b2b-requests/7",
  "@type": "B2BRequest",
  "id": 7,
  "reference": "FGC-B2B-AB1234",
  "stage": "nouveau",
  "type": "team_building",
  "createdAt": "2026-05-19T10:23:00+00:00"
}
```

**Codes d'erreur** : `422` (validation), `429` (rate limit dépassé).

#### Cycle de vie côté admin (PR6)

```
nouveau       → qualifie | perdu
qualifie      → devis_envoye | perdu
devis_envoye  → negociation | gagne | perdu
negociation   → gagne | perdu
gagne, perdu  → (terminaux)
```

Centralisé dans `App\Enum\B2BStage::allowedNextStates()`. Le serveur reste la source de vérité (PATCH renvoie `422` si transition interdite).

---

### Demandes B2B — endpoints admin (PR6)

Tous protégés par `is_granted('ROLE_STAFF')`. Renvoient `401` sans JWT, `403` si rôle insuffisant.

#### `GET /admin/b2b-requests` — admin

Listing paginé (25/page par défaut), trié `createdAt DESC`.

**Query params** :
- `stage[]` : filtre par stage (multi). Ex. `?stage[]=nouveau&stage[]=qualifie`.
- `type` : filtre par type (exact).
- `companyName` : recherche partielle.
- `reference` : recherche partielle.
- `contactLastName` / `contactEmail` : recherche partielle.
- `createdAt[after]` / `createdAt[before]` : `YYYY-MM-DD` (DateFilter).
- `eventDate[after]` / `eventDate[before]` : idem.
- `order[createdAt]` / `order[eventDate]` / `order[stage]` / `order[estimatedValueCents]` : `asc|desc`.
- `page`, `itemsPerPage`.

**Réponse 200** : collection JSON-LD standard API Platform, items typés `B2BRequest` avec groupe `b2b:admin:read` (tous les champs incluant les stamps `internal*At`).

#### `GET /admin/b2b-requests/{id}` — admin

`requirements: ['id' => '\d+']` (laisse passer `/stats`).

**Réponse 200** : entité complète. **404** si id inconnu.

#### `PATCH /admin/b2b-requests/{id}` — admin

**Content-Type obligatoire** : `application/merge-patch+json` (API Platform 4 le requiert pour PATCH ; `ld+json` est rejeté).

**Payload** (groupe `b2b:admin:write` — uniquement ces 3 champs) :
```json
{
  "stage": "qualifie",
  "adminNote": "Appel passé, devis à envoyer cette semaine.",
  "estimatedValueCents": 168000
}
```

**Comportement** :
- Validation transition côté serveur (`AdminB2BRequestProcessor`). Si interdite → `422` avec message `"Transition X → Y non autorisée. Transitions valides depuis X : a, b."`
- Si transition valide, stamp posé automatiquement :
  - `qualifie` → `internalQualifiedAt`
  - `devis_envoye` → `internalQuotedAt`
  - `negociation` → `internalNegotiatedAt`
  - `gagne` ou `perdu` → `internalClosedAt`
- PATCH `adminNote` et/ou `estimatedValueCents` sans `stage` = 200 sans changement de stage.

**Réponse 200** : entité re-sérialisée avec groupe `b2b:admin:read`.

#### `GET /admin/b2b-requests/stats` — admin

```json
{
  "byStage": { "nouveau": 1, "qualifie": 2, "devis_envoye": 1, "negociation": 1, "gagne": 1, "perdu": 1 },
  "openCount": 5,
  "openValueCents": 811000,
  "wonValueCentsThisQuarter": 420000,
  "conversionRate": 0.5,
  "avgResponseTimeMinutes": 4320
}
```

- `openCount` / `openValueCents` : agrégat sur les stages ouverts (`nouveau`, `qualifie`, `devis_envoye`, `negociation`).
- `wonValueCentsThisQuarter` : somme `estimatedValueCents` des `gagne` dont `internalClosedAt` ≥ début du trimestre courant.
- `conversionRate` : `gagne / (gagne + perdu)`, arrondi 4 décimales. `0.0` si aucun closed.
- `avgResponseTimeMinutes` : moyenne `createdAt → internalQualifiedAt` (en minutes, arrondi entier) sur les demandes qualifiées. `null` si aucune.

Consommé par les 4 KPI cards de `/admin/b2b` et la tuile "Pipeline B2B" du dashboard.

---

### Réservation anniversaire (tunnel)

> **V1 sans Stripe** (CLAUDE.md §11 — décision tranchée 2026-05-15). Le tunnel
> envoie une **demande de réservation** ; le gérant rappelle sous 24h pour
> valider la date et organiser l'acompte de 50€ (sur place ou par virement).
> Stripe sera ajouté en V2 si le retour gérant le justifie.

#### `POST /reservations/anniversaire` — public

Crée une demande de réservation (status `nouveau`), envoie un mail au gérant
+ un accusé de réception au parent. Pas de paiement en ligne.

**Rate limit** : 5 req/min/IP (`429 Too Many Requests` au-delà).

**Payload**
```json
{
  "formuleKey": "superbowler",
  "eventDate": "2026-07-12",
  "timeSlot": "14:00",
  "childName": "Léo",
  "childAge": 8,
  "kidsCount": 10,
  "cakeNote": "Thème Pokémon",
  "allergies": "Allergie cacahuète",
  "parentFirstName": "Sophie",
  "parentLastName": "Martin",
  "parentEmail": "sophie@example.fr",
  "parentPhone": "0612345678",
  "source": "instagram",
  "message": "Surprise à organiser, accessibilité OK.",
  "acceptCGV": true,
  "acceptNewsletter": false,
  "upsellVR": false
}
```

**Validation côté DTO `BirthdayReservationInput`** :
- `formuleKey` : `Choice({newbowler, superbowler, probowler})`, `NotBlank`.
- `eventDate` : `YYYY-MM-DD`, ≥ J+7 (callback Assert sur le DTO).
- `timeSlot` : `Choice({10:00, 14:00, 14:30, 16:00, 16:30, 17:00})`, `NotBlank`.
- `childName` : `NotBlank`, `Length(min=1, max=80)`.
- `childAge` : `Range(min=4, max=14)`.
- `kidsCount` : `Range(min=1, max=25)` + check serveur `≥ formule.minKids` (Processor).
- `cakeNote` / `allergies` : `Length(max=300)`, nullable.
- `parentFirstName`, `parentLastName` : `NotBlank`, `Length(min=1, max=80)`.
- `parentEmail` : `Email`, `Length(max=180)`.
- `parentPhone` : Regex mobile FR (06/07, espaces tolérés).
- `source` : `Choice([null, '', amis, instagram, facebook, google, passage, autre])`.
- `message` : `Length(max=1000)`.
- `acceptCGV` : `IsTrue` (sinon 422).
- `acceptNewsletter`, `upsellVR` : `bool`, optionnels.

**Réponse 201** (groupe `anniv:read`)
```json
{
  "@context": "/api/contexts/DemandeReservation",
  "@id": "/api/demande_reservations/42",
  "@type": "DemandeReservation",
  "id": 42,
  "reference": "FGC-Q45VTF",
  "status": "nouveau",
  "formuleKey": "superbowler",
  "eventDate": "2026-07-12T00:00:00+00:00",
  "timeSlot": "14:00",
  "createdAt": "2026-05-18T20:17:46+00:00"
}
```

**Codes d'erreur** :
- `422 Unprocessable Entity` — payload invalide (violations Assert\\*).
- `409 Conflict` — créneau `(eventDate, timeSlot)` déjà pris par une demande
  en status `{nouveau, contacte, confirme}`. Le client doit refaire un POST
  sur un autre créneau.
- `429 Too Many Requests` — rate limit IP.
- `500` — uniquement sur incident serveur ; le mail peut échouer
  indépendamment, la résa reste créée (best-effort logging).

**Effets de bord** :
- Mail HTML au gérant (`RESERVATIONS_NOTIFY_TO`, défaut `MAILER_FROM_ADDRESS`)
  avec récap complet.
- Mail HTML au parent (récap + référence + FAQ courte).
- Référence générée serveur, alphabet 31 chars sans confusion I/O/0/1
  (`FGC-XXXXXX`).

#### `GET /reservations/anniversaire/availability?date=YYYY-MM-DD` — public

Renvoie l'état des 6 créneaux du jour donné.

**Rate limit** : 30 req/min/IP (le calendrier déclenche un fetch par sélection
de date).

**Paramètres query** :
- `date` : ISO `YYYY-MM-DD`, requis.

**Réponse 200**
```json
{
  "date": "2026-07-12",
  "minDate": "2026-05-25",
  "dateTooSoon": false,
  "slots": [
    { "value": "10:00", "label": "10h00 – 12h00", "period": "Matin",       "available": true  },
    { "value": "14:00", "label": "14h00 – 16h00", "period": "Après-midi",  "available": false },
    { "value": "14:30", "label": "14h30 – 16h30", "period": "Après-midi",  "available": true  },
    { "value": "16:00", "label": "16h00 – 18h00", "period": "Après-midi",  "available": true  },
    { "value": "16:30", "label": "16h30 – 18h30", "period": "Goûter",      "available": true  },
    { "value": "17:00", "label": "17h00 – 19h00", "period": "Goûter",      "available": true  }
  ]
}
```

- `dateTooSoon: true` → date < J+7 ; tous les slots sont `available: false`.
- Sinon, un slot est `available: false` si une `DemandeReservation` en status
  `{nouveau, contacte, confirme}` occupe déjà ce `(date, timeSlot)`.

**Codes d'erreur** : `400` si paramètre `date` absent / mal formé, `429` si
rate limit.

#### Cycle de vie côté admin (PR5)

Machine d'état stockée côté serveur (`App\Enum\DemandeReservationStatus`) :

```
nouveau    → contacte | refuse
contacte   → confirme | refuse
confirme   → passe    | refuse
refuse     → (terminal)
passe      → (terminal)
```

Toute transition non listée renvoie un `422` avec violation `status`.

---

### Réservation anniversaire — endpoints admin (PR5)

> Tous protégés par `is_granted('ROLE_STAFF')`. Le front passe par le proxy
> Next `/api/admin/proxy/admin/demandes-reservation/*` qui injecte le cookie
> httpOnly en `Authorization: Bearer`.

#### `GET /admin/demandes-reservation` — admin

Liste paginée des demandes, triée par défaut `createdAt DESC`.

**Query params** (tous optionnels) :
- `status[]=nouveau,contacte,…` — filtre multi-valeur (SearchFilter exact).
- `reference` / `parentLastName` / `parentFirstName` / `parentEmail` / `childName` — recherche partielle (SearchFilter partial).
- `formuleKey` — exact (`newbowler|superbowler|probowler`).
- `createdAt[after]=YYYY-MM-DD` / `createdAt[before]=YYYY-MM-DD` — fenêtre temporelle.
- `eventDate[after]=…` / `eventDate[before]=…`.
- `order[createdAt]=asc|desc` / `order[eventDate]=…` / `order[status]=…`.
- `page=1`, `itemsPerPage=25` (défaut 25).

**Réponse 200** : `Collection` JSON-LD avec `member`, `totalItems`, `view` (pagination).

#### `GET /admin/demandes-reservation/{id}` — admin

`requirements: ['id' => '\\d+']` — `/stats` est servi par un controller distinct
(cf. ci-dessous). Sans cette restriction, `{id}` capturerait l'URI `stats`
et renverrait 404.

**Réponse 200** : objet complet avec groupes `demande:admin:read` —
inclut adminNote + 4 stamps (`internalContactedAt`, `internalConfirmedAt`,
`internalRefusedAt`, `internalPassedAt`).

#### `PATCH /admin/demandes-reservation/{id}` — admin

Mutation partielle. **Content-Type :** `application/merge-patch+json`
(`application/ld+json` ne marche pas pour PATCH côté API Platform).

**Payload accepté** (groupe `demande:admin:write`) :
```json
{ "status": "contacte", "adminNote": "Appel passé, OK pour la date." }
```

Seuls `status` et `adminNote` sont denormalisés. Tout autre champ envoyé est
silencieusement ignoré (RGPD/traçabilité : pas de modif des champs client).

**Effets de bord** : si `status` change, le timestamp correspondant est
posé automatiquement (`internalContactedAt`, …) par le Processor admin.

**Codes** :
- `200` — transition valide.
- `422` — transition interdite par la machine d'état (avec violation lisible).
- `401` — pas de token.

#### `GET /admin/demandes-reservation/stats` — admin

KPI sidebar/dashboard. Pas dans `#[ApiResource]` (custom controller).

**Réponse 200**
```json
{
  "byStatus": { "nouveau": 3, "contacte": 1, "confirme": 0, "refuse": 0, "passe": 0 },
  "newToday": 2,
  "total": 4
}
```

Utilisé par :
- Badge sidebar « Réservations » côté Next (polling 60s + refetch on focus).
- KPI dashboard `reservationsToday.value` (Symfony tire `newToday` du repo).

---

### Authentification

#### `POST /auth/register` — public

Crée un compte client (page `/inscription`).

**Payload**
```json
{
  "prenom": "Camille",
  "nom": "Bernard",
  "email": "camille@example.com",
  "telephone": "+33611223344",
  "password": "MotDePasse2026!",
  "dateNaissance": "1990-05-12",
  "consentMarketing": false,
  "consentRgpd": true
}
```

**Validation** :
- Email unique en DB (`UniqueEntity`)
- Password : `Length(min=10)`, doit contenir 1 maj + 1 chiffre + 1 spécial (Assert custom)
- `dateNaissance` : `LessThan('today - 16 years')` (mineur > 16 ans pour autonomie)

**Réponse 201**
```json
{ "id": "uuid", "email": "camille@example.com" }
```
Effet : email de confirmation envoyé avec lien de validation `/auth/verify/{token}`.

#### `POST /auth/login` — public

Génère un JWT.

**Payload**
```json
{ "email": "camille@example.com", "password": "MotDePasse2026!" }
```

**Réponse 200**
```json
{
  "token": "eyJ0eXAiOi...",
  "expiresAt": "2026-05-14T18:42:00+02:00",
  "user": {
    "id": "uuid",
    "prenom": "Camille",
    "nom": "Bernard",
    "email": "camille@example.com"
  }
}
```

**Erreurs** : 401 (mauvais identifiants), 403 (compte non vérifié).

#### `GET /me` — JWT requis

Profil du user courant.

**Réponse 200**
```json
{
  "id": "uuid",
  "prenom": "Camille",
  "nom": "Bernard",
  "email": "camille@example.com",
  "telephone": "+33611223344",
  "consentMarketing": false,
  "createdAt": "2026-05-01T10:00:00+02:00"
}
```

#### `PATCH /me` — JWT requis

Mise à jour partielle. Champs autorisés : `prenom`, `nom`, `telephone`, `consentMarketing`. Pour changer email/password → endpoints dédiés (à spec plus tard).

**Réponse 200** : profil mis à jour (même schéma que `GET /me`).

#### `GET /me/reservations` — JWT requis

Liste paginée des résa de l'utilisateur courant. API Platform conventions (`?page=1&itemsPerPage=10`).

**Réponse 200**
```json
{
  "hydra:member": [
    {
      "id": "uuid",
      "formule": "GOLD",
      "date": "2026-07-12",
      "creneau": "14:00",
      "status": "CONFIRMED",
      "prixTotalCents": 24500,
      "createdAt": "2026-05-14T11:00:00+02:00"
    }
  ],
  "hydra:totalItems": 1
}
```

---

## Tableau récapitulatif

| Méthode | Path                                              | Auth      | Effet de bord                          |
| ------- | ------------------------------------------------- | --------- | -------------------------------------- |
| GET     | `/health`                                         | public    | —                                      |
| POST    | `/contact`                                        | public    | Mail à FGC                             |
| POST    | `/entreprises/devis`                              | public    | Mail à FGC                             |
| POST    | `/reservations/anniversaire`                      | public    | Crée résa + intention paiement Stripe  |
| POST    | `/reservations/anniversaire/{id}/confirm`         | Stripe sig| Marque résa CONFIRMED + mail confirma  |
| POST    | `/auth/register`                                  | public    | Crée user + mail validation            |
| POST    | `/auth/login`                                     | public    | Émet JWT                               |
| GET     | `/me`                                             | JWT       | —                                      |
| PATCH   | `/me`                                             | JWT       | Update user                            |
| GET     | `/me/reservations`                                | JWT       | —                                      |

---

---

### Clients (agrégat lecture seule, PR7)

Tous protégés `ROLE_STAFF`. Pas d'entité Client en BDD : agrégat applicatif de `DemandeReservation` + `B2BRequest` par email.

#### `GET /admin/clients`

**Query params** : `search` (email/nom/téléphone, partial), `tag` (`fidele|vip|b2b`), `from` / `to` (`YYYY-MM-DD` sur `lastSeenAt`), `page` (défaut 1, perPage fixe 25).

**Réponse 200** :
```json
{
  "items": [
    {
      "email": "f.mercier@atos.fr",
      "displayName": "Florence Mercier",
      "phone": "06 12 12 12 12",
      "firstSeenAt": "2026-05-15T10:00:00+00:00",
      "lastSeenAt": "2026-05-19T14:00:00+00:00",
      "totalReservations": 1,
      "totalAnniv": 0,
      "totalB2B": 1,
      "sources": ["b2b"],
      "tags": ["b2b"]
    }
  ],
  "total": 10,
  "page": 1,
  "perPage": 25
}
```

Tags calculés à la volée :
- `fidele` : `totalReservations >= 5`
- `vip` : `totalAnniv >= 3`
- `b2b` : `totalB2B >= 1`

#### `GET /admin/clients/{email}` (URL-encodé)

Détail client = agrégat + `history` (50 dernières interactions mélangées anniv/B2B, triées `createdAt DESC`).

**Réponse 200** : agrégat + `history: [{ kind, id, reference, status, eventDate, value, createdAt, summary }]`. **404** si email inconnu.

#### `GET /admin/clients/stats`

```json
{ "total": 10, "fideles": 0, "vip": 0, "newRecent": 3 }
```

`newRecent` = clients dont `firstSeenAt` ≥ today−30j.

---

### Médias (PR7)

Tous protégés `ROLE_STAFF`. Stockage disque local V1 (`public/uploads/medias/{yyyy}/{mm}/...`).

#### `POST /admin/medias` (multipart/form-data)

**Form fields** :
- `file` : fichier image (JPG/PNG/WebP/GIF/AVIF), 5 Mo max, dimensions max 4000×4000.
- `tag` : `hebdo|anniversaires|evenement|bar|salle|global`.

**Réponse 201** : `{ id, filename, originalName, url, mimeType, sizeBytes, width, height, tag, createdAt }`. `url` est servable directement (ex. `/uploads/medias/2026/05/foo-abc123.png`).

**Codes erreur** : `400` (mime invalide ou taille dépassée ou champ manquant), `422` (tag invalide).

#### `GET /admin/medias`

Listing JSON-LD standard. Filtre `?tag=` (exact). Pagination 24/page. Tri `createdAt DESC`.

#### `PATCH /admin/medias/{id}` (`merge-patch+json`)

Édite uniquement `tag`. Renommer = upload différent (V2 si besoin).

#### `DELETE /admin/medias/{id}`

Supprime BDD + fichier disque (via `MediaDeleteListener#postRemove`).

---

### Users & rôles (PR7)

Tous protégés `ROLE_ADMIN` (sauf `/auth/reset-password` qui est public).

#### `GET /admin/users`

**Réponse 200** : `{ items: [{ id, email, firstName, lastName, fullName, roles, role, avatarColor, enabled, lastLoginAt, createdAt }] }`. Tri `createdAt DESC`.

#### `POST /admin/users/invite`

**Payload** : `{ email, firstName?, lastName?, role }` (role ∈ `ROLE_STAFF|ROLE_MANAGER|ROLE_ADMIN`).

Crée l'user `enabled=false` + token reset 24h + envoie mail invitation (best-effort, log si KO). Le password initial est aléatoire et inutilisable.

**Réponse 201** : entité user serialisée. **422** (email/rôle invalide), **409** (email déjà pris).

#### `GET /admin/users/{id}`

Détail user. **404** si inconnu.

#### `PATCH /admin/users/{id}` (`application/json`)

**Payload** : `{ firstName?, lastName?, role?, enabled? }`. Pas de `password` (jamais via PATCH).

Refuse en `422` :
- Désactivation de soi-même (`enabled=false` sur `getUser().id`).
- Auto-déclassement de `ROLE_ADMIN`.

#### `DELETE /admin/users/{id}`

**Toujours 403** : suppression hard interdite (doctrine). Utilisez `PATCH { enabled: false }`.

#### `POST /auth/reset-password` (public)

**Payload** : `{ token, newPassword }` (token = reset_token de l'invitation ou récupération V2, newPassword ≥ 8 chars).

**Réponse 200** : `{ ok: true }`. Met à jour le hash, invalide le token, active le compte (`enabled=true`).

**Codes erreur** : `400` (token invalide/expiré), `422` (payload invalide).

#### Sécurité — login bloqué si désactivé

Le firewall `api_login` plugue `App\Security\AppUserChecker` qui rejette les comptes `enabled=false` avant la génération du JWT (login renvoie `401`). Aucune fenêtre de JWT exploitable pour un user désactivé.

---

### Espace client (PR11 + PR14)

> Auth + profil + reservations agrégées d'un compte `ROLE_CLIENT`. JWT en cookie httpOnly `client_token` (7j, posé/effacé par les route handlers Next.js `/api/client/*`). Le backend Symfony émet le JWT via le firewall `json_login` existant — c'est le Next côté front qui décide quel cookie poser (admin vs client) selon le rôle dominant retourné.

#### `POST /api/auth/register` — public

Crée un compte client (`ROLE_CLIENT`, `enabled=true`). Rate-limit **5/h/IP** (`auth_register`).

**Payload** :
```json
{
  "email": "sophie@exemple.fr",
  "password": "MotDePasse123",
  "firstName": "Sophie",
  "lastName": "Martin",
  "phone": "06 12 34 56 78",
  "acceptRgpd": true,
  "acceptNewsletter": false
}
```

**Règles password** : 10 caractères minimum, au moins une majuscule, au moins un chiffre. **`acceptRgpd: true` requis**. Phone optionnel mais regex FR si fourni.

**Réponse 201** :
```json
{
  "token": "eyJ0eXAi...",
  "user": {
    "id": 42, "email": "sophie@exemple.fr",
    "firstName": "Sophie", "lastName": "Martin", "fullName": "Sophie Martin",
    "phone": "06 12 34 56 78", "acceptNewsletter": false,
    "createdAt": "2026-05-19T12:00:00+00:00",
    "roles": ["ROLE_CLIENT", "ROLE_USER"]
  }
}
```

**Codes erreur** : `422` (validation, dont email déjà pris, RGPD non coché, password trop faible), `429` (rate limit).

#### `POST /api/auth/forgot-password` — public

Génère un token de réinitialisation 1h, envoie un mail si l'email existe & `enabled=true`. **Toujours 204** (no leak d'existence de compte). Rate-limit **3/h/IP** (`auth_forgot_password`).

**Payload** : `{ "email": "sophie@exemple.fr" }`

Le reset effectif passe par `POST /api/auth/reset-password` (endpoint PR7, partagé avec les invitations admin — réactive le compte si désactivé).

#### `POST /api/auth/login` — public (mutualisé admin + client)

Endpoint Symfony unique. Renvoie `{ token, user }`. La distinction admin/client se fait côté Next.js (`/api/admin/login` vérifie `ROLE_STAFF`, `/api/client/login` vérifie `ROLE_CLIENT`) avant de poser le cookie correspondant. Un user peut être logué admin ET client simultanément dans deux onglets.

#### `GET /api/me` — ROLE_CLIENT

Renvoie le profil du user connecté (mêmes champs que `user` du `register`).

**Codes erreur** : `401` si pas de JWT, `403` si JWT staff (n'a pas `ROLE_CLIENT`).

#### `PATCH /api/me` — ROLE_CLIENT, `application/merge-patch+json`

Édite **firstName, lastName, phone, acceptNewsletter** uniquement. `email` non éditable en V1. `password` via endpoint dédié.

**Payload** : `{ "firstName": "Léa", "phone": null }` (n'importe quel sous-ensemble).

**Réponse 200** : profil mis à jour.
**Codes erreur** : `415` (mauvais Content-Type), `422` (validation, ex. téléphone non FR).

#### `POST /api/me/change-password` — ROLE_CLIENT

**Payload** : `{ "currentPassword": "...", "newPassword": "..." }`.
Réponse `{ ok: true }`.
**Codes erreur** : `422` si current incorrect OU si new ne passe pas les règles (10+1maj+1chiffre).

#### `DELETE /api/me` — ROLE_CLIENT

**Anonymisation** (pas de hard delete) : email → `deleted-{id}@deleted.fgc`, firstName/lastName/phone effacés, `enabled=false`. Les réservations rattachées **gardent l'email d'origine** côté `parentEmail`/`contactEmail` pour traçabilité métier (intérêt légitime de conservation comptable, choix Mr Vong).

#### `GET /api/me/reservations?page=N` — ROLE_CLIENT

Agrège `DemandeReservation` + `B2BRequest` qui matchent `user_id` OU `parentEmail`/`contactEmail` = email user (lower). Tri eventDate DESC, createdAt DESC en tie-break. Pagination 25/page.

**Réponse 200** :
```json
{
  "items": [
    { "kind": "anniv", "id": 12, "reference": "FGC-XYZ123",
      "status": "confirme", "statusLabel": "Confirmé",
      "eventDate": "2026-06-14", "timeSlot": "14:00",
      "summary": "Anniversaire de Léa · 12 enfants · Superbowler",
      "totalCents": 30000,
      "createdAt": "2026-05-19T10:00:00+00:00" },
    { "kind": "b2b", "id": 5, "reference": "FGC-B2B-ABC456",
      "status": "devis_envoye", "statusLabel": "Devis envoyé",
      "eventDate": "2026-12-15", "timeSlot": null,
      "summary": "TPME · seminaire · 40 personnes",
      "totalCents": 250000,
      "createdAt": "2026-05-10T08:30:00+00:00" }
  ],
  "total": 2, "page": 1, "perPage": 25
}
```

#### Stamping `userId` automatique sur tunnel/B2B

Quand un client connecté soumet `POST /reservations/anniversaire` ou `POST /entreprises/devis` **via le proxy Next `/api/client/proxy/*`** (qui ajoute le Bearer), le backend lit `Security::getUser()` et stamp `DemandeReservation.user_id` / `B2BRequest.user_id`. Le flow anonyme reste inchangé pour les visiteurs non connectés (cookie absent → POST direct sans Bearer).

---

## Notes d'implémentation

- **OpenAPI** : généré automatiquement par API Platform → Swagger UI à `/api`. Toute divergence entre ce fichier et l'OpenAPI doit déclencher une PR de correction.
- **Idempotence** : aucun endpoint n'est idempotent en v1 (sauf `GET`). Le front doit gérer le double-clic (bouton disabled pendant la requête).
- **Logging** : tout 5xx loggé avec `monolog` + erreur loguée dans Sentry (à brancher plus tard).
- **Tests** : voir CLAUDE.md § 7.4.

---

*Fin API_CONTRACT.md*
