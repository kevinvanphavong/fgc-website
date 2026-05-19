<?php

namespace App\Tests\Api\Entity;

class PassCardTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/formules/pass'; }
    protected static function adminUri(): string { return '/api/pass_cards'; }
    protected static function notBlankField(): string { return 'name'; }

    protected function validPayload(): array
    {
        return [
            'key' => self::uniqueKey('pass'),
            'name' => 'Pass Test',
            'price' => '49€',
            'features' => ['Feature A', 'Feature B'],
            'separatePrice' => '60€',
            'savings' => '11€',
            'featured' => false,
            'position' => 99,
        ];
    }
}
