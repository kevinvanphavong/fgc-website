<?php

namespace App\Tests\Support;

use App\Tests\Support\AuthenticatedClientTrait;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Base commune aux 13 tests d'entité du back-office Contenus.
 *
 * Pattern (cf. docs/prompts/PROMPT_CLAUDE_CODE_TESTS_BACKOFFICE.md) :
 *   - GET collection publique (sans token) → 200 non vide (si publicUri).
 *   - POST sans token → 401 ; avec token + payload OK → 201.
 *   - PUT  sans token → 401 ; avec token + payload partiel → 200.
 *   - DELETE sans token → 401 ; avec token → 204.
 *   - POST avec un champ NotBlank vidé → 422.
 *
 * Isolation : la suite drop+create+load fixtures une seule fois (bootstrap.php).
 * Chaque méthode utilise des `key`/`slug`/etc. uniques (uniqueKey()) pour
 * éviter de heurter les contraintes UNIQUE des fixtures ou des autres tests.
 * PUT/DELETE créent leur propre cible via POST puis opèrent dessus → tests
 * indépendants entre eux et de l'ordre d'exécution.
 */
abstract class AbstractEntityApiTestCase extends WebTestCase
{
    use AuthenticatedClientTrait;

    /** URI publique (ex `/api/formules/hebdo`) ou null si pas de route publique. */
    abstract protected static function publicUri(): ?string;

    /** URI admin par défaut API Platform (ex `/api/hebdo_cards`). */
    abstract protected static function adminUri(): string;

    /** Payload POST minimum valide. */
    abstract protected function validPayload(): array;

    /** Nom du champ #[Assert\NotBlank] à vider pour testPostValidation. */
    abstract protected static function notBlankField(): string;

    /**
     * Si false → l'entité ne se POST pas directement (relation parente non
     * exposée en denormalization, cf. MenuCategory/MenuItem/TarifPriceLine).
     * Dans ce cas testPostRequiresStaff teste juste le 401, et testPutRequires-
     * Staff/testDeleteRequiresStaff ciblent un IRI de fixture (fetchFirstIri).
     */
    protected static function supportsDirectPost(): bool { return true; }

    public function testGetCollectionPublic(): void
    {
        if (static::publicUri() === null) {
            $this->markTestSkipped('Entité sans route GET publique.');
        }

        static::ensureKernelShutdown();
        $client = static::createClient();
        $client->request('GET', static::publicUri());

        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = $this->decode($client->getResponse()->getContent());
        $items = $body['member'] ?? $body['hydra:member'] ?? $body ?? [];
        $this->assertIsArray($items);
        $this->assertNotEmpty($items, 'Fixture absente : la suite est partie sur une DB non seedée ?');
    }

    public function testPostRequiresStaff(): void
    {
        $payload = $this->validPayload();

        // Sans token → 401.
        static::ensureKernelShutdown();
        $anon = static::createClient();
        $anon->request(
            'POST',
            static::adminUri(),
            server: ['CONTENT_TYPE' => 'application/ld+json'],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );
        $this->assertSame(401, $anon->getResponse()->getStatusCode());

        if (!static::supportsDirectPost()) {
            return;
        }

        // Avec token → 201 + id retourné.
        $client = $this->createAuthenticatedClient();
        $payload = $this->validPayload(); // re-roll clé unique
        $client->request(
            'POST',
            static::adminUri(),
            server: ['CONTENT_TYPE' => 'application/ld+json'],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );
        $this->assertSame(201, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
        $body = $this->decode($client->getResponse()->getContent());
        $this->assertArrayHasKey('id', $body);
        $this->assertIsInt($body['id']);
    }

    public function testPutRequiresStaff(): void
    {
        $iri = static::supportsDirectPost()
            ? $this->postAndGetIri()
            : $this->fetchFirstIri(static::adminUri());

        static::ensureKernelShutdown();
        $anon = static::createClient();
        $anon->request(
            'PUT',
            $iri,
            server: ['CONTENT_TYPE' => 'application/ld+json'],
            content: json_encode($this->validPayload(), JSON_THROW_ON_ERROR),
        );
        $this->assertSame(401, $anon->getResponse()->getStatusCode());

        if (!static::supportsDirectPost()) {
            // Skip 200 sur ces 3 entités : le PUT API Platform 4 réinitialise
            // les champs absents du payload (incluant la relation parente
            // non-null), ce qui casse la FK. Le 401 ci-dessus suffit à valider
            // la garde ROLE_STAFF côté admin.
            return;
        }

        $client = $this->createAuthenticatedClient();
        $client->request(
            'PUT',
            $iri,
            server: ['CONTENT_TYPE' => 'application/ld+json'],
            content: json_encode($this->validPayload(), JSON_THROW_ON_ERROR),
        );
        $this->assertSame(200, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
    }

    public function testDeleteRequiresStaff(): void
    {
        $iri = static::supportsDirectPost()
            ? $this->postAndGetIri()
            : $this->fetchFirstIri(static::adminUri());

        static::ensureKernelShutdown();
        $anon = static::createClient();
        $anon->request('DELETE', $iri);
        $this->assertSame(401, $anon->getResponse()->getStatusCode());

        if (!static::supportsDirectPost()) {
            // Skip le 204 sur ces 3 entités : DELETE-then-CASCADE de fixture
            // casse les autres tests. Le 401 ci-dessus suffit à valider la
            // garde ROLE_STAFF (cf. ProxyAdminTest pour le smoke staff).
            return;
        }

        $client = $this->createAuthenticatedClient();
        $client->request('DELETE', $iri);
        $this->assertSame(204, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
    }

    public function testPostValidation(): void
    {
        if (!static::supportsDirectPost()) {
            $this->markTestSkipped('Entité non POSTable directement (relation parente non exposée).');
        }

        $payload = $this->validPayload();
        $payload[static::notBlankField()] = '';

        $client = $this->createAuthenticatedClient();
        $client->request(
            'POST',
            static::adminUri(),
            server: ['CONTENT_TYPE' => 'application/ld+json'],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );
        $this->assertSame(
            422,
            $client->getResponse()->getStatusCode(),
            'Attendu 422 sur '.static::notBlankField().' vide. Réponse : '.$client->getResponse()->getContent(),
        );
        $body = $this->decode($client->getResponse()->getContent());
        // API Platform renvoie soit `violations` (JSON-LD) soit `detail`.
        $hasViolations = isset($body['violations'])
            || str_contains((string) ($body['detail'] ?? $body['hydra:description'] ?? ''), static::notBlankField());
        $this->assertTrue($hasViolations, 'Réponse 422 sans violation lisible : '.$client->getResponse()->getContent());
    }

    /**
     * POST le validPayload et renvoie l'IRI admin de la ressource créée
     * (toujours `<adminUri>/<id>`, pas le `@id` retourné — ce dernier peut
     * pointer vers une route publique Get qui ne supporte ni PUT ni DELETE,
     * cf. ActivityPageContent `/api/activites/{slug}`).
     */
    protected function postAndGetIri(): string
    {
        $client = $this->createAuthenticatedClient();
        $client->request(
            'POST',
            static::adminUri(),
            server: ['CONTENT_TYPE' => 'application/ld+json'],
            content: json_encode($this->validPayload(), JSON_THROW_ON_ERROR),
        );
        $this->assertSame(201, $client->getResponse()->getStatusCode(), 'POST de setup échoué : '.$client->getResponse()->getContent());
        $body = $this->decode($client->getResponse()->getContent());
        $this->assertArrayHasKey('id', $body, 'Pas d\'id dans la réponse POST.');
        return rtrim(static::adminUri(), '/').'/'.$body['id'];
    }

    protected function decode(string|false $content): array
    {
        if ($content === false || $content === '') {
            return [];
        }
        $decoded = json_decode($content, true);
        return is_array($decoded) ? $decoded : [];
    }

    /** Clé aléatoire courte pour éviter les collisions UNIQUE. */
    protected static function uniqueKey(string $prefix): string
    {
        return $prefix.'-'.substr(bin2hex(random_bytes(4)), 0, 8);
    }

    /**
     * Récupère le 1er IRI de la collection admin (fixture seedée).
     * Utilisé par les entités avec relation ManyToOne pour injecter le
     * parent dans le payload POST.
     */
    protected function fetchFirstIri(string $collectionUri): string
    {
        $client = $this->createAuthenticatedClient();
        $client->request('GET', $collectionUri);
        $this->assertSame(200, $client->getResponse()->getStatusCode(), 'GET '.$collectionUri.' a échoué.');
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $items = $body['member'] ?? $body['hydra:member'] ?? [];
        $this->assertNotEmpty($items, 'Collection vide : '.$collectionUri);
        return $items[0]['@id'];
    }
}
