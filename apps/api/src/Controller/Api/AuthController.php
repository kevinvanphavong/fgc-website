<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class AuthController extends AbstractController
{
    /**
     * Stub route uniquement pour permettre au firewall json_login d'intercepter.
     * Le handler de succès Lexik renvoie le JWT — ce code n'est jamais atteint.
     */
    #[Route('/api/auth/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(): JsonResponse
    {
        return new JsonResponse(
            ['message' => 'Intercepted by api_login firewall.'],
            500
        );
    }

    /**
     * Réinitialise le mot de passe depuis un token d'invitation ou de récupération (PR7).
     * Active automatiquement le compte (`enabled=true`) — c'est la finalisation d'une invitation.
     */
    #[Route('/api/auth/reset-password', name: 'api_auth_reset_password', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        UserRepository $repo,
        UserPasswordHasherInterface $hasher,
        EntityManagerInterface $em,
    ): JsonResponse {
        try {
            $payload = json_decode((string) $request->getContent(), true, flags: JSON_THROW_ON_ERROR);
        } catch (\JsonException) {
            return new JsonResponse(['error' => 'JSON invalide.'], 400);
        }
        $token = (string) ($payload['token'] ?? '');
        $newPassword = (string) ($payload['newPassword'] ?? '');

        if ($token === '' || strlen($newPassword) < 8) {
            return new JsonResponse(['error' => 'Token requis et mot de passe ≥ 8 caractères.'], 422);
        }

        $user = $repo->findOneBy(['resetToken' => $token]);
        if ($user === null || !$user->isResetTokenValid()) {
            return new JsonResponse(['error' => 'Lien invalide ou expiré.'], 400);
        }

        $user->setPassword($hasher->hashPassword($user, $newPassword));
        $user->setResetToken(null);
        $user->setResetTokenExpiresAt(null);
        $user->setEnabled(true);
        $em->flush();

        return new JsonResponse(['ok' => true]);
    }

    #[Route('/api/auth/me', name: 'api_auth_me', methods: ['GET'])]
    #[IsGranted('ROLE_STAFF')]
    public function me(): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse(['error' => 'Unauthenticated'], 401);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRoles(),
            'avatarColor' => $user->getAvatarColor(),
        ]);
    }
}
