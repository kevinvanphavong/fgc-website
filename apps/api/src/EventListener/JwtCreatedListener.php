<?php

namespace App\EventListener;

use App\Entity\User;
use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

class JwtCreatedListener
{
    /** Ajoute roles + id au payload du JWT (claim, lecture côté Next si besoin). */
    #[AsEventListener(event: Events::JWT_CREATED)]
    public function onJwtCreated(JWTCreatedEvent $event): void
    {
        $user = $event->getUser();
        if (!$user instanceof User) {
            return;
        }
        $payload = $event->getData();
        $payload['uid'] = $user->getId();
        $payload['roles'] = $user->getRoles();
        $event->setData($payload);
    }

    /**
     * Enrichit la réponse `/api/auth/login` : { token, user: {...} }.
     * Le front lit user directement sans re-fetcher /api/auth/me au login.
     */
    #[AsEventListener(event: Events::AUTHENTICATION_SUCCESS)]
    public function onAuthenticationSuccess(AuthenticationSuccessEvent $event): void
    {
        $user = $event->getUser();
        if (!$user instanceof User) {
            return;
        }
        $data = $event->getData();
        $data['user'] = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'firstName' => $user->getFirstName(),
            'lastName' => $user->getLastName(),
            'fullName' => $user->getFullName(),
            'roles' => $user->getRoles(),
            'avatarColor' => $user->getAvatarColor(),
        ];
        $event->setData($data);
    }
}
