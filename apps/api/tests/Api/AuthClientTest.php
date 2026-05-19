<?php

namespace App\Tests\Api;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Espace client (PR11) — auth + profil + reservations.
 */
class AuthClientTest extends WebTestCase
{
    private function uniqueEmail(string $prefix = 'client'): string
    {
        return $prefix.'+'.bin2hex(random_bytes(4)).'@test.fgc';
    }

    private function validRegisterPayload(?string $email = null): array
    {
        return [
            'email' => $email ?? $this->uniqueEmail(),
            'password' => 'MotDePasse123',
            'firstName' => 'Sophie',
            'lastName' => 'Test',
            'phone' => '06 12 34 56 78',
            'acceptRgpd' => true,
            'acceptNewsletter' => false,
        ];
    }

    private function postJson(KernelBrowser $client, string $uri, array $payload): \Symfony\Component\HttpFoundation\Response
    {
        $client->request(
            'POST',
            $uri,
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode($payload, JSON_THROW_ON_ERROR),
        );
        return $client->getResponse();
    }

    private function registerAndLogin(?array $payload = null): array
    {
        $payload ??= $this->validRegisterPayload();
        static::ensureKernelShutdown();
        $client = static::createClient();
        $res = $this->postJson($client, '/api/auth/register', $payload);
        $this->assertSame(201, $res->getStatusCode(), $res->getContent() ?: '(vide)');
        $body = json_decode((string) $res->getContent(), true);
        return ['token' => $body['token'], 'user' => $body['user'], 'payload' => $payload];
    }

    private function clientWithToken(string $token): KernelBrowser
    {
        static::ensureKernelShutdown();
        $client = static::createClient();
        $client->setServerParameter('HTTP_AUTHORIZATION', 'Bearer '.$token);
        return $client;
    }

    public function testRegisterReturns201AndToken(): void
    {
        ['token' => $token, 'user' => $user] = $this->registerAndLogin();
        $this->assertNotEmpty($token);
        $this->assertSame('Sophie', $user['firstName']);
        $this->assertContains(User::ROLE_CLIENT, $user['roles']);
    }

    public function testRegisterAcceptRgpdRequired(): void
    {
        $payload = $this->validRegisterPayload();
        $payload['acceptRgpd'] = false;
        static::ensureKernelShutdown();
        $client = static::createClient();
        $res = $this->postJson($client, '/api/auth/register', $payload);
        $this->assertSame(422, $res->getStatusCode());
    }

    public function testRegisterDuplicateEmail(): void
    {
        $payload = $this->validRegisterPayload();
        static::ensureKernelShutdown();
        $client = static::createClient();
        $res = $this->postJson($client, '/api/auth/register', $payload);
        $this->assertSame(201, $res->getStatusCode());

        static::ensureKernelShutdown();
        $client = static::createClient();
        $res = $this->postJson($client, '/api/auth/register', $payload);
        $this->assertSame(422, $res->getStatusCode());
    }

    public function testLoginClientReturnsJwt(): void
    {
        $payload = $this->validRegisterPayload();
        static::ensureKernelShutdown();
        $client = static::createClient();
        $this->postJson($client, '/api/auth/register', $payload);

        static::ensureKernelShutdown();
        $client = static::createClient();
        $res = $this->postJson($client, '/api/auth/login', [
            'email' => $payload['email'], 'password' => $payload['password'],
        ]);
        $this->assertSame(200, $res->getStatusCode());
        $body = json_decode((string) $res->getContent(), true);
        $this->assertNotEmpty($body['token']);
    }

    public function testMe401WithoutToken(): void
    {
        static::ensureKernelShutdown();
        $client = static::createClient();
        $client->request('GET', '/api/me');
        $this->assertContains($client->getResponse()->getStatusCode(), [401, 403]);
    }

    public function testMe200WithToken(): void
    {
        ['token' => $token] = $this->registerAndLogin();
        $client = $this->clientWithToken($token);
        $client->request('GET', '/api/me');
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame('Sophie', $body['firstName']);
    }

    public function testPatchMeUpdatesFirstName(): void
    {
        ['token' => $token] = $this->registerAndLogin();
        $client = $this->clientWithToken($token);
        $client->request(
            'PATCH',
            '/api/me',
            server: ['CONTENT_TYPE' => 'application/merge-patch+json'],
            content: json_encode(['firstName' => 'Léa']),
        );
        $this->assertSame(200, $client->getResponse()->getStatusCode());
        $body = json_decode((string) $client->getResponse()->getContent(), true);
        $this->assertSame('Léa', $body['firstName']);
    }

    public function testChangePasswordWrongCurrent(): void
    {
        ['token' => $token] = $this->registerAndLogin();
        $client = $this->clientWithToken($token);
        $client->request(
            'POST',
            '/api/me/change-password',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['currentPassword' => 'WrongPassword1', 'newPassword' => 'NouveauMotDePasse1']),
        );
        $this->assertSame(422, $client->getResponse()->getStatusCode());
    }

    public function testChangePasswordValid(): void
    {
        ['token' => $token, 'payload' => $payload] = $this->registerAndLogin();
        $client = $this->clientWithToken($token);
        $client->request(
            'POST',
            '/api/me/change-password',
            server: ['CONTENT_TYPE' => 'application/json'],
            content: json_encode(['currentPassword' => $payload['password'], 'newPassword' => 'NouveauMotDePasse1']),
        );
        $this->assertSame(200, $client->getResponse()->getStatusCode());
    }

    public function testForgotPasswordAlways204(): void
    {
        static::ensureKernelShutdown();
        $client = static::createClient();
        $res = $this->postJson($client, '/api/auth/forgot-password', ['email' => 'inconnu+'.bin2hex(random_bytes(2)).'@test.fgc']);
        $this->assertSame(204, $res->getStatusCode());
    }

    public function testDeleteMeAnonymizes(): void
    {
        ['token' => $token, 'user' => $user] = $this->registerAndLogin();
        $client = $this->clientWithToken($token);
        $client->request('DELETE', '/api/me');
        $this->assertSame(200, $client->getResponse()->getStatusCode());

        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get(EntityManagerInterface::class);
        $em->clear();
        $u = $em->getRepository(User::class)->find($user['id']);
        $this->assertNotNull($u);
        $this->assertStringStartsWith('deleted-', $u->getEmail());
        $this->assertStringEndsWith('@deleted.fgc', $u->getEmail());
        $this->assertFalse($u->isEnabled());
        $this->assertNull($u->getFirstName());
    }

    public function testMeReservationsAggregatesByEmail(): void
    {
        // 1) Crée directement en DB une résa "passée" (statut terminal) avec un
        //    email connu — on évite de poster via le tunnel pour ne pas polluer
        //    les compteurs `byStatus.nouveau` d'autres tests stats.
        $email = $this->uniqueEmail('parent');
        static::ensureKernelShutdown();
        $client = static::createClient();
        /** @var EntityManagerInterface $em */
        $em = static::getContainer()->get(EntityManagerInterface::class);
        $resa = (new \App\Entity\DemandeReservation())
            ->setReference('FGC-TST'.bin2hex(random_bytes(2)))
            ->setStatus(\App\Enum\DemandeReservationStatus::Passe)
            ->setFormuleKey('newbowler')
            ->setEventDate(new \DateTimeImmutable('-30 days'))
            ->setTimeSlot('14:00')
            ->setChildName('Enzo')
            ->setChildAge(8)
            ->setKidsCount(10)
            ->setParentFirstName('Marc')
            ->setParentLastName('Test')
            ->setParentEmail($email)
            ->setParentPhone('06 12 34 56 78')
            ->setAcceptCGV(true)
            ->setAcceptNewsletter(false)
            ->setUpsellVR(false)
            ->setUnitPriceCentsSnapshot(2500);
        $em->persist($resa);
        $em->flush();

        // 2) S'inscrit avec ce même email après coup.
        $payload = $this->validRegisterPayload($email);
        ['token' => $token] = $this->registerAndLogin($payload);

        // 3) /api/me/reservations doit voir la résa via match d'email.
        $authed = $this->clientWithToken($token);
        $authed->request('GET', '/api/me/reservations');
        $this->assertSame(200, $authed->getResponse()->getStatusCode(), $authed->getResponse()->getContent() ?: '(vide)');
        $body = json_decode((string) $authed->getResponse()->getContent(), true);
        $this->assertGreaterThanOrEqual(1, $body['total']);
        $kinds = array_column($body['items'], 'kind');
        $this->assertContains('anniv', $kinds);
    }
}
