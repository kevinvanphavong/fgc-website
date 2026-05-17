<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
class MenuItem
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Groups(['menu:read'])]
    private string $name = '';

    #[ORM\Column(length: 300)]
    #[Groups(['menu:read'])]
    private string $description = '';

    #[ORM\Column(length: 50)]
    #[Groups(['menu:read'])]
    private string $price = '';

    #[ORM\Column]
    private int $position = 0;

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
