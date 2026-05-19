<?php

namespace App\Tests\Controller\Api\Admin;

use App\Tests\Support\AuthenticatedClientTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests d'intégration des endpoints admin B2B (PR6).
 * S'appuie sur les 6 fixtures B2BRequestFixtures (DEMO01..DEMO06).
 */
class B2BRequestAdminTest extends WebTestCase
{
    use AuthenticatedClientTrait;

    private const LIST_URI = '/api/admin/b2b-requests';
    private const STATS_URI = '/api/admin/b2b-requests/stats';

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
        $this->assertGreaterThanOrEqual(6, count($items), 'Au moins les 6 fixtures dev sont attendues.');
    }

    public function testListingFilterByStage(): void
    {
        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::LIST_URI.'?stage=qualifie');
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $items = $body['member'] ?? $body['hydra:member'] ?? [];
        foreach ($items as $item) {
            $this->assertSame('qualifie', $item['stage'] ?? null);
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
        $this->assertArrayHasKey('byStage', $body);
        $this->assertArrayHasKey('openCount', $body);
        $this->assertArrayHasKey('openValueCents', $body);
        $this->assertArrayHasKey('wonValueCentsThisQuarter', $body);
        $this->assertArrayHasKey('conversionRate', $body);
        $this->assertArrayHasKey('avgResponseTimeMinutes', $body);
        // Fixtures : 1 par stage → ≥4 ouverts. Le test public peut avoir
        // ajouté des `nouveau` supplémentaires si exécuté avant.
        $this->assertGreaterThanOrEqual(4, $body['openCount']);
    }

    public function testPatchAllowedTransitionStampsTimestamp(): void
    {
        // FGC-B2B-DEMO01 = nouveau → qualifie (allowed).
        $item = $this->fetchFirstByReference('FGC-B2B-DEMO01');
        $iri = $item['@id'];
        $this->assertNull($item['internalQualifiedAt'] ?? null);

        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request(
            'PATCH',
            $iri,
            server: ['CONTENT_TYPE' => 'application/merge-patch+json'],
            content: json_encode(['stage' => 'qualifie'], JSON_THROW_ON_ERROR),
        );
        $this->assertSame(200, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame('qualifie', $body['stage'] ?? null);
        $this->assertNotNull($body['internalQualifiedAt'] ?? null, 'Le stamp doit être posé.');
    }

    public function testPatchRejectsForbiddenTransition(): void
    {
        // FGC-B2B-DEMO02 = qualifie → gagne (interdit, allowed: devis_envoye|perdu).
        $item = $this->fetchFirstByReference('FGC-B2B-DEMO02');
        $iri = $item['@id'];

        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request(
            'PATCH',
            $iri,
            server: ['CONTENT_TYPE' => 'application/merge-patch+json'],
            content: json_encode(['stage' => 'gagne'], JSON_THROW_ON_ERROR),
        );
        $this->assertSame(422, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
        $body = (string) $client->getResponse()->getContent();
        $this->assertStringContainsString('non autorisée', $body);
    }

    public function testPatchAdminNoteAndValueOnly(): void
    {
        // PATCH adminNote + estimatedValueCents sans toucher au stage → 200.
        $item = $this->fetchFirstByReference('FGC-B2B-DEMO03');
        $iri = $item['@id'];

        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request(
            'PATCH',
            $iri,
            server: ['CONTENT_TYPE' => 'application/merge-patch+json'],
            content: json_encode([
                'adminNote' => 'Devis envoyé via mail à p.dumas@blois.fr.',
                'estimatedValueCents' => 380000,
            ], JSON_THROW_ON_ERROR),
        );
        $this->assertSame(200, $client->getResponse()->getStatusCode(), (string) $client->getResponse()->getContent());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame('Devis envoyé via mail à p.dumas@blois.fr.', $body['adminNote'] ?? null);
        $this->assertSame(380000, $body['estimatedValueCents'] ?? null);
    }
}
