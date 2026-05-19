<?php

namespace App\Tests\Api\Entity;

class DayScheduleTest extends \App\Tests\Support\AbstractEntityApiTestCase
{
    protected static function publicUri(): ?string { return '/api/horaires'; }
    protected static function adminUri(): string { return '/api/day_schedules'; }
    protected static function notBlankField(): string { return 'label'; }

    protected function validPayload(): array
    {
        return [
            'key' => self::uniqueKey('day'),
            'label' => 'Jour test',
            'hours' => '18h-23h',
            'jsDay' => 7,
            'position' => 99,
        ];
    }
}
