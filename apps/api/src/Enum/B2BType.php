<?php

namespace App\Enum;

/**
 * Types d'événements B2B (PR6). Aligné sur le mockup, étendu avec
 * `arbre_noel` (cas saisonnier explicitement demandé) et `autre`
 * (catch-all pour les demandes hors-grille).
 */
enum B2BType: string
{
    case Seminaire = 'seminaire';
    case TeamBuilding = 'team_building';
    case Soiree = 'soiree';
    case ArbreNoel = 'arbre_noel';
    case Autre = 'autre';

    public static function values(): array
    {
        return array_map(static fn(self $c) => $c->value, self::cases());
    }
}
