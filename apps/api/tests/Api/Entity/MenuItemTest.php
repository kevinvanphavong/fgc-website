<?php

namespace App\Tests\Api\Entity;

class MenuItemTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return null; }
    protected static function adminUri(): string { return '/api/menu_items'; }
    protected static function notBlankField(): string { return 'name'; }

    // Cf. MenuCategoryTest — même raison, relation parent non exposée.
    protected static function supportsDirectPost(): bool { return false; }

    protected function validPayload(): array
    {
        return [
            'name' => 'Item test '.bin2hex(random_bytes(2)),
            'description' => 'Description test',
            'price' => '8,50€',
            'position' => 99,
        ];
    }
}
