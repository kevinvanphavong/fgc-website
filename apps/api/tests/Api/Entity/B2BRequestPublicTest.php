<?php

namespace App\Tests\Api\Entity;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests du endpoint public POST /api/entreprises/devis (PR6).
 * Couvre : 201 nominal, 422 acceptRgpd=false, 422 eventDate <14j, 422 type invalide,
 * 422 expectedAttendees hors-bornes.
 */
class B2BRequestPublicTest extends WebTestCase
{
    private const URI = '/api/entreprises/devis';

    /** Date à J+30 (au-delà des 14 jours requis). */
    private function farEventDate(): string
    {
        return (new \DateTimeImmutable('today'))->modify('+30 days')->format('Y-m-d');
    }

    /** @return array<string, mixed> */
    private function validPayload(): array
    {
        return [
            'type' => 'seminaire',
            'companyName' => 'ACME Corp',
            'contactFirstName' => 'Jean',
            'contactLastName' => 'Dupont',
            'contactEmail' => 'jean.dupont+'.bin2hex(random_bytes(3)).'@example.com',
            'contactPhone' => '06 12 34 56 78',
            'eventDate' => $this->farEventDate(),
            'expectedAttendees' => 30,
            'message' => 'Demande de devis test.',
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
        $this->assertMatchesRegularExpression('/^FGC-B2B-[A-Z0-9]{6}$/', $body['reference']);
        $this->assertSame('nouveau', $body['stage'] ?? null);
    }

    public function testRgpdRequired(): void
    {
        $payload = $this->validPayload();
        $payload['acceptRgpd'] = false;
        $res = $this->postJson($payload);
        $this->assertSame(422, $res->getStatusCode(), $res->getContent() ?: '(vide)');
    }

    public function testEventDateTooClose(): void
    {
        $payload = $this->validPayload();
        $payload['eventDate'] = (new \DateTimeImmutable('today'))->modify('+5 days')->format('Y-m-d');
        $res = $this->postJson($payload);
        $this->assertSame(422, $res->getStatusCode(), $res->getContent() ?: '(vide)');
        $this->assertStringContainsString('J+14', (string) $res->getContent());
    }

    public function testInvalidType(): void
    {
        $payload = $this->validPayload();
        $payload['type'] = 'inexistant';
        $res = $this->postJson($payload);
        $this->assertSame(422, $res->getStatusCode());
    }

    public function testAttendeesOutOfRange(): void
    {
        $payload = $this->validPayload();
        $payload['expectedAttendees'] = 5;
        $res = $this->postJson($payload);
        $this->assertSame(422, $res->getStatusCode());
    }

    public function testEventDateOptional(): void
    {
        // La date est optionnelle (B2B accepte les demandes sans date arrêtée).
        $payload = $this->validPayload();
        unset($payload['eventDate']);
        $res = $this->postJson($payload);
        $this->assertSame(201, $res->getStatusCode(), $res->getContent() ?: '(vide)');
    }
}
