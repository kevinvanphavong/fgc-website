<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Get;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/formules/anniversaires'),
        new GetCollection(security: "is_granted('ROLE_STAFF')"),
        new Get(security: "is_granted('ROLE_STAFF')"),
        new Post(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['formule:write']]),
        new Put(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['formule:write']]),
        new Delete(security: "is_granted('ROLE_STAFF')"),
    ],
    normalizationContext: ['groups' => ['formule:read']],
    order: ['position' => 'ASC'],
    paginationEnabled: false,
)]
class AnnivCard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[Groups(['formule:read'])]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['formule:read', 'formule:write'])]
    #[Assert\NotBlank]
    private string $key = '';

    #[ORM\Column(length: 10)]
    #[Groups(['formule:read', 'formule:write'])]
    private string $icon = '';

    #[ORM\Column(length: 100)]
    #[Groups(['formule:read', 'formule:write'])]
    #[Assert\NotBlank]
    private string $name = '';

    #[ORM\Column(length: 50)]
    #[Groups(['formule:read', 'formule:write'])]
    private string $age = '';

    #[ORM\Column(length: 50)]
    #[Groups(['formule:read', 'formule:write'])]
    #[Assert\NotBlank]
    private string $price = '';

    /**
     * Prix unitaire en centimes (par enfant invité) — utilisé par le
     * tunnel de réservation pour calculer le total fête. Le champ `price`
     * string reste pour l'affichage public/admin.
     */
    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    #[Groups(['formule:read', 'formule:write'])]
    #[Assert\PositiveOrZero]
    private int $unitPriceCents = 0;

    #[ORM\Column(type: 'integer', options: ['default' => 6])]
    #[Groups(['formule:read', 'formule:write'])]
    #[Assert\PositiveOrZero]
    private int $minKids = 6;

    #[ORM\Column(length: 20, options: ['default' => ''])]
    #[Groups(['formule:read', 'formule:write'])]
    private string $duration = '';

    #[ORM\Column(length: 200, options: ['default' => ''])]
    #[Groups(['formule:read', 'formule:write'])]
    private string $tagline = '';

    #[ORM\Column(type: 'json')]
    #[Groups(['formule:read', 'formule:write'])]
    private array $features = [];

    #[ORM\Column]
    #[Groups(['formule:read', 'formule:write'])]
    private bool $featured = false;

    #[ORM\Column]
    #[Groups(['formule:read', 'formule:write'])]
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
    public function getUnitPriceCents(): int { return $this->unitPriceCents; }
    public function setUnitPriceCents(int $v): static { $this->unitPriceCents = $v; return $this; }
    public function getMinKids(): int { return $this->minKids; }
    public function setMinKids(int $v): static { $this->minKids = $v; return $this; }
    public function getDuration(): string { return $this->duration; }
    public function setDuration(string $v): static { $this->duration = $v; return $this; }
    public function getTagline(): string { return $this->tagline; }
    public function setTagline(string $v): static { $this->tagline = $v; return $this; }
    public function getFeatures(): array { return $this->features; }
    public function setFeatures(array $v): static { $this->features = $v; return $this; }
    public function isFeatured(): bool { return $this->featured; }
    public function setFeatured(bool $v): static { $this->featured = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    public function __toString(): string { return $this->icon . ' ' . $this->name; }
}
