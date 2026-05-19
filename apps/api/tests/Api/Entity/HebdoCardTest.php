<?php

namespace App\Tests\Api\Entity;

class HebdoCardTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/formules/hebdo'; }
    protected static function adminUri(): string { return '/api/hebdo_cards'; }
    protected static function notBlankField(): string { return 'title'; }

    protected function validPayload(): array
    {
        return [
            'key' => self::uniqueKey('hebdo'),
            'tag' => 'Soirée test',
            'title' => 'Test bowling à volonté',
            'description' => 'Description test',
            'bullets' => ['Bullet 1', 'Bullet 2'],
            'price' => '20€/pers',
            'days' => 'Lundi & Mardi',
            'featured' => false,
            'savings' => null,
            'position' => 99,
        ];
    }
}
