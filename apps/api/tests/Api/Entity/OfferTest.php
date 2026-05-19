<?php

namespace App\Tests\Api\Entity;

class OfferTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/offres'; }
    protected static function adminUri(): string { return '/api/offers'; }
    protected static function notBlankField(): string { return 'title'; }

    protected function validPayload(): array
    {
        return [
            'key' => self::uniqueKey('offer'),
            'image' => '/assets/test.png',
            'title' => 'Offre test',
            'badge' => 'NEW',
            'badgeVariant' => 'yellow',
            'href' => '/tarifs',
            'active' => true,
            'position' => 99,
        ];
    }
}
