<?php

namespace App\Dto;

use App\Enum\B2BType;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

/**
 * Payload d'entrée du formulaire B2B (POST /api/entreprises/devis).
 * Validé en amont du Processor (CLAUDE.md §7.2).
 */
class B2BDevisRequestInput
{
    #[Groups(['b2b:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(callback: [B2BType::class, 'values'])]
    public string $type = '';

    #[Groups(['b2b:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 120)]
    public string $companyName = '';

    #[Groups(['b2b:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 80)]
    public string $contactFirstName = '';

    #[Groups(['b2b:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 80)]
    public string $contactLastName = '';

    #[Groups(['b2b:write'])]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Assert\Length(max: 180)]
    public string $contactEmail = '';

    #[Groups(['b2b:write'])]
    #[Assert\NotBlank]
    #[Assert\Regex(
        pattern: '/^(?:(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4})$/',
        message: 'Numéro de téléphone français attendu.',
    )]
    public string $contactPhone = '';

    /** Optionnelle, format `YYYY-MM-DD`. Doit être ≥ today + 14j. */
    #[Groups(['b2b:write'])]
    #[Assert\Regex('/^\d{4}-\d{2}-\d{2}$/', message: 'Format YYYY-MM-DD attendu.')]
    public ?string $eventDate = null;

    #[Groups(['b2b:write'])]
    #[Assert\NotNull]
    #[Assert\Range(min: 10, max: 300)]
    public int $expectedAttendees = 0;

    #[Groups(['b2b:write'])]
    #[Assert\Length(max: 2000)]
    public ?string $message = null;

    #[Groups(['b2b:write'])]
    #[Assert\IsTrue(message: 'Le consentement RGPD est requis.')]
    public bool $acceptRgpd = false;

    /** eventDate (si renseignée) doit être ≥ J+14. */
    #[Assert\Callback]
    public function validateDate(ExecutionContextInterface $context): void
    {
        if ($this->eventDate === null || $this->eventDate === '') {
            return;
        }
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $this->eventDate);
        if (!$date instanceof \DateTimeImmutable) {
            return;
        }
        $min = (new \DateTimeImmutable('today'))->modify('+14 days');
        if ($date < $min) {
            $context->buildViolation('Date possible à partir de '.$min->format('d/m/Y').' (J+14 minimum pour préparer le devis).')
                ->atPath('eventDate')
                ->addViolation();
        }
    }
}
