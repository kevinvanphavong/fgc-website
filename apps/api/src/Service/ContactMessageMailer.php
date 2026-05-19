<?php

namespace App\Service;

use App\Entity\ContactMessage;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

/**
 * Mails transactionnels d'un message contact (PR9 finitions).
 * Best-effort : un échec ne rollback PAS la persistance.
 */
final class ContactMessageMailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire(param: 'mailer.from_address')] private readonly string $fromAddress,
        #[Autowire(param: 'mailer.from_name')] private readonly string $fromName,
        #[Autowire(param: 'mailer.reservations_to')] private readonly string $contactTo,
    ) {
    }

    public function sendAdminNotification(ContactMessage $m): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to($this->contactTo)
            ->replyTo(new Address($m->getEmail(), $m->getName()))
            ->subject(sprintf('✉️ Nouveau message contact — %s · %s', $m->getName(), $m->getSubject()->value))
            ->htmlTemplate('emails/contact_admin.html.twig')
            ->context(['message' => $m]);

        $this->mailer->send($email);
    }

    public function sendClientConfirmation(ContactMessage $m): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($m->getEmail(), $m->getName()))
            ->subject(sprintf('Votre message bien reçu — %s', $m->getReference()))
            ->htmlTemplate('emails/contact_client.html.twig')
            ->context(['message' => $m]);

        $this->mailer->send($email);
    }
}
