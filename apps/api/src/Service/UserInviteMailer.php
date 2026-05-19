<?php

namespace App\Service;

use App\Entity\User;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

/**
 * Envoie le mail d'invitation à un nouvel user créé par l'admin (PR7).
 * Best-effort : log si échec, ne bloque pas la création.
 */
final class UserInviteMailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire(param: 'mailer.from_address')] private readonly string $fromAddress,
        #[Autowire(param: 'mailer.from_name')] private readonly string $fromName,
        #[Autowire(env: 'default:admin_setup_url_default:ADMIN_SETUP_URL')]
        private readonly string $setupUrlBase,
    ) {
    }

    public function sendInvite(User $user, string $resetToken): void
    {
        $link = rtrim($this->setupUrlBase, '/').'?token='.urlencode($resetToken);

        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($user->getEmail(), $user->getFullName()))
            ->subject('Activez votre accès au back-office FGC')
            ->htmlTemplate('emails/user_invite.html.twig')
            ->context([
                'user' => $user,
                'link' => $link,
            ]);

        $this->mailer->send($email);
    }
}
