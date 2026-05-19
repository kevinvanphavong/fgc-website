<?php

namespace App\Tests\Api\Entity;

class ActivityPageContentTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/activites'; }
    protected static function adminUri(): string { return '/api/activity_page_contents'; }
    protected static function notBlankField(): string { return 'image'; }

    protected function validPayload(): array
    {
        return [
            'slug' => self::uniqueKey('act'),
            'image' => '/assets/test.png',
            'imageAlt' => 'Alt test',
            'inlinePriceAmount' => '7,90€',
            'inlinePriceDescription' => 'la partie',
            'features' => [],
            'priceCards' => [],
            'pricingEyebrow' => 'Tarifs',
            'pricingTitle' => 'Titre test',
            'pricingLead' => 'Lead test',
        ];
    }
}
