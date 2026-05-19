<?php

namespace App\Tests\Api\Entity;

class MenuCategoryTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return null; }
    protected static function adminUri(): string { return '/api/menu_categories'; }
    protected static function notBlankField(): string { return 'title'; }

    /**
     * MenuCategory n'est pas directement POSTable : la relation `section`
     * (ManyToOne MenuSection, nullable=false) n'est pas dans menu:write —
     * l'exposer crée une boucle d'eager loading. La catégorie s'édite via
     * la collection `columns` de MenuSection (cascade persist).
     */
    protected static function supportsDirectPost(): bool { return false; }

    protected function validPayload(): array
    {
        return [
            'key' => self::uniqueKey('cat'),
            'title' => 'Catégorie test '.bin2hex(random_bytes(2)),
            'position' => 99,
        ];
    }
}
