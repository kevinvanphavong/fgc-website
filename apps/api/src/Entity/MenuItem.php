<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ApiResource(
    operations: [
        new GetCollection(security: "is_granted('ROLE_STAFF')"),
        new Get(security: "is_granted('ROLE_STAFF')"),
        new Post(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['menu:write']]),
        new Put(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['menu:write']]),
        new Delete(security: "is_granted('ROLE_STAFF')"),
    ],
    normalizationContext: ['groups' => ['menu:read']],
    paginationEnabled: false,
)]
#[ORM\Entity]
class MenuItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[Groups(['menu:read'])]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Groups(['menu:read', 'menu:write'])]
    #[Assert\NotBlank]
    private string $name = '';

    #[ORM\Column(length: 300)]
    #[Groups(['menu:read', 'menu:write'])]
    private string $description = '';

    #[ORM\Column(length: 50)]
    #[Groups(['menu:read', 'menu:write'])]
    #[Assert\NotBlank]
    private string $price = '';

    #[ORM\Column]
    #[Groups(['menu:read', 'menu:write'])]
    private int $position = 0;

    // category : non exposé en API. Le MenuItem s'édite via la collection
    // `items` de MenuCategory (cascade persist). Cf. note sur MenuCategory::section.
    #[ORM\ManyToOne(targetEntity: MenuCategory::class, inversedBy: 'items')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MenuCategory $category = null;

    public function getId(): ?int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function setName(string $v): static { $this->name = $v; return $this; }
    public function getDescription(): string { return $this->description; }
    public function setDescription(string $v): static { $this->description = $v; return $this; }
    public function getPrice(): string { return $this->price; }
    public function setPrice(string $v): static { $this->price = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }
    public function getCategory(): ?MenuCategory { return $this->category; }
    public function setCategory(?MenuCategory $v): static { $this->category = $v; return $this; }

    public function __toString(): string { return $this->name . ' — ' . $this->price; }
}
