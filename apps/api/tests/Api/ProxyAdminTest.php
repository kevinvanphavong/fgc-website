<?php

namespace App\Tests\Api;

use App\Tests\Support\AuthenticatedClientTrait;
use PHPUnit\Framework\Attributes\DataProvider;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Smoke test côté Symfony pour vérifier que les endpoints admin via lesquels
 * passe le proxy Next.js (cf. apps/web/src/app/api/admin/proxy/[...path]/route.ts)
 * sont bien protégés et accessibles avec un Bearer JWT valide.
 *
 * Le proxy Next.js fait simplement cookie→Bearer + forward, donc tester l'API
 * directement avec Authorization: Bearer suffit pour valider la chaîne.
 *
 * Smoke 3 entités (pas les 13 — couvert dans tests/Api/Entity/*).
 */
class ProxyAdminTest extends WebTestCase
{
    use AuthenticatedClientTrait;

    /**
     * @return iterable<array{string}>
     */
    public static function adminCollectionUriProvider(): iterable
    {
        yield 'anniv_cards' => ['/api/anniv_cards'];
        yield 'hebdo_cards' => ['/api/hebdo_cards'];
        yield 'menu_categories' => ['/api/menu_categories'];
    }

    #[DataProvider('adminCollectionUriProvider')]
    public function testAdminCollectionRequiresAuth(string $uri): void
    {
        $client = static::createClient();
        $client->request('GET', $uri);
        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    #[DataProvider('adminCollectionUriProvider')]
    public function testAdminCollectionAllowsStaff(string $uri): void
    {
        $client = $this->createAuthenticatedClient();
        $client->request('GET', $uri);
        $this->assertSame(200, $client->getResponse()->getStatusCode());
    }
}
