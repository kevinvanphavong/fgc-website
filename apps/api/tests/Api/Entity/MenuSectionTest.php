<?php

namespace App\Tests\Api\Entity;

class MenuSectionTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/menu'; }
    protected static function adminUri(): string { return '/api/menu_sections'; }
    protected static function notBlankField(): string { return 'title'; }

    protected function validPayload(): array
    {
        return [
            'key' => self::uniqueKey('section'),
            'eyebrow' => 'Eyebrow',
            'title' => 'Titre test',
            'titleAccent' => 'Accent',
            'lead' => 'Lead test',
            'position' => 99,
            'columns' => [],
        ];
    }
}
