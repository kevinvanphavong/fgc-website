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

### Devis B2B

#### `POST /entreprises/devis` — public

Demande de devis entreprise (page `/entreprises`).

**Payload**
```json
{
  "entreprise": "ACME SA",
  "nomContact": "Marie Martin",
  "email": "marie@acme.fr",
  "telephone": "+33623456789",
  "fonction": "Office Manager",
  "nbParticipants": 25,
  "dateSouhaitee": "2026-09-15",
  "typeEvenement": "SEMINAIRE",
  "message": "On cherche une journée team building...",
  "consentRgpd": true
}
```

**Validation** :
- `entreprise` : `NotBlank`, `Length(2..150)`
- `nomContact`, `email`, `telephone` : idem `/contact`
- `nbParticipants` : `Type(integer)`, `Range(min=5, max=500)`
- `dateSouhaitee` : `Date`, `GreaterThan('today + 7 days')`
- `typeEvenement` : `Choice({SEMINAIRE, TEAM_BUILDING, SOIREE, ANNIVERSAIRE_PRO, AUTRE})`
- `message` : optionnel, `Length(max=5000)`

**Réponse 201**
```json
{ "id": "uuid", "received": true }
```

---

### Réservation anniversaire (tunnel)

#### `POST /reservations/anniversaire` — public

Crée une réservation anniversaire et déclenche une intention de paiement Stripe pour l'acompte de 50€.

**Payload**
```json
{
  "formule": "GOLD",
  "date": "2026-07-12",
  "creneau": "14:00",
  "nbEnfants": 10,
  "ageEnfants": 8,
  "enfantPrincipal": {
    "prenom": "Léo",
    "age": 8
  },
  "parentReferent": {
    "prenom": "Sophie",
    "nom": "Durand",
    "email": "sophie@example.com",
    "telephone": "+33611223344"
  },
  "options": ["GATEAU_CHOCOLAT", "BOISSONS_SUPP"],
  "commentaire": "Allergie noisettes pour Théo",
  "consentRgpd": true
}
```

**Validation** :
- `formule` : `Choice({SILVER, GOLD, PLATINIUM})`
- `date` : futur, jour d'ouverture (Mer/Sam/Dim créneau enfant — règle métier côté service)
- `creneau` : `Choice` parmi liste config (ex : `["14:00","15:30","17:00"]`)
- `nbEnfants` : `Range(min=6, max=20)`
- `ageEnfants` : `Range(min=5, max=16)`
- `enfantPrincipal.prenom` : `NotBlank`, `Length(max=50)`
- `parentReferent.*` : champs adresse + email valides
- `options` : `All(Choice({GATEAU_CHOCOLAT, GATEAU_FRAISE, BOISSONS_SUPP, BOOM_PRIVATIVE, ...}))` (liste config)
- `commentaire` : `Length(max=1000)`

**Réponse 201**
```json
{
  "id": "uuid",
  "status": "PENDING_PAYMENT",
  "prixTotalCents": 24500,
  "acompteCents": 5000,
  "stripeClientSecret": "pi_xxx_secret_yyy",
  "stripePublicKey": "pk_live_xxx"
}
```

Le front utilise `stripeClientSecret` avec Stripe Elements pour collecter la CB, puis attend la callback `payment_intent.succeeded` (côté serveur via webhook ci-dessous).

#### `POST /reservations/anniversaire/{id}/confirm` — public (signé Stripe)

Webhook Stripe — appelé par Stripe lors de `payment_intent.succeeded`. **Pas appelé par le front**.

Effets de bord :
- Marque la résa `CONFIRMED`.
- Envoie un mail de confirmation au parent référent + à `MAILER_FROM`.

**Headers** : `Stripe-Signature: ...` (vérifié avec `STRIPE_WEBHOOK_SECRET`).

**Réponse 204** si OK.

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

## Notes d'implémentation

- **OpenAPI** : généré automatiquement par API Platform → Swagger UI à `/api`. Toute divergence entre ce fichier et l'OpenAPI doit déclencher une PR de correction.
- **Idempotence** : aucun endpoint n'est idempotent en v1 (sauf `GET`). Le front doit gérer le double-clic (bouton disabled pendant la requête).
- **Logging** : tout 5xx loggé avec `monolog` + erreur loguée dans Sentry (à brancher plus tard).
- **Tests** : voir CLAUDE.md § 7.4.

---

*Fin API_CONTRACT.md*
