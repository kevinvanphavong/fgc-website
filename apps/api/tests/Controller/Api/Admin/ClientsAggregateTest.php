<?php

namespace App\Tests\Controller\Api\Admin;

use App\Tests\Support\AuthenticatedClientTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests de l'agrégat Clients (PR7) — basé sur les fixtures DemandeReservation
 * (3 demandes : Sophie Martin, Marc Durand, Julie Bernard) + B2BRequest
 * (6 contacts entreprise).
 */
class ClientsAggregateTest extends WebTestCase
{
    use AuthenticatedClientTrait;

    private const LIST_URI = '/api/admin/clients';
    private const STATS_URI = '/api/admin/clients/stats';

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
        $this->assertArrayHasKey('items', $body);
        // 3 emails anniv + 6 emails B2B distincts = 9 (sauf collisions improbables).
        $this->assertGreaterThanOrEqual(8, count($body['items']));
    }

    public function testSearchFiltersResults(): void
    {
        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::LIST_URI.'?search=sophie');
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $emails = array_map(static fn($c) => $c['email'], $body['items']);
        $this->assertNotEmpty($emails);
        foreach ($emails as $e) {
            $this->assertStringContainsString('sophie', strtolower($e));
        }
    }

    public function testTagFilter(): void
    {
        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::LIST_URI.'?tag=b2b');
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertGreaterThanOrEqual(6, count($body['items']));
        foreach ($body['items'] as $c) {
            $this->assertContains('b2b', $c['tags']);
        }
    }

    public function testStats(): void
    {
        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::STATS_URI);
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertArrayHasKey('total', $body);
        $this->assertArrayHasKey('fideles', $body);
        $this->assertArrayHasKey('vip', $body);
        $this->assertArrayHasKey('newRecent', $body);
        $this->assertGreaterThan(0, $body['total']);
    }

    public function testDetailHistory(): void
    {
        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        // Fixture B2B FGC-B2B-DEMO01 = f.mercier@atos.fr
        $client->request('GET', self::LIST_URI.'/'.urlencode('f.mercier@atos.fr'));
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame('f.mercier@atos.fr', $body['email']);
        $this->assertArrayHasKey('history', $body);
        $this->assertNotEmpty($body['history']);
        $this->assertSame('b2b', $body['history'][0]['kind']);
    }
}
