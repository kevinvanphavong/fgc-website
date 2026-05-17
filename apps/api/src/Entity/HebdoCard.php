<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [new GetCollection(uriTemplate: '/formules/hebdo')],
    normalizationContext: ['groups' => ['formule:read']],
    order: ['position' => 'ASC'],
    paginationEnabled: false,
)]
class HebdoCard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['formule:read'])]
    private string $key = '';

    #[ORM\Column(length: 100)]
    #[Groups(['formule:read'])]
    private string $tag = '';

    #[ORM\Column(length: 150)]
    #[Groups(['formule:read'])]
    private string $title = '';

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['formule:read'])]
    private ?string $description = null;

    /** @var string[] */
    #[ORM\Column(type: 'json')]
    #[Groups(['formule:read'])]
    private array $bullets = [];

    #[ORM\Column(length: 50)]
    #[Groups(['formule:read'])]
    private string $price = '';

    #[ORM\Column(length: 100)]
    #[Groups(['formule:read'])]
    private string $days = '';

    #[ORM\Column]
    #[Groups(['formule:read'])]
    private bool $featured = false;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['formule:read'])]
    private ?string $savings = null;

    #[ORM\Column]
    private int $position = 0;

    public function getId(): ?int { return $this->id; }
    public function getKey(): string { return $this->key; }
    public function setKey(string $v): static { $this->key = $v; return $this; }
    public function getTag(): string { return $this->tag; }
    public function setTag(string $v): static { $this->tag = $v; return $this; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $v): static { $this->title = $v; return $this; }
    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $v): static { $this->description = $v; return $this; }
    public function getBullets(): array { return $this->bullets; }
    public function setBullets(array $v): static { $this->bullets = $v; return $this; }
    public function getPrice(): string { return $this->price; }
    public function setPrice(string $v): static { $this->price = $v; return $this; }
    public function getDays(): string { return $this->days; }
    public function setDays(string $v): static { $this->days = $v; return $this; }
    public function isFeatured(): bool { return $this->featured; }
    public function setFeatured(bool $v): static { $this->featured = $v; return $this; }
    public function getSavings(): ?string { return $this->savings; }
    public function setSavings(?string $v): static { $this->savings = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    public function __toString(): string { return $this->title; }
}
