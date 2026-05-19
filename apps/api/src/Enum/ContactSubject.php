<?php

namespace App\Enum;

/**
 * Sujets prédéfinis du formulaire /contact (PR9 finitions).
 * Le wording front peut diverger (cf. select des libellés humanisés),
 * mais l'enum reste snake_case côté PHP/JSON pour cohérence avec PR5/PR6.
 */
enum ContactSubject: string
{
    case Anniv = 'anniv';
    case B2B = 'b2b';
    case Tarifs = 'tarifs';
    case Partenariat = 'partenariat';
    case Autre = 'autre';

    public static function values(): array
    {
        return array_map(static fn(self $c) => $c->value, self::cases());
    }
}
