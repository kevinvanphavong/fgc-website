<?php

namespace App\Tests\Api\Entity;

class AnnivCardTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/formules/anniversaires'; }
    protected static function adminUri(): string { return '/api/anniv_cards'; }
    protected static function notBlankField(): string { return 'name'; }

    protected function validPayload(): array
    {
        return [
            'key' => self::uniqueKey('anniv'),
            'icon' => '🎉',
            'name' => 'Pack Test',
            'age' => '6-12',
            'price' => '199€',
            'features' => ['F1', 'F2'],
            'featured' => false,
            'position' => 99,
        ];
    }
}
