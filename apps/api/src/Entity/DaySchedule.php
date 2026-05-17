<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'day_schedule')]
#[ApiResource(
    operations: [new GetCollection(uriTemplate: '/horaires')],
    normalizationContext: ['groups' => ['schedule:read']],
    order: ['position' => 'ASC'],
    paginationEnabled: false,
)]
class DaySchedule
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20, unique: true)]
    #[Groups(['schedule:read'])]
    private string $key = '';

    #[ORM\Column(length: 20)]
    #[Groups(['schedule:read'])]
    private string $label = '';

    #[ORM\Column(length: 50)]
    #[Groups(['schedule:read'])]
    private string $hours = '';

    #[ORM\Column(type: 'smallint')]
    #[Groups(['schedule:read'])]
    private int $jsDay = 0;

    #[ORM\Column]
    private int $position = 0;

    public function getId(): ?int { return $this->id; }
    public function getKey(): string { return $this->key; }
    public function setKey(string $v): static { $this->key = $v; return $this; }
    public function getLabel(): string { return $this->label; }
    public function setLabel(string $v): static { $this->label = $v; return $this; }
    public function getHours(): string { return $this->hours; }
    public function setHours(string $v): static { $this->hours = $v; return $this; }
    public function getJsDay(): int { return $this->jsDay; }
    public function setJsDay(int $v): static { $this->jsDay = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    public function __toString(): string { return $this->label; }
}
