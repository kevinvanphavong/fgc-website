<?php

namespace App\Service;

use App\Entity\B2BRequest;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;

/**
 * Envoie les 2 mails transactionnels d'une demande B2B :
 *   - admin (gérant)  : récap + lien admin
 *   - client          : accusé réception, "on vous recontacte sous 48h ouvrées"
 *
 * Synchronisé V1 (pas de Messenger), best-effort (cf. Processor).
 */
final class B2BDevisMailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire(param: 'mailer.from_address')] private readonly string $fromAddress,
        #[Autowire(param: 'mailer.from_name')] private readonly string $fromName,
        #[Autowire(param: 'mailer.reservations_to')] private readonly string $reservationsTo,
    ) {
    }

    public function sendAdminNotification(B2BRequest $r): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to($this->reservationsTo)
            ->replyTo(new Address($r->getContactEmail(), $r->getContactFullName()))
            ->subject(sprintf(
                '💼 Nouvelle demande B2B — %s · %s · %d pers.',
                $r->getCompanyName(),
                $r->getType()->value,
                $r->getExpectedAttendees(),
            ))
            ->htmlTemplate('emails/b2b_devis_admin.html.twig')
            ->context(['request' => $r]);

        $this->mailer->send($email);
    }

    public function sendClientConfirmation(B2BRequest $r): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($r->getContactEmail(), $r->getContactFullName()))
            ->subject(sprintf('Votre demande de devis %s — Family Games Center', $r->getReference()))
            ->htmlTemplate('emails/b2b_devis_client.html.twig')
            ->context(['request' => $r]);

        $this->mailer->send($email);
    }
}
