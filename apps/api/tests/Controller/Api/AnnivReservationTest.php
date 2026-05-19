<?php

namespace App\Tests\Controller\Api;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests d'intégration du tunnel anniversaire (PR10).
 *
 * NB: API Platform 4 renvoie 422 (Unprocessable Entity) sur violations
 * Assert\* — le prompt initial mentionne 400, mais 422 est la norme moderne
 * (RFC 4918). On teste 422 partout où une validation échoue.
 */
class AnnivReservationTest extends WebTestCase
{
    private const POST_URI = '/api/reservations/anniversaire';
    private const AVAIL_URI = '/api/reservations/anniversaire/availability';

    private static function futureDate(int $daysFromToday = 21): string
    {
        return (new \DateTimeImmutable('today'))
            ->modify("+{$daysFromToday} days")
            ->format('Y-m-d');
    }

    private function validPayload(array $override = []): array
    {
        return array_merge([
            'formuleKey' => 'superbowler',
            'eventDate' => self::futureDate(),
            'timeSlot' => '10:00',
            'childName' => 'Léo Test',
            'childAge' => 8,
            'kidsCount' => 10,
            'parentFirstName' => 'Sophie',
            'parentLastName' => 'Test',
            'parentEmail' => 'sophie.test+'.bin2hex(random_bytes(2)).'@example.fr',
            'parentPhone' => '0612345678',
            'acceptCGV' => true,
            'acceptNewsletter' => false,
            'upsellVR' => false,
        ], $override);
    }

    private function post(array $payload): \Symfony\Component\HttpFoundation\Response
    {
        static::ensureKernelShutdown();
        $client = static::createClient();
        $client->request(
            'POST',
            self::POST_URI,
            server: ['CONTENT_TYPE' => 'application/ld+json'],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );
        return $client->getResponse();
    }

    public function testNominal201(): void
    {
        // Slot 17:00 → moins risqué de conflit avec les fixtures dev.
        $response = $this->post($this->validPayload(['timeSlot' => '17:00']));

        $this->assertSame(201, $response->getStatusCode(), (string) $response->getContent());
        $body = json_decode((string) $response->getContent(), true);
        $this->assertMatchesRegularExpression('/^FGC-[A-Z2-9]{6}$/', $body['reference'] ?? '');
        $this->assertSame('nouveau', $body['status'] ?? null);
        $this->assertSame('superbowler', $body['formuleKey'] ?? null);
    }

    public function testRejectsCgvFalse(): void
    {
        $response = $this->post($this->validPayload(['acceptCGV' => false, 'timeSlot' => '14:00']));
        $this->assertSame(422, $response->getStatusCode(), (string) $response->getContent());
    }

    public function testRejectsDateTooSoon(): void
    {
        $tooSoon = (new \DateTimeImmutable('today'))->modify('+3 days')->format('Y-m-d');
        $response = $this->post($this->validPayload(['eventDate' => $tooSoon, 'timeSlot' => '14:30']));
        $this->assertSame(422, $response->getStatusCode(), (string) $response->getContent());
        $body = (string) $response->getContent();
        $this->assertStringContainsString('eventDate', $body);
    }

    public function testRejectsKidsCountUnderMin(): void
    {
        // newbowler.minKids = 6 (fixtures). 4 < 6 → 422.
        $response = $this->post($this->validPayload([
            'formuleKey' => 'newbowler',
            'kidsCount' => 4,
            'timeSlot' => '16:00',
        ]));
        $this->assertSame(422, $response->getStatusCode(), (string) $response->getContent());
        $body = (string) $response->getContent();
        $this->assertStringContainsString('kidsCount', $body);
    }

    public function testConflict409OnDuplicateSlot(): void
    {
        $date = self::futureDate(35);

        $first = $this->post($this->validPayload(['eventDate' => $date, 'timeSlot' => '16:30']));
        $this->assertSame(201, $first->getStatusCode(), 'Premier POST devrait passer : '.$first->getContent());

        $second = $this->post($this->validPayload(['eventDate' => $date, 'timeSlot' => '16:30']));
        $this->assertSame(409, $second->getStatusCode(), (string) $second->getContent());
    }

    public function testAvailabilityReflectsReservedSlot(): void
    {
        $date = self::futureDate(42);

        // Réserve un slot.
        $post = $this->post($this->validPayload(['eventDate' => $date, 'timeSlot' => '14:00']));
        $this->assertSame(201, $post->getStatusCode(), $post->getContent());

        static::ensureKernelShutdown();
        $client = static::createClient();
        $client->request('GET', self::AVAIL_URI.'?date='.$date);

        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame($date, $body['date'] ?? null);

        $bySlot = [];
        foreach ($body['slots'] as $s) {
            $bySlot[$s['value']] = $s['available'];
        }
        $this->assertFalse($bySlot['14:00'] ?? null, 'Slot réservé doit être available:false');
        $this->assertTrue($bySlot['10:00'] ?? null, 'Slot libre doit rester available:true');
    }
}
