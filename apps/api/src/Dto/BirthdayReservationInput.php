<?php

namespace App\Dto;

use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Payload d'entrée du tunnel de réservation anniversaire.
 *
 * Validé par les Assert\* directes avant que le `BirthdayReservationProcessor`
 * ne crée l'entité `DemandeReservation`. L'entité ne reçoit que des données
 * déjà vérifiées (pattern DTO standard, cf. CLAUDE.md §7.2).
 *
 * Les contrôles cross-field qui dépendent de la DB (kidsCount ≥ minKids de
 * la formule, créneau non-déjà-pris) vivent dans le Processor, pas ici —
 * un Callback Assert ne peut pas auto-wirer l'EntityManager proprement.
 * Le seul cross-field « pur » (date ≥ today + 7) reste dans ce DTO.
 */
class BirthdayReservationInput
{
    #[Groups(['anniv:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(['newbowler', 'superbowler', 'probowler'])]
    public string $formuleKey = '';

    /** Date au format `YYYY-MM-DD`. Doit être ≥ today + 7 jours. */
    #[Groups(['anniv:write'])]
    #[Assert\NotBlank]
    #[Assert\Regex('/^\d{4}-\d{2}-\d{2}$/', message: 'Format YYYY-MM-DD attendu.')]
    public string $eventDate = '';

    #[Groups(['anniv:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(['10:00', '14:00', '14:30', '16:00', '16:30', '17:00'])]
    public string $timeSlot = '';

    #[Groups(['anniv:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 80)]
    public string $childName = '';

    #[Groups(['anniv:write'])]
    #[Assert\NotNull]
    #[Assert\Range(min: 4, max: 14)]
    public int $childAge = 0;

    #[Groups(['anniv:write'])]
    #[Assert\NotNull]
    #[Assert\Range(min: 1, max: 25)]
    public int $kidsCount = 0;

    #[Groups(['anniv:write'])]
    #[Assert\Length(max: 300)]
    public ?string $cakeNote = null;

    #[Groups(['anniv:write'])]
    #[Assert\Length(max: 300)]
    public ?string $allergies = null;

    #[Groups(['anniv:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 80)]
    public string $parentFirstName = '';

    #[Groups(['anniv:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 80)]
    public string $parentLastName = '';

    #[Groups(['anniv:write'])]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Assert\Length(max: 180)]
    public string $parentEmail = '';

    /** Téléphone mobile FR (06/07 + 8 chiffres, espaces tolérés). */
    #[Groups(['anniv:write'])]
    #[Assert\NotBlank]
    #[Assert\Regex(
        pattern: '/^(?:(?:\+33|0)\s?[67](?:\s?\d{2}){4})$/',
        message: 'Numéro de mobile FR attendu (06 ou 07).',
    )]
    public string $parentPhone = '';

    #[Groups(['anniv:write'])]
    #[Assert\Choice([null, '', 'amis', 'instagram', 'facebook', 'google', 'passage', 'autre'])]
    public ?string $source = null;

    #[Groups(['anniv:write'])]
    #[Assert\Length(max: 1000)]
    public ?string $message = null;

    #[Groups(['anniv:write'])]
    #[Assert\IsTrue(message: 'Les conditions générales doivent être acceptées.')]
    public bool $acceptCGV = false;

    #[Groups(['anniv:write'])]
    public bool $acceptNewsletter = false;

    #[Groups(['anniv:write'])]
    public bool $upsellVR = false;

    /** Cross-field « pur » : la date doit être ≥ J+7. */
    #[Assert\Callback]
    public function validateDate(ExecutionContextInterface $context): void
    {
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $this->eventDate);
        if (!$date instanceof \DateTimeImmutable) {
            return;
        }
        $min = (new \DateTimeImmutable('today'))->modify('+7 days');
        if ($date < $min) {
            $context->buildViolation('Réservation possible à partir de '.$min->format('d/m/Y').' (J+7 minimum).')
                ->atPath('eventDate')
                ->addViolation();
        }
    }
}
