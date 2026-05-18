<?php

namespace App\Tests\Controller\Api\Admin;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests minimum (CLAUDE.md §7.4) : couvre la garde d'auth sur l'endpoint
 * dashboard. Le test "200 avec token" requiert une infra de fixture/auth
 * en environnement test ; pour l'instant on couvre le 401, et la voie 200
 * est validée via curl + dev server (cf. CHANGELOG PR3).
 */
class DashboardControllerTest extends WebTestCase
{
    public function testDashboardRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/admin/dashboard');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testMarkReadRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/admin/notifications/mark-read');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }
}
