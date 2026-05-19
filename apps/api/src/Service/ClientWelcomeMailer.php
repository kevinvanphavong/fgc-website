<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

/**
 * Bienvenue après inscription espace client (PR11). Best-effort : un échec
 * mailer ne rollback PAS l'inscription (cf. pattern B2B/anniv).
 */
final class ClientWelcomeMailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire(param: 'mailer.from_address')] private readonly string $fromAddress,
        #[Autowire(param: 'mailer.from_name')] private readonly string $fromName,
    ) {
    }

    public function sendWelcome(User $user): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($user->getEmail(), $user->getFullName()))
            ->subject('Bienvenue chez Family Games Center 🎳')
            ->htmlTemplate('emails/client_welcome.html.twig')
            ->context(['user' => $user]);

        $this->mailer->send($email);
    }

    public function sendForgotPassword(User $user, string $resetToken, ?string $resetUrlBase = null): void
    {
        $base = $resetUrlBase ?? 'http://localhost:3000/mot-de-passe-oublie/reset';
        $link = rtrim($base, '/').'?token='.urlencode($resetToken);

        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($user->getEmail(), $user->getFullName()))
            ->subject('Réinitialisation de votre mot de passe')
            ->htmlTemplate('emails/client_forgot_password.html.twig')
            ->context([
                'user' => $user,
                'link' => $link,
            ]);

        $this->mailer->send($email);
    }
}
