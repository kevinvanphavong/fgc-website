<?php

namespace App\Service;

use App\Entity\AnnivCard;
use App\Entity\DemandeReservation;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;

/**
 * Envoie les 2 mails transactionnels d'une demande de réservation anniv :
 *   - admin (gérant)  : récap complet + lien future « marquer comme contactée »
 *   - client (parent) : confirmation, référence, FAQ courte
 *
 * Synchronisé en V1 (CLAUDE.md §11) — pas de Messenger.
 */
final class BirthdayReservationMailer
{
    public function __construct(
        private readonly MailerInterface $mailer,
        #[Autowire(param: 'mailer.from_address')] private readonly string $fromAddress,
        #[Autowire(param: 'mailer.from_name')] private readonly string $fromName,
        #[Autowire(param: 'mailer.reservations_to')] private readonly string $reservationsTo,
    ) {
    }

    public function sendAdminNotification(DemandeReservation $r, AnnivCard $formule): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to($this->reservationsTo)
            ->replyTo(new Address($r->getParentEmail(), $r->getParentFullName()))
            ->subject(sprintf(
                '🎉 Nouvelle demande anniv — %s · %s · %d enfants',
                $formule->getName(),
                $r->getEventDate()?->format('d/m/Y') ?? '?',
                $r->getKidsCount(),
            ))
            ->htmlTemplate('emails/anniv_demande_admin.html.twig')
            ->context([
                'reservation' => $r,
                'formule' => $formule,
                'totalCents' => $r->getTotalCents(),
            ]);

        $this->mailer->send($email);
    }

    public function sendClientConfirmation(DemandeReservation $r, AnnivCard $formule): void
    {
        $email = (new TemplatedEmail())
            ->from(new Address($this->fromAddress, $this->fromName))
            ->to(new Address($r->getParentEmail(), $r->getParentFullName()))
            ->subject(sprintf('Votre demande de réservation %s — %s', $r->getReference(), $formule->getName()))
            ->htmlTemplate('emails/anniv_demande_client.html.twig')
            ->context([
                'reservation' => $r,
                'formule' => $formule,
                'totalCents' => $r->getTotalCents(),
            ]);

        $this->mailer->send($email);
    }
}
