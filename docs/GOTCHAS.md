# GOTCHAS.md — Pièges techniques connus du repo FGC

> **À lire au début de chaque session Claude Code**, en plus de `CLAUDE.md`. Recense les comportements non-évidents rencontrés sur ce repo. Chaque entrée = un piège réel qui a coûté du temps une première fois.

Si tu retombes sur un piège non listé ici en cours de PR, **ajoute-le en fin de PR**. C'est notre filet collectif.

---

## 1. Next.js — `afterFiles` rewrite vs `fallback` sur routes catch-all

**Symptôme** : une route dynamique catch-all (ex. `app/api/admin/proxy/[...path]/route.ts`) ne se déclenche jamais, c'est le rewrite défini dans `next.config.mjs` qui l'intercepte avant.

**Cause** : par défaut, les rewrites sont en `beforeFiles` ou `afterFiles`, qui s'exécutent **avant** la résolution des routes dynamiques. Conséquence : ton catch-all est court-circuité.

**Fix** : passer le rewrite en `fallback` (s'exécute **après** les routes dynamiques, en dernier recours uniquement) :

```js
async rewrites() {
  return {
    fallback: [
      { source: '/old/:path*', destination: '/new/:path*' },
    ],
  };
}
```

**Rencontré en** : PR4 (proxy admin `/api/admin/proxy/[...path]`).
**Quand appliquer** : toute PR qui ajoute une route catch-all (`[...slug]` ou `[[...slug]]`) ou qui modifie `next.config.mjs > rewrites`.

---

## 2. API Platform — `id` non exposé par défaut

**Symptôme** : côté front, le champ `id` (entier ou UUID) est `undefined` sur toutes les ressources. Tu ne vois que `@id` (l'IRI : `/api/anniv_cards/3`).

**Cause** : par défaut API Platform expose **`@id` (IRI) et pas `id` (scalaire)** dans la réponse JSON. C'est le comportement Hydra/JSON-LD voulu. En `application/json` pur ça reste vrai tant que la propriété `id` n'est pas mise dans un groupe de normalisation.

**Fix** : explicitement ajouter `id` au groupe de lecture sur l'entité :

```php
#[ORM\Id]
#[ORM\GeneratedValue]
#[ORM\Column]
#[Groups(['formule:read'])]  // ← cette ligne
private ?int $id = null;
```

**Rencontré en** : PR4 (les 13 entités du back-office). Tous les hooks React Query plantaient sur `entity.id` sinon.
**Quand appliquer** : à chaque nouvelle entité avec `#[ApiResource]` qui sera consommée côté front via clé `id`. Si le front travaille uniquement avec l'IRI (`@id`), pas besoin.

---

## 3. Symfony 7 — `createClient()` ne se boote qu'une fois par test

**Symptôme** : `LogicException: Booting the kernel before calling "Symfony\Bundle\FrameworkBundle\Test\WebTestCase::createClient()" is not supported, the kernel should only be booted once.`

**Cause** : `static::createClient()` boote le kernel et stocke `static::$class`/`static::$booted=true`. Un second appel dans le même test method throw. Survient typiquement quand on instancie un client anonyme **puis** un client authentifié dans la même méthode (testPost / testPut / testDelete qui vérifient 401 puis 200).

**Fix** : `static::ensureKernelShutdown()` entre chaque `createClient()`.

```php
static::ensureKernelShutdown();
$anon = static::createClient();
$anon->request('POST', $uri, ...);

static::ensureKernelShutdown();
$client = $this->createAuthenticatedClient(); // qui fait à son tour ensureKernelShutdown() + createClient()
$client->request('POST', $uri, ...);
```

**Rencontré en** : PR4 follow-up (infra tests). Le trait `AuthenticatedClientTrait` shutdowne avant chaque createClient.
**Quand appliquer** : tout `WebTestCase` qui a besoin de deux clients (anonyme + authentifié) dans la même méthode.

---

## 4. API Platform 4 — eager loading sur relations bidirectionnelles + Groups sur back-ref = boucle infinie

**Symptôme** : 500 avec `The total number of joined relations has exceeded the specified maximum. Raise the limit if necessary with the "api_platform.eager_loading.max_joins" configuration key`.

**Cause** : si on expose la back-référence d'une relation `inversedBy/mappedBy` dans les `Groups` de denormalisation, l'`EagerLoadingExtension` d'API Platform 4 **ne déduplique pas les associations bidirectionnelles** et boucle entre les deux entités jusqu'à dépasser `api_platform.eager_loading.max_joins` (défaut 30). Survient même quand le `Groups` est restreint au write context : à la résolution de l'IRI cible (POST avec `category: /api/menu_categories/1`), API Platform fait un GET interne qui applique le read context, et la boucle se déclenche via l'autre côté de la relation.

**Exemple concret** : `MenuSection.columns` (OneToMany, in `menu:read`) ↔ `MenuCategory.section` (ManyToOne). Ajouter `Groups(['menu:write'])` sur `section` suffit à déclencher la boucle même si `menu:read` ne touche pas `section`.

**Fix V1** : ne PAS exposer la back-ref ManyToOne dans aucun groupe. La ressource enfant s'édite uniquement via la collection du parent (cascade persist). Pour les tests qui veulent attaquer le endpoint enfant directement : `protected static function supportsDirectPost(): bool { return false; }` dans `AbstractEntityApiTestCase`, qui skip le chemin POST 201 et fait pointer PUT/DELETE sur un IRI de fixture.

**Fix V2 (si besoin de POST direct un jour)** : remplacer l'auto-eager-loading par `#[ApiProperty(eagerLoading: false)]` sur la back-ref + désactiver l'extension sur l'opération concernée. Pas exploré en V1.

**Rencontré en** : PR4 follow-up (tests). Concerne `MenuCategory.section`, `MenuItem.category`, `TarifPriceLine.tarifCard`.
**Quand appliquer** : toute nouvelle entité avec relation bidirectionnelle ManyToOne nullable=false dont la back-ref pourrait être exposée en denormalisation.

---

## 5. API Platform 4 — IRI `@id` retournée par POST peut pointer vers une route Get publique non-mutable

**Symptôme** : test POST réussit (201 + `@id` retourné), mais PUT/DELETE sur ce même `@id` retournent `405 Method Not Allowed (Allow: GET)`.

**Cause** : si une entité déclare un `new Get(uriTemplate: '/activites/{slug}', uriVariables: ['slug'])` à côté du Get admin par défaut (`/api/activity_page_contents/{id}`), API Platform choisit le `uriTemplate` custom pour générer le `@id`. Ce custom Get n'a pas d'op `Put`/`Delete` associée → 405 sur mutation.

**Fix côté tests** : reconstruire toujours `<adminUri>/<id>` plutôt que d'utiliser `@id`.

```php
$body = json_decode($client->getResponse()->getContent(), true);
return rtrim(static::adminUri(), '/').'/'.$body['id'];
```

**Rencontré en** : PR4 follow-up (tests `ActivityPageContent`).
**Quand appliquer** : toute entité qui mélange routes publiques custom (`uriTemplate`) et routes admin par défaut.

---

## 6. API Platform 4 — `new GetCollection()` dédupliqué quand déclaré deux fois

**Symptôme** : la 1ʳᵉ déclaration `new GetCollection()` (publique) est silencieusement écrasée par la 2ᵉ `new GetCollection(security: ...)` (admin) — résultat : la route censée être publique renvoie 401.

**Cause** : API Platform 4 déduplique les operations par name. Sans `name:` explicite, les deux GetCollection génèrent le même nom et la 2ᵉ écrase la 1ʳᵉ.

**Fix** : soit un `uriTemplate` distinct sur la publique (ex. `'/api/formules/hebdo'`), soit un `name: 'admin_collection'` explicite. La 1ʳᵉ option est plus lisible côté front.

**Rencontré en** : PR4 follow-up. `src/Entity/TarifCard.php` ligne 23 : `new GetCollection(), new Get(),` + `new GetCollection(security: ...)` → `/api/tarif_cards` finit admin-only. Le site public a un `fallback` dans `apps/web/src/lib/content-api.ts` qui masque la régression.

**Fixé** : PR fixes API Platform pré-tunnel, 2026-05-18 — `TarifCard` a maintenant `uriTemplate: '/formules/tarifs'` sur sa GetCollection/Get publiques, le `fetchTarifs` côté front pointe dessus, et `apiFetch` log un `console.warn` quand il retombe sur le fallback statique (pour qu'un futur même bug ne se planque pas sous une dégradation silencieuse).

**Quand appliquer** : à chaque ajout de nouvelle entité ApiResource qui mélange opérations publiques et admin — toujours mettre un `uriTemplate:` explicite sur l'op publique pour qu'elle ne soit pas écrasée.

---

## 7. PHPUnit 13 — `@dataProvider` annotation ignorée, exiger `#[DataProvider]`

**Symptôme** : `ArgumentCountError: Too few arguments to function …, 0 passed … and exactly 1 expected`.

**Cause** : PHPUnit 13 (utilisé ici) n'utilise plus les annotations PHPDoc `/** @dataProvider … */`. Il faut l'attribut PHP 8.

**Fix** :

```php
use PHPUnit\Framework\Attributes\DataProvider;

#[DataProvider('myProvider')]
public function testSomething(string $arg): void { ... }
```

**Rencontré en** : PR4 follow-up (`ProxyAdminTest`).
**Quand appliquer** : tout nouveau test paramétré sous PHPUnit 10+.

---

## 8. Tests Symfony — `dama/doctrine-test-bundle` incompatible avec `doctrine-bundle ^3.x`

**Symptôme** : `composer require --dev dama/doctrine-test-bundle` échoue : `requires doctrine/doctrine-bundle ^2.11 but it conflicts with your root composer.json require (^3.2)`.

**Cause** : dama (v8.6 au moment de PR4 follow-up) n'a pas encore bumpé son support pour doctrine-bundle 3.x.

**Fix V1 (sans dama)** : isolation alternative — bootstrap `tests/bootstrap.php` qui drop+create+seed la DB une seule fois pour la suite, et clés uniques (`bin2hex(random_bytes(4))`) dans `validPayload()` pour éviter les collisions UNIQUE entre tests qui POSTent.

```php
// dans validPayload()
'key' => self::uniqueKey('hebdo'),  // ex. "hebdo-3a7b9f2c"
```

**Fix V2 (dès que dama supporte doctrine-bundle 3)** : ajouter `dama/doctrine-test-bundle` en require-dev, activer l'extension dans `phpunit.dist.xml`, retirer la stratégie clé-unique (redondante avec le rollback transactionnel).

**Rencontré en** : PR4 follow-up.
**Quand appliquer** : à chaque release dama, re-checker la compat. Sinon : garder la stratégie clé-unique sur tout nouveau test qui POST.

---

## 9. Symfony — `access_control` regex préfixe peut matcher des entités voisines

**Symptôme** : tous les endpoints `/api/menu_sections`, `/api/menu_categories`, `/api/menu_items` se mettent à renvoyer 403 alors qu'on n'a touché à aucune entité Menu. Côté tests : `MenuSectionTest`, `MenuCategoryTest`, `MenuItemTest`, `ProxyAdminTest` cassent simultanément.

**Cause** : on a ajouté une règle `access_control` pour protéger l'espace client :

```yaml
- { path: ^/api/me, roles: ROLE_CLIENT }
```

Le regex `^/api/me` matche **aussi** `/api/menu_*` (le préfixe `me` est inclus dans `menu`). Les requêtes admin staff aux endpoints `/api/menu_sections` se retrouvent à demander `ROLE_CLIENT` qu'aucun staff n'a → 403.

**Fix** : ancrer le segment avec `(/|$)` :

```yaml
- { path: ^/api/me(/|$), roles: ROLE_CLIENT }
```

Couvre `/api/me`, `/api/me/`, `/api/me/reservations`, `/api/me/change-password` — sans matcher `/api/menu_*`.

**Rencontré en** : PR11 (espace client). 11 tests cassent en cascade jusqu'à comprendre que ce n'est pas un problème de rôle mais de regex.
**Quand appliquer** : à chaque nouvelle règle `access_control` dont le path est un préfixe court (`me`, `b2b`, `vr`, etc.). Si tu ajoutes un path court, mets toujours l'ancre `(/|$)` ou utilise une regex plus précise (`^/api/me/`, mais alors `/api/me` tout court n'est plus protégé — préfère `(/|$)`).

---

## 10. Messenger + env vars — `.env` gitignoré ⇒ défauts dans `services.yaml`, et transport Doctrine = paquet à part

**Contexte** : PR push réservations → Shiftly (2026-07-03), 1ʳᵉ intro de `symfony/messenger` sur le repo.

**Piège A — transport `doctrine://` absent malgré `symfony/messenger`.**
`composer require symfony/messenger` **ne fournit pas** le transport Doctrine. `messenger:setup-transports` échoue avec *« No transport supports the given Messenger DSN »* tant que `MESSENGER_TRANSPORT_DSN=doctrine://…`. Il faut **`composer require symfony/doctrine-messenger`** en plus (idem `symfony/amqp-messenger`, `symfony/redis-messenger` pour les autres DSN).

**Piège B — `.env` est gitignoré sur ce repo (≠ Flex standard).**
La racine `.gitignore` ignore `.env` (ligne 9). Or Flex écrit les nouvelles vars (ex. `MESSENGER_TRANSPORT_DSN`) dans `.env`, qui **ne sera jamais committé**. Une var référencée en `%env(FOO)%` sans valeur fait échouer la compilation du container sur un clone neuf. **Fix** : donner un défaut committé dans `config/services.yaml` :

```yaml
parameters:
    env(SHIFTLY_INGEST_URL): ''            # défaut committé, vide = feature off
    env(MESSENGER_TRANSPORT_DSN): 'doctrine://default?auto_setup=0'
```

Les fichiers d'env (`.env`, `.env.local`) surchargent toujours ce défaut à runtime. `.env.example` reste la doc pour les humains (à copier en `.env.local`).

**Piège C — `.env.local` PAS chargé en `env=test`.**
Symfony ignore volontairement `.env.local` en environnement `test`. Le `.env.test` committé fixe `DATABASE_URL` en dur (port 5432 = Postgres natif de Kévin). Si le Postgres tourne sur un autre port (ex. 5433 pour cohabiter avec un autre projet Docker sur 5432), les tests visent le mauvais serveur. **Fix** : override local dans **`.env.test.local`** (gitignoré, lui, chargé en test) — ne jamais éditer le `.env.test` committé.

**Quand appliquer** : toute PR qui ajoute une dépendance Flex écrivant dans `.env` (Messenger, Lock, Cache…), toute nouvelle var d'env optionnelle, et tout run de tests sur une machine où Postgres n'est pas sur 5432.

---

*Fin GOTCHAS.md*
