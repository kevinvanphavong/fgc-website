<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * Payload d'inscription espace client (POST /api/auth/register).
 * Validé par Assert\* avant que ClientAuthController ne crée l'user.
 */
class RegisterClientInput
{
    #[Assert\NotBlank(message: 'Email requis.')]
    #[Assert\Email(message: 'Email invalide.')]
    #[Assert\Length(max: 180)]
    public string $email = '';

    #[Assert\NotBlank(message: 'Mot de passe requis.')]
    #[Assert\Length(min: 10, max: 200, minMessage: 'Mot de passe : 10 caractères minimum.')]
    #[Assert\Regex(
        pattern: '/[A-Z]/',
        message: 'Mot de passe : au moins une majuscule.',
    )]
    #[Assert\Regex(
        pattern: '/[0-9]/',
        message: 'Mot de passe : au moins un chiffre.',
    )]
    public string $password = '';

    #[Assert\NotBlank(message: 'Prénom requis.')]
    #[Assert\Length(min: 1, max: 80)]
    public string $firstName = '';

    #[Assert\NotBlank(message: 'Nom requis.')]
    #[Assert\Length(min: 1, max: 80)]
    public string $lastName = '';

    /** Optionnel. Si fourni, regex FR validée dans le controller (Assert\Regex sur null = noisy). */
    #[Assert\Length(max: 20)]
    public ?string $phone = null;

    #[Assert\IsTrue(message: 'Le consentement RGPD est requis.')]
    public bool $acceptRgpd = false;

    public bool $acceptNewsletter = false;
}
