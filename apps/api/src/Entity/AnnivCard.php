<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [new GetCollection(uriTemplate: '/formules/anniversaires')],
    normalizationContext: ['groups' => ['formule:read']],
    order: ['position' => 'ASC'],
    paginationEnabled: false,
)]
class AnnivCard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['formule:read'])]
    private string $key = '';

    #[ORM\Column(length: 10)]
    #[Groups(['formule:read'])]
    private string $icon = '';

    #[ORM\Column(length: 100)]
    #[Groups(['formule:read'])]
    private string $name = '';

    #[ORM\Column(length: 50)]
    #[Groups(['formule:read'])]
    private string $age = '';

    #[ORM\Column(length: 50)]
    #[Groups(['formule:read'])]
    private string $price = '';

    #[ORM\Column(type: 'json')]
    #[Groups(['formule:read'])]
    private array $features = [];

    #[ORM\Column]
    #[Groups(['formule:read'])]
    private bool $featured = false;

    #[ORM\Column]
    private int $position = 0;

    public function getId(): ?int { return $this->id; }
    public function getKey(): string { return $this->key; }
    public function setKey(string $v): static { $this->key = $v; return $this; }
    public function getIcon(): string { return $this->icon; }
    public function setIcon(string $v): static { $this->icon = $v; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $v): static { $this->name = $v; return $this; }
    public function getAge(): string { return $this->age; }
    public function setAge(string $v): static { $this->age = $v; return $this; }
    public function getPrice(): string { return $this->price; }
    public function setPrice(string $v): static { $this->price = $v; return $this; }
    public function getFeatures(): array { return $this->features; }
    public function setFeatures(array $v): static { $this->features = $v; return $this; }
    public function isFeatured(): bool { return $this->featured; }
    public function setFeatured(bool $v): static { $this->featured = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    public function __toString(): string { return $this->icon . ' ' . $this->name; }
}
