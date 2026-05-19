<?php

namespace App\Controller\Api;

use App\Dto\RegisterClientInput;
use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\ClientWelcomeMailer;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Endpoints publics auth client (PR11) :
 *   - POST /api/auth/register
 *   - POST /api/auth/forgot-password
 *
 * Le login partage le firewall json_login existant (/api/auth/login). La
 * distinction admin/client se fait côté Next via le rôle dominant.
 */
class ClientAuthController extends AbstractController
{
    public function __construct(
        private readonly UserRepository $repo,
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly ValidatorInterface $validator,
        private readonly SerializerInterface $serializer,
        private readonly JWTTokenManagerInterface $jwtManager,
        private readonly ClientWelcomeMailer $mailer,
        private readonly LoggerInterface $logger,
        private readonly RequestStack $requestStack,
        #[Autowire(service: 'limiter.auth_register')]
        private readonly RateLimiterFactory $registerLimiter,
        #[Autowire(service: 'limiter.auth_forgot_password')]
        private readonly RateLimiterFactory $forgotLimiter,
        #[Autowire(env: 'default:client_reset_url_default:CLIENT_RESET_URL')]
        private readonly string $resetUrlBase,
    ) {
    }

    #[Route('/api/auth/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(Request $request): JsonResponse
    {
        $this->consumeLimiter($this->registerLimiter, $request);

        try {
            $dto = $this->serializer->deserialize(
                (string) $request->getContent(),
                RegisterClientInput::class,
                JsonEncoder::FORMAT,
            );
        } catch (\Throwable) {
            return new JsonResponse(['error' => 'JSON invalide.'], 400);
        }

        $violations = $this->validator->validate($dto);
        if (count($violations) > 0) {
            $list = [];
            foreach ($violations as $v) {
                $list[] = ['propertyPath' => $v->getPropertyPath(), 'message' => $v->getMessage()];
            }
            return new JsonResponse(['violations' => $list, 'detail' => 'Validation failed.'], 422);
        }

        // Téléphone optionnel, regex FR si fourni.
        if ($dto->phone !== null && $dto->phone !== '' && !preg_match('/^(?:(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4})$/', $dto->phone)) {
            return new JsonResponse([
                'violations' => [['propertyPath' => 'phone', 'message' => 'Numéro de téléphone français attendu.']],
                'detail' => 'Validation failed.',
            ], 422);
        }

        $email = mb_strtolower(trim($dto->email));
        if ($this->repo->findOneBy(['email' => $email]) !== null) {
            return new JsonResponse([
                'violations' => [['propertyPath' => 'email', 'message' => 'Un compte existe déjà avec cet email.']],
                'detail' => 'Validation failed.',
            ], 422);
        }

        $user = (new User())
            ->setEmail($email)
            ->setRoles([User::ROLE_CLIENT])
            ->setEnabled(true)
            ->setFirstName($dto->firstName)
            ->setLastName($dto->lastName)
            ->setPhone($dto->phone ?: null)
            ->setAcceptNewsletter($dto->acceptNewsletter);

        $user->setPassword($this->hasher->hashPassword($user, $dto->password));

        $this->em->persist($user);
        $this->em->flush();

        // Mail best-effort.
        try {
            $this->mailer->sendWelcome($user);
        } catch (\Throwable $e) {
            $this->logger->error('Mail bienvenue client KO', ['email' => $email, 'err' => $e->getMessage()]);
        }

        $token = $this->jwtManager->create($user);

        return new JsonResponse([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'firstName' => $user->getFirstName(),
                'lastName' => $user->getLastName(),
                'fullName' => $user->getFullName(),
                'phone' => $user->getPhone(),
                'acceptNewsletter' => $user->isAcceptNewsletter(),
                'createdAt' => $user->getCreatedAt()?->format(\DateTimeInterface::ATOM),
                'roles' => $user->getRoles(),
            ],
        ], 201);
    }

    #[Route('/api/auth/forgot-password', name: 'api_auth_forgot_password', methods: ['POST'])]
    public function forgotPassword(Request $request): JsonResponse
    {
        $this->consumeLimiter($this->forgotLimiter, $request);

        try {
            $payload = json_decode((string) $request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return new JsonResponse(null, 204);
        }
        $email = mb_strtolower(trim((string) ($payload['email'] ?? '')));
        if ($email === '') {
            // Pas de leak d'existence — toujours 204.
            return new JsonResponse(null, 204);
        }

        $user = $this->repo->findOneBy(['email' => $email]);
        if ($user instanceof User && $user->isEnabled()) {
            $token = bin2hex(random_bytes(32));
            $user->setResetToken($token);
            $user->setResetTokenExpiresAt((new \DateTimeImmutable())->modify('+1 hour'));
            $this->em->flush();

            try {
                $this->mailer->sendForgotPassword($user, $token, $this->resetUrlBase);
            } catch (\Throwable $e) {
                $this->logger->error('Mail forgot-password KO', ['email' => $email, 'err' => $e->getMessage()]);
            }
        }

        return new JsonResponse(null, 204);
    }

    private function consumeLimiter(RateLimiterFactory $factory, Request $request): void
    {
        $consume = $factory->create($request->getClientIp() ?? 'anonymous')->consume();
        if (!$consume->isAccepted()) {
            throw new TooManyRequestsHttpException();
        }
    }
}
