<?php

namespace App\Dto;

use App\Enum\ContactSubject;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Payload du formulaire /contact (PR9 finitions).
 */
class ContactMessageInput
{
    #[Groups(['contact:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 120)]
    public string $name = '';

    #[Groups(['contact:write'])]
    #[Assert\NotBlank]
    #[Assert\Email]
    #[Assert\Length(max: 180)]
    public string $email = '';

    /** Optionnel — regex large : FR fixe ou mobile (la home/B2B sont plus stricts). */
    #[Groups(['contact:write'])]
    #[Assert\Regex(
        pattern: '/^(?:(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4})$/',
        message: 'Numéro de téléphone français attendu.',
    )]
    public ?string $phone = null;

    #[Groups(['contact:write'])]
    #[Assert\NotBlank]
    #[Assert\Choice(callback: [ContactSubject::class, 'values'])]
    public string $subject = '';

    #[Groups(['contact:write'])]
    #[Assert\NotBlank]
    #[Assert\Length(min: 10, max: 2000)]
    public string $message = '';

    #[Groups(['contact:write'])]
    #[Assert\IsTrue(message: 'Le consentement RGPD est requis.')]
    public bool $acceptRgpd = false;
}
