<?php

namespace App\Tests\Controller\Api\Admin;

use App\Tests\Support\AuthenticatedClientTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests d'intégration des endpoints admin sur DemandeReservation (PR5).
 *
 * Couvre :
 *  - listing (sans token = 401, avec staff = 200, filtre status fonctionnel),
 *  - stats,
 *  - PATCH transition valide + stamp,
 *  - PATCH transition invalide (422).
 *
 * S'appuie sur les 3 fixtures dev de `DemandeReservationFixtures` (FGC-DEMOAA
 * `nouveau`, FGC-DEMOBB `contacte`, FGC-DEMOCC `confirme`).
 */
class DemandeReservationAdminTest extends WebTestCase
{
    use AuthenticatedClientTrait;

    private const LIST_URI = '/api/admin/demandes-reservation';
    private const STATS_URI = '/api/admin/demandes-reservation/stats';

    private function fetchFirstByReference(string $reference): array
    {
        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::LIST_URI.'?reference='.$reference);
        $this->assertSame(200, $client->getResponse()->getStatusCode(), 'GET listing échoué : '.$client->getResponse()->getContent());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $items = $body['member'] ?? $body['hydra:member'] ?? [];
        $this->assertNotEmpty($items, 'Fixture absente — ref '.$reference);
        return $items[0];
    }

    public function testListingRequiresStaff(): void
    {
        static::ensureKernelShutdown();
        $anon = static::createClient();
        $anon->request('GET', self::LIST_URI);
        $this->assertSame(401, $anon->getResponse()->getStatusCode());

        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::LIST_URI);
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $items = $body['member'] ?? $body['hydra:member'] ?? [];
        $this->assertGreaterThanOrEqual(3, count($items), 'Au moins les 3 fixtures dev sont attendues.');
    }

    public function testListingFilterByStatus(): void
    {
        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::LIST_URI.'?status=nouveau');
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $items = $body['member'] ?? $body['hydra:member'] ?? [];
        foreach ($items as $item) {
            $this->assertSame('nouveau', $item['status'] ?? null);
        }
    }

    public function testStatsRequiresStaff(): void
    {
        static::ensureKernelShutdown();
        $anon = static::createClient();
        $anon->request('GET', self::STATS_URI);
        $this->assertSame(401, $anon->getResponse()->getStatusCode());

        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::STATS_URI);
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('byStatus', $body);
        $this->assertArrayHasKey('newToday', $body);
        $this->assertArrayHasKey('total', $body);
        $this->assertSame(1, $body['byStatus']['nouveau'] ?? null);
    }

    public function testPatchAllowedTransitionStampsTimestamp(): void
    {
        // FGC-DEMOAA = nouveau → contacte (allowed).
        $item = $this->fetchFirstByReference('FGC-DEMOAA');
        $iri = $item['@id'];
        $this->assertNull($item['internalContactedAt'] ?? null);

        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request(
            'PATCH',
            $iri,
            server: ['CONTENT_TYPE' => 'application/merge-patch+json'],
            content: json_encode(['status' => 'contacte'], JSON_THROW_ON_ERROR),
        );
        $this->assertSame(200, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame('contacte', $body['status'] ?? null);
        $this->assertNotNull($body['internalContactedAt'] ?? null, 'Le stamp doit être posé.');
    }

    public function testPatchRejectsForbiddenTransition(): void
    {
        // FGC-DEMOBB = contacte → passe (interdit, allowed: confirme|refuse).
        $item = $this->fetchFirstByReference('FGC-DEMOBB');
        $iri = $item['@id'];

        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request(
            'PATCH',
            $iri,
            server: ['CONTENT_TYPE' => 'application/merge-patch+json'],
            content: json_encode(['status' => 'passe'], JSON_THROW_ON_ERROR),
        );
        $this->assertSame(422, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
        $body = (string) $client->getResponse()->getContent();
        $this->assertStringContainsString('non autorisée', $body);
    }

    public function testPatchAdminNoteOnly(): void
    {
        // PATCH adminNote sans toucher au status → 200 sans rejet.
        $item = $this->fetchFirstByReference('FGC-DEMOCC');
        $iri = $item['@id'];

        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request(
            'PATCH',
            $iri,
            server: ['CONTENT_TYPE' => 'application/merge-patch+json'],
            content: json_encode(['adminNote' => 'Appel passé, ok pour la date.'], JSON_THROW_ON_ERROR),
        );
        $this->assertSame(200, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame('Appel passé, ok pour la date.', $body['adminNote'] ?? null);
    }
}
