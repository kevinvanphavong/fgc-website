<?php

namespace App\Tests\Api\Entity;

class TarifCardTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    // Fixé : la GetCollection publique a maintenant son propre uriTemplate
    // `/formules/tarifs` (cf. GOTCHAS #6, PR fixes API Platform pré-tunnel).
    protected static function publicUri(): ?string { return '/api/formules/tarifs'; }
    protected static function adminUri(): string { return '/api/tarif_cards'; }
    protected static function notBlankField(): string { return 'name'; }

    protected function validPayload(): array
    {
        return [
            'cardGroup' => 'activites',
            'icon' => '🧪',
            'name' => 'Activité test',
            'unit' => 'à la carte',
            'note' => 'Note test',
            'position' => 99,
            'prices' => [],
        ];
    }
}
