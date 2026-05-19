<?php

namespace App\Tests\Api\Entity;

class ResaCardTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/formules/reservations'; }
    protected static function adminUri(): string { return '/api/resa_cards'; }
    protected static function notBlankField(): string { return 'audience'; }

    protected function validPayload(): array
    {
        return [
            'key' => self::uniqueKey('resa'),
            'rank' => '01',
            'audience' => 'Familles test',
            'price' => '15€',
            'pitch' => 'Pitch test',
            'features' => ['F1', 'F2'],
            'keyPoint' => 'Highlight test',
            'featured' => false,
            'position' => 99,
        ];
    }
}
