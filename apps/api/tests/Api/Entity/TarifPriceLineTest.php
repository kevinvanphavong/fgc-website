<?php

namespace App\Tests\Api\Entity;

class TarifPriceLineTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return null; }
    protected static function adminUri(): string { return '/api/tarif_price_lines'; }
    protected static function notBlankField(): string { return 'label'; }

    // Cf. MenuCategoryTest — même raison, relation parent non exposée.
    protected static function supportsDirectPost(): bool { return false; }

    protected function validPayload(): array
    {
        return [
            'label' => 'Tarif test '.bin2hex(random_bytes(2)),
            'price' => '12,00€',
            'position' => 99,
        ];
    }
}
