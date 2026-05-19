<?php

namespace App\Tests\Api\Entity;

class VipFeatureTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/formules/vip-features'; }
    protected static function adminUri(): string { return '/api/vip_features'; }
    protected static function notBlankField(): string { return 'label'; }

    protected function validPayload(): array
    {
        return [
            'icon' => '⭐',
            'label' => 'Feature test '.bin2hex(random_bytes(2)),
            'position' => 99,
        ];
    }
}
