<?php

namespace App\Tests\Api\Entity;

use App\Tests\Support\AuthenticatedClientTrait;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests du formulaire /contact (PR9 finitions).
 */
class ContactPublicTest extends WebTestCase
{
    use AuthenticatedClientTrait;

    private const URI = '/api/contact';
    private const ADMIN_URI = '/api/admin/contact-messages';

    /** @return array<string, mixed> */
    private function validPayload(): array
    {
        return [
            'name' => 'Jean Test',
            'email' => 'jean.test+'.bin2hex(random_bytes(3)).'@example.com',
            'phone' => '06 12 34 56 78',
            'subject' => 'tarifs',
            'message' => 'Bonjour, question sur les tarifs groupes pour 20 personnes. Merci.',
            'acceptRgpd' => true,
        ];
    }

    private function postJson(array $payload): \Symfony\Component\HttpFoundation\Response
    {
        static::ensureKernelShutdown();
        $client = static::createClient();
        $client->request(
            'POST',
            self::URI,
            server: ['CONTENT_TYPE' => 'application/ld+json'],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );
        return $client->getResponse();
    }

    public function testNominalCreates201(): void
    {
        $res = $this->postJson($this->validPayload());
        $this->assertSame(201, $res->getStatusCode(), $res->getContent() ?: '(vide)');
        $body = json_decode((string) $res->getContent(), true);
        $this->assertArrayHasKey('reference', $body);
        $this->assertMatchesRegularExpression('/^FGC-CT-[A-Z0-9]{6}$/', $body['reference']);
    }

    public function testRgpdRequired(): void
    {
        $payload = $this->validPayload();
        $payload['acceptRgpd'] = false;
        $res = $this->postJson($payload);
        $this->assertSame(422, $res->getStatusCode());
    }

    public function testInvalidSubject(): void
    {
        $payload = $this->validPayload();
        $payload['subject'] = 'inexistant';
        $res = $this->postJson($payload);
        $this->assertSame(422, $res->getStatusCode());
    }

    public function testMessageTooShort(): void
    {
        $payload = $this->validPayload();
        $payload['message'] = 'court';
        $res = $this->postJson($payload);
        $this->assertSame(422, $res->getStatusCode());
    }

    public function testAdminListingRequiresStaff(): void
    {
        static::ensureKernelShutdown();
        $anon = static::createClient();
        $anon->request('GET', self::ADMIN_URI);
        $this->assertSame(401, $anon->getResponse()->getStatusCode());

        $client = $this->createAuthenticatedClient();
        $client->request('GET', self::ADMIN_URI);
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $items = $body['member'] ?? $body['hydra:member'] ?? [];
        $this->assertGreaterThanOrEqual(3, count($items));
    }

    public function testAdminTransition(): void
    {
        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        // Récupère la fixture FGC-CT-DEMOAA (nouveau).
        $client->request('GET', self::ADMIN_URI.'?status=nouveau');
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $items = $body['member'] ?? $body['hydra:member'] ?? [];
        $this->assertNotEmpty($items);
        $iri = $items[0]['@id'];

        static::ensureKernelShutdown();
        $client = $this->createAuthenticatedClient();
        $client->request(
            'PATCH',
            $iri,
            server: ['CONTENT_TYPE' => 'application/merge-patch+json'],
            content: json_encode(['status' => 'traite'], JSON_THROW_ON_ERROR),
        );
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $patched = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame('traite', $patched['status']);
    }
}
