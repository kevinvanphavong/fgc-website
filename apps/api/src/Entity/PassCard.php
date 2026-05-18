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
        new GetCollection(uriTemplate: '/formules/pass'),
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
class PassCard
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

    #[ORM\Column(length: 100)]
    #[Groups(['formule:read', 'formule:write'])]
    #[Assert\NotBlank]
    private string $name = '';

    #[ORM\Column(length: 50)]
    #[Groups(['formule:read', 'formule:write'])]
    #[Assert\NotBlank]
    private string $price = '';

    #[ORM\Column(type: 'json')]
    #[Groups(['formule:read', 'formule:write'])]
    private array $features = [];

    #[ORM\Column(length: 50)]
    #[Groups(['formule:read', 'formule:write'])]
    private string $separatePrice = '';

    #[ORM\Column(length: 50)]
    #[Groups(['formule:read', 'formule:write'])]
    private string $savings = '';

    #[ORM\Column]
    #[Groups(['formule:read', 'formule:write'])]
    private bool $featured = false;

    #[ORM\Column]
    #[Groups(['formule:read', 'formule:write'])]
    private int $position = 0;

    public function getId(): ?int { return $this->id; }
    public function getKey(): string { return $this->key; }
    public function setKey(string $v): static { $this->key = $v; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $v): static { $this->name = $v; return $this; }
    public function getPrice(): string { return $this->price; }
    public function setPrice(string $v): static { $this->price = $v; return $this; }
    public function getFeatures(): array { return $this->features; }
    public function setFeatures(array $v): static { $this->features = $v; return $this; }
    public function getSeparatePrice(): string { return $this->separatePrice; }
    public function setSeparatePrice(string $v): static { $this->separatePrice = $v; return $this; }
    public function getSavings(): string { return $this->savings; }
    public function setSavings(string $v): static { $this->savings = $v; return $this; }
    public function isFeatured(): bool { return $this->featured; }
    public function setFeatured(bool $v): static { $this->featured = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    public function __toString(): string { return $this->name; }
}
