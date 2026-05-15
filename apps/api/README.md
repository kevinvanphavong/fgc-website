# apps/api — Backend Symfony 8

Backend du site FGC : API REST exposée via API Platform 4.

> Ce dossier est volontairement quasi-vide à l'init. La PR `chore/api-bootstrap` doit lancer `composer create-project` et committer le squelette Symfony résultant. Cette procédure est décrite ci-dessous.

---

## Initialisation (à faire une seule fois)

```bash
cd apps/api

# 1. Créer le squelette Symfony 8 (webapp pour avoir Twig, Doctrine, mailer, etc.)
composer create-project symfony/skeleton:"^8.0" .
composer require webapp

# 2. Bundles essentiels FGC
composer require api          # API Platform (REST + GraphQL + OpenAPI)
composer require nelmio/cors-bundle   # CORS
composer require lexik/jwt-authentication-bundle   # JWT auth
composer require symfony/mailer       # mailer (déjà via webapp normalement)
composer require stripe/stripe-php    # paiement
composer require --dev symfony/maker-bundle

# 3. Générer les clés JWT
php bin/console lexik:jwt:generate-keypair

# 4. Configurer le .env.local (voir .env.example fourni)
cp .env .env.local
# Éditer DATABASE_URL, MAILER_DSN, STRIPE_SECRET_KEY, CORS_ALLOW_ORIGIN

# 5. Créer la DB
php bin/console doctrine:database:create

# 6. Démarrer
symfony serve -d
```

Le port par défaut est `8000`. Vérifie http://127.0.0.1:8000/api → Swagger UI doit s'afficher.

---

## Structure cible après init

```
apps/api/
├── bin/
├── config/
│   ├── packages/
│   │   ├── api_platform.yaml
│   │   ├── doctrine.yaml
│   │   ├── lexik_jwt_authentication.yaml
│   │   ├── nelmio_cors.yaml
│   │   └── mailer.yaml
│   ├── routes/
│   └── services.yaml
├── migrations/
├── public/index.php
├── src/
│   ├── Controller/       ← controllers HTTP (peu, API Platform fait le gros)
│   ├── Dto/              ← DTO d'entrée (validation)
│   ├── Entity/           ← Doctrine entities + #[ApiResource]
│   ├── Mailer/           ← envoi mails transactionnels
│   ├── Repository/
│   ├── Security/         ← Voters, UserProvider, JWT handlers
│   └── Service/          ← logique métier (Stripe, etc.)
├── templates/
│   └── emails/           ← templates Twig pour mails
├── tests/
│   ├── Functional/       ← WebTestCase par endpoint
│   └── Unit/
├── translations/
├── var/                  ← cache/log (gitignored)
├── vendor/               ← Composer (gitignored)
├── .env
├── .env.example          ← exposé dans le repo, valeurs factices
├── .env.local            ← gitignored, valeurs réelles
├── composer.json
└── composer.lock
```

---

## Endpoints attendus (résumé)

Voir `../../docs/API_CONTRACT.md` pour le détail (payloads, codes retour). Vue d'ensemble :

| Méthode | Path                                  | Auth      | Usage                              |
| ------- | ------------------------------------- | --------- | ---------------------------------- |
| POST    | `/api/contact`                        | public    | Formulaire de contact général      |
| POST    | `/api/entreprises/devis`              | public    | Devis B2B                          |
| POST    | `/api/reservations/anniversaire`      | public    | Crée résa + intention paiement 50€ |
| POST    | `/api/reservations/anniversaire/{id}/confirm` | public | Webhook Stripe confirmation        |
| POST    | `/api/auth/register`                  | public    | Création compte client             |
| POST    | `/api/auth/login`                     | public    | Login → renvoie JWT                |
| GET     | `/api/me`                             | JWT       | Profil utilisateur courant         |
| PATCH   | `/api/me`                             | JWT       | Mise à jour profil                 |
| GET     | `/api/me/reservations`                | JWT       | Liste résa de l'utilisateur        |

---

## Règles d'implémentation

Voir `../../CLAUDE.md` § 7 :
- API Platform first (`#[ApiResource]`)
- DTO + `Assert\*` en entrée
- Mailer via classes dédiées, templates Twig
- Tests `WebTestCase` minimum pour chaque endpoint
- Secrets via `.env.local`, jamais commités

---

## Déploiement

Hébergeur PHP à arbitrer avec Kévin (OVH / Scaleway / Clever Cloud). Domaine cible : `api.familygamescenter.fr`. CORS configuré pour autoriser `https://familygamescenter.fr` + previews Vercel.
