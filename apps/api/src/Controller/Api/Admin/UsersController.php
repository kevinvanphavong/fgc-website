<?php

namespace App\Controller\Api\Admin;

use App\Entity\User;
use App\Repository\UserRepository;
use App\Service\UserInviteMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * CRUD admin sur les comptes utilisateurs (PR7).
 *
 *   GET    /api/admin/users            — listing (ROLE_ADMIN seul)
 *   GET    /api/admin/users/{id}       — détail
 *   POST   /api/admin/users/invite     — création + invitation par mail
 *   PATCH  /api/admin/users/{id}       — édite firstName/lastName/role/enabled
 *   DELETE /api/admin/users/{id}       — 403 (jamais de suppression hard)
 */
#[Route('/api/admin/users')]
#[IsGranted('ROLE_ADMIN')]
class UsersController extends AbstractController
{
    private const ROLES_ALLOWED = [User::ROLE_STAFF, User::ROLE_MANAGER, User::ROLE_ADMIN];

    public function __construct(
        private readonly UserRepository $repo,
        private readonly EntityManagerInterface $em,
        private readonly ValidatorInterface $validator,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly UserInviteMailer $inviteMailer,
        private readonly LoggerInterface $logger,
    ) {
    }

    #[Route('', name: 'api_admin_users_list', methods: ['GET'])]
    public function list(): JsonResponse
    {
        $users = $this->repo->createQueryBuilder('u')
            ->orderBy('u.createdAt', 'DESC')
            ->getQuery()
            ->getResult();

        return new JsonResponse([
            'items' => array_map(fn(User $u) => $this->serialize($u), $users),
        ]);
    }

    #[Route('/invite', name: 'api_admin_users_invite', methods: ['POST'])]
    public function invite(Request $request): JsonResponse
    {
        $payload = $this->decodeJson($request);
        if ($payload instanceof JsonResponse) return $payload;

        $email = trim((string) ($payload['email'] ?? ''));
        $firstName = trim((string) ($payload['firstName'] ?? ''));
        $lastName = trim((string) ($payload['lastName'] ?? ''));
        $role = (string) ($payload['role'] ?? '');

        $violations = $this->validator->validate($email, [new Assert\NotBlank(), new Assert\Email(), new Assert\Length(max: 180)]);
        if (count($violations) > 0) {
            return new JsonResponse(['error' => 'Email invalide.'], 422);
        }
        if (!in_array($role, self::ROLES_ALLOWED, true)) {
            return new JsonResponse([
                'error' => sprintf('Rôle invalide. Valeurs : %s.', implode(', ', self::ROLES_ALLOWED)),
            ], 422);
        }
        if ($this->repo->findOneBy(['email' => $email]) !== null) {
            return new JsonResponse(['error' => 'Cet email a déjà un compte.'], 409);
        }

        $user = (new User())
            ->setEmail($email)
            ->setRoles([$role])
            ->setEnabled(false);

        if ($firstName !== '') $user->setFirstName($firstName);
        if ($lastName !== '') $user->setLastName($lastName);

        // Mot de passe placeholder (random, jamais utilisable — sera remplacé via le reset).
        $user->setPassword($this->hasher->hashPassword($user, bin2hex(random_bytes(16))));

        // Token reset 24h.
        $token = bin2hex(random_bytes(32));
        $user->setResetToken($token);
        $user->setResetTokenExpiresAt((new \DateTimeImmutable())->modify('+24 hours'));

        $this->em->persist($user);
        $this->em->flush();

        // Mail best-effort.
        try {
            $this->inviteMailer->sendInvite($user, $token);
        } catch (\Throwable $e) {
            $this->logger->error('Mail invitation KO', ['email' => $email, 'err' => $e->getMessage()]);
        }

        return new JsonResponse($this->serialize($user), 201);
    }

    #[Route('/{id}', name: 'api_admin_users_detail', methods: ['GET'], requirements: ['id' => '\d+'])]
    public function detail(User $user): JsonResponse
    {
        return new JsonResponse($this->serialize($user));
    }

    #[Route('/{id}', name: 'api_admin_users_patch', methods: ['PATCH'], requirements: ['id' => '\d+'])]
    public function patch(User $user, Request $request): JsonResponse
    {
        $payload = $this->decodeJson($request);
        if ($payload instanceof JsonResponse) return $payload;

        /** @var User|null $current */
        $current = $this->getUser();
        $isSelf = $current instanceof User && $current->getId() === $user->getId();

        if (array_key_exists('firstName', $payload)) {
            $user->setFirstName($payload['firstName'] ? trim((string) $payload['firstName']) : null);
        }
        if (array_key_exists('lastName', $payload)) {
            $user->setLastName($payload['lastName'] ? trim((string) $payload['lastName']) : null);
        }
        if (array_key_exists('role', $payload)) {
            $role = (string) $payload['role'];
            if (!in_array($role, self::ROLES_ALLOWED, true)) {
                return new JsonResponse(['error' => 'Rôle invalide.'], 422);
            }
            if ($isSelf && $role !== User::ROLE_ADMIN) {
                return new JsonResponse(['error' => 'Vous ne pouvez pas vous retirer ROLE_ADMIN.'], 422);
            }
            $user->setRoles([$role]);
        }
        if (array_key_exists('enabled', $payload)) {
            $enabled = (bool) $payload['enabled'];
            if ($isSelf && !$enabled) {
                return new JsonResponse(['error' => 'Vous ne pouvez pas vous désactiver.'], 422);
            }
            $user->setEnabled($enabled);
        }

        $this->em->flush();

        return new JsonResponse($this->serialize($user));
    }

    #[Route('/{id}', name: 'api_admin_users_delete', methods: ['DELETE'], requirements: ['id' => '\d+'])]
    public function deleteForbidden(): JsonResponse
    {
        return new JsonResponse([
            'error' => 'Suppression de compte interdite. Désactivez le user via PATCH `enabled: false`.',
        ], 403);
    }

    /** @return array<string, mixed>|JsonResponse */
    private function decodeJson(Request $request): array|JsonResponse
    {
        $raw = (string) $request->getContent();
        try {
            $payload = json_decode($raw, true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return new JsonResponse(['error' => 'JSON invalide.'], 400);
        }
        return is_array($payload) ? $payload : ['error' => 'Payload doit être un objet JSON.'];
    }

    /** @return array<string, mixed> */
    private function serialize(User $u): array
    {
        return [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'firstName' => $u->getFirstName(),
            'lastName' => $u->getLastName(),
            'fullName' => $u->getFullName(),
            'roles' => $u->getRawRoles(),
            'role' => $u->getRawRoles()[0] ?? User::ROLE_STAFF,
            'avatarColor' => $u->getAvatarColor(),
            'enabled' => $u->isEnabled(),
            'lastLoginAt' => $u->getLastLoginAt()?->format(\DateTimeInterface::ATOM),
            'createdAt' => $u->getCreatedAt()?->format(\DateTimeInterface::ATOM),
        ];
    }
}
