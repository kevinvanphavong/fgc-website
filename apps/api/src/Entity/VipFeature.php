<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [new GetCollection(uriTemplate: '/formules/vip-features')],
    normalizationContext: ['groups' => ['formule:read']],
    order: ['position' => 'ASC'],
    paginationEnabled: false,
)]
class VipFeature
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 10)]
    #[Groups(['formule:read'])]
    private string $icon = '';

    #[ORM\Column(length: 100)]
    #[Groups(['formule:read'])]
    private string $label = '';

    #[ORM\Column]
    private int $position = 0;

    public function getId(): ?int { return $this->id; }
    public function getIcon(): string { return $this->icon; }
    public function setIcon(string $v): static { $this->icon = $v; return $this; }
    public function getLabel(): string { return $this->label; }
    public function setLabel(string $v): static { $this->label = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    public function __toString(): string { return $this->icon . ' ' . $this->label; }
}
