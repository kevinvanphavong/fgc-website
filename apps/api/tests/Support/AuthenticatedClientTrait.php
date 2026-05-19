<?php

namespace App\Tests\Support;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;

/**
 * Helper pour les WebTestCase qui ont besoin d'un client authentifié JWT.
 *
 * Usage :
 *
 *     $client = $this->createAuthenticatedClient();
 *     $client->request('POST', '/api/hebdo_cards', ...);
 *
 * Le token est obtenu en POST /api/auth/login avec les credentials du staff
 * de test (cf. .env.test → ADMIN_INITIAL_EMAIL/PASSWORD).
 *
 * Le token est mis en cache dans une propriété statique pour éviter de
 * re-login à chaque appel : l'auth JSON login est lente (Argon2id) et
 * représenterait la majorité du temps de la suite sinon.
 *
 * Symfony 7 interdit de booter le kernel deux fois dans le même test ;
 * createClient() boote le kernel. On le shutdown entre la phase « login »
 * (1ʳᵉ fois) et la phase « usage » (2ᵉ fois).
 */
trait AuthenticatedClientTrait
{
    private static ?string $cachedJwt = null;

    protected function createAuthenticatedClient(?string $email = null, ?string $password = null): KernelBrowser
    {
        $email ??= $_ENV['ADMIN_INITIAL_EMAIL'] ?? 'staff@test.fgc';
        $password ??= $_ENV['ADMIN_INITIAL_PASSWORD'] ?? 'TestPassw0rd!';

        if (self::$cachedJwt === null || $email !== ($_ENV['ADMIN_INITIAL_EMAIL'] ?? null)) {
            static::ensureKernelShutdown();
            $loginClient = static::createClient();
            $loginClient->request(
                'POST',
                '/api/auth/login',
                server: ['CONTENT_TYPE' => 'application/json'],
                content: json_encode(['email' => $email, 'password' => $password], JSON_THROW_ON_ERROR),
            );
            $status = $loginClient->getResponse()->getStatusCode();
            if ($status !== 200) {
                throw new \RuntimeException(sprintf(
                    'createAuthenticatedClient: login a renvoyé %d. Réponse : %s',
                    $status,
                    $loginClient->getResponse()->getContent() ?: '(vide)',
                ));
            }
            $body = json_decode((string) $loginClient->getResponse()->getContent(), true, flags: JSON_THROW_ON_ERROR);
            self::$cachedJwt = $body['token'] ?? throw new \RuntimeException('Login OK mais pas de token dans la réponse.');
        }

        static::ensureKernelShutdown();
        $client = static::createClient();
        $client->setServerParameter('HTTP_AUTHORIZATION', 'Bearer '.self::$cachedJwt);

        return $client;
    }
}
