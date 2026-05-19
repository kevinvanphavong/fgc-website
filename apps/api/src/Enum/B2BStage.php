<?php

namespace App\Enum;

/**
 * Cycle de vie d'une demande B2B (PR6).
 *
 *   nouveau → qualifie | perdu
 *   qualifie → devis_envoye | perdu
 *   devis_envoye → negociation | gagne | perdu
 *   negociation → gagne | perdu
 *   gagne, perdu = terminaux
 *
 * Naming snake_case côté PHP & JSON (cohérent PR5). Le mockup utilise
 * "devis-envoye" en kebab-case — on harmonise sur snake_case partout.
 */
enum B2BStage: string
{
    case Nouveau = 'nouveau';
    case Qualifie = 'qualifie';
    case DevisEnvoye = 'devis_envoye';
    case Negociation = 'negociation';
    case Gagne = 'gagne';
    case Perdu = 'perdu';

    /** Stages "ouverts" (≠ terminaux) — pour le calcul du pipeline. */
    public static function openStages(): array
    {
        return [self::Nouveau, self::Qualifie, self::DevisEnvoye, self::Negociation];
    }

    /**
     * @return list<self>
     */
    public function allowedNextStates(): array
    {
        return match ($this) {
            self::Nouveau => [self::Qualifie, self::Perdu],
            self::Qualifie => [self::DevisEnvoye, self::Perdu],
            self::DevisEnvoye => [self::Negociation, self::Gagne, self::Perdu],
            self::Negociation => [self::Gagne, self::Perdu],
            self::Gagne, self::Perdu => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return $target === $this || in_array($target, $this->allowedNextStates(), true);
    }
}
