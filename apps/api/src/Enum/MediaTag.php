<?php

namespace App\Enum;

/**
 * Tags de classement des médias uploadés (PR7).
 * Pas de tag custom en V1 (cf. prompt § "À NE PAS faire").
 */
enum MediaTag: string
{
    case Hebdo = 'hebdo';
    case Anniversaires = 'anniversaires';
    case Evenement = 'evenement';
    case Bar = 'bar';
    case Salle = 'salle';
    case Global = 'global';

    public static function values(): array
    {
        return array_map(static fn(self $c) => $c->value, self::cases());
    }
}
