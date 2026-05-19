# PR de suivi — Infra de tests & couverture back-office (PR4+)

> **À coller dans une session Claude Code, depuis la racine du repo `fgc-website-claude/`.**
>
> Lis **avant** de commencer : `CLAUDE.md`, `docs/GOTCHAS.md`, `docs/PLAN_BACKOFFICE.md`. Cette PR rembourse la dette technique de PR4 (livrée sans tests par entité) **avant** d'attaquer la PR10/13 (tunnel anniv) et PR5 (réservations admin).

## Contexte

PR4 a livré le back-office Contenus + kill EasyAdmin avec une validation E2E manuelle (login + proxy + PUT + reload public). Aucun test automatisé n'a été écrit pour les 13 entités sécurisées `ROLE_STAFF`. C'est la dernière fenêtre pour poser un filet avant que le projet ne grossisse (tunnel anniv → PR5/6/7/8 du back-office). 1 jour d'effort.

## Scope strict

### Côté Symfony (`apps/api/`)

1. **Infra `env=test`** :
   - DB de test : Postgres dédiée (docker-compose `postgres-test` sur port `5433`, image identique à dev), schéma re-créé à chaque suite via `KernelTestCase::bootKernel(['environment' => 'test'])` + `doctrine:schema:create` ou `doctrine:migrations:migrate --no-interaction`.
   - JWT keys de test : nouvelle paire `config/jwt/private-test.pem` + `public-test.pem` générée et **commitée** (passphrase courte `test`, OK car env de test). Variables `.env.test` qui pointent dessus.
   - Fixture `TestUserFixture` (group `test`) : 1 user `staff@test.fgc` mot de passe `TestPassw0rd!` rôle `ROLE_ADMIN`. Chargée via `--group test` avant chaque suite.
   - Helper `tests/Support/AuthenticatedClientTrait.php` : méthode `createAuthenticatedClient()` qui POST `/api/auth/login` + injecte `Authorization: Bearer <token>` dans le client `WebTestCase`.

2. **13 tests d'entité** (un fichier par entité dans `tests/Api/Entity/{EntityName}Test.php`), pattern unique répliqué :
   - `testGetCollectionPublic()` : `GET /api/{collection}` sans token → 200, payload non vide (fixture seedée).
   - `testPostRequiresStaff()` : `POST /api/{collection}` sans token → 401 ; avec token `ROLE_STAFF` valide + payload OK → 201, `id` exposé.
   - `testPutRequiresStaff()` : `PUT /api/{collection}/{id}` sans token → 401 ; avec token + payload partiel → 200.
   - `testDeleteRequiresStaff()` : `DELETE /api/{collection}/{id}` sans token → 401 ; avec token → 204.
   - `testPostValidation()` : POST avec un champ `NotBlank` vidé → 422 + violation lisible.
   - Les 13 entités à couvrir : `HebdoCard`, `PassCard`, `ResaCard`, `AnnivCard`, `VipFeature`, `TarifCard`, `TarifPriceLine`, `DaySchedule`, `Offer`, `ActivityPageContent`, `MenuSection`, `MenuCategory`, `MenuItem`.

3. **Test du proxy admin** (`tests/Api/ProxyAdminTest.php`) — vérifie côté API que les expressions de rôle sont bien posées :
   - `GET /api/admin/proxy/anniv_cards` avec cookie admin valide → 200.
   - Même appel sans cookie → 401 propagé.
   - Smoke test sur 2-3 entités, pas les 13 (le cookie→Bearer est commun, pas besoin de répéter).

4. **CI GitHub Actions** (`.github/workflows/api-tests.yml`) si pas déjà en place :
   - Service Postgres 16 sur port `5432` (container CI, pas docker-compose).
   - Install Composer, génère JWT keys de test à la volée (script `tests/Support/setup_jwt.sh`) OU utilise les clés commitées (au choix selon ta préférence sécu — je recommande commiter, env=test only).
   - Exécute `bin/phpunit` sur le dossier `tests/Api/`.
   - Bloque la PR si rouge.

5. **Commande Makefile / script** `make test-api` (ou `apps/api/bin/test`) qui automatise localement : démarrer postgres-test, drop+recreate schema, charger fixtures `--group test`, lancer phpunit.

### À NE PAS faire (différé)

- Tests d'intégration front (Playwright/Cypress) — V2.
- Tests unitaires sur les services métier (`AnnivCardRepository::findFeatured`, etc.) — pas critique, l'intégration couvre.
- Mutation testing, code coverage gate — pas en V1.
- Refacto des fixtures de prod (`AnnivCardFixture` etc.) — gardes-en l'isolation, ne mixe pas avec les fixtures de test.

## Contraintes techniques

- **PHP 8.3+**, PHPUnit 11+ (vérifier `composer.json`, installer si manquant).
- **Pas de SQLite** pour la DB de test : on veut le même moteur qu'en prod (Postgres) sinon les Assert sur types JSONB / unique constraints divergent.
- **Isolation** : chaque test est `@dataProvider`-compatible et nettoie en fin de méthode (transactional rollback via `DoctrineTestBundle` ou `tearDown` avec truncate).
- **Pas de mock de l'EntityManager** dans ces tests — on veut tester le vrai chemin (request → controller → API Platform → Doctrine → DB → response).
- **Durée totale de la suite** : objectif < 30 secondes en CI. Si on dépasse, identifier le test lent et l'optimiser (fixture trop lourde, schéma re-créé à chaque test au lieu de truncate).

## Auto-vérification

1. `make test-api` (ou équivalent) en local → vert.
2. `bin/phpunit tests/Api/Entity/AnnivCardTest.php` → 5 tests OK, durée < 2 s.
3. `bin/phpunit tests/Api/` → 13 fichiers × 5 tests + 3 tests proxy = ~68 tests verts.
4. Pousser une branche PR sur GitHub → workflow `api-tests` se déclenche, passe vert.
5. Casser intentionnellement une protection (retirer `security: "is_granted('ROLE_STAFF')"` sur un `Post` d'entité) → le test correspondant doit **échouer en rouge** (vérifie qu'il garde bien). Re-mettre la protection, vert à nouveau.
6. `docs/CHANGELOG.md` : `test(api): infra env=test + 68 tests sur les 13 entités back-office + proxy admin (PR4 follow-up)`.
7. `docs/GOTCHAS.md` : ajouter une entrée si un piège a été rencontré (ex. configuration JWT en env=test, isolation Doctrine transactionnelle).

## Si tu es bloqué

- Doute sur l'isolation transactionnelle : `dama/doctrine-test-bundle` est le standard, l'ajouter en `require-dev` si pas déjà.
- Doute sur la génération de JWT en CI : préfère commiter les clés de test (env=test uniquement, jamais celles de prod).
- Doute structurel : **arrête et demande à Kévin**.

*Fin PROMPT_CLAUDE_CODE_TESTS_BACKOFFICE.md*
