<?php

namespace App\Security;

use App\Entity\User;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAccountStatusException;
use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * Bloque le login (et donc la génération du JWT par json_login) si le user
 * a `enabled=false`. La sécurité Symfony rejette avant que Lexik n'émette
 * le token, donc le user désactivé ne reçoit jamais de JWT exploitable.
 */
final class AppUserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user): void
    {
        if (!$user instanceof User) return;
        if (!$user->isEnabled()) {
            throw new CustomUserMessageAccountStatusException('Compte désactivé. Contactez votre administrateur.');
        }
    }

    public function checkPostAuth(UserInterface $user): void
    {
        // rien — l'utilisateur a déjà été vérifié pré-auth.
    }
}
