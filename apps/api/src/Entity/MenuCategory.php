<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
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
class MenuCategory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[Groups(['menu:read'])]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['menu:read', 'menu:write'])]
    #[Assert\NotBlank]
    private string $key = '';

    #[ORM\Column(length: 150)]
    #[Groups(['menu:read', 'menu:write'])]
    #[Assert\NotBlank]
    private string $title = '';

    #[ORM\Column]
    #[Groups(['menu:read', 'menu:write'])]
    private int $position = 0;

    #[ORM\ManyToOne(targetEntity: MenuSection::class, inversedBy: 'columns')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MenuSection $section = null;

    /** @var Collection<int, MenuItem> */
    #[ORM\OneToMany(targetEntity: MenuItem::class, mappedBy: 'category', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    #[Groups(['menu:read', 'menu:write'])]
    private Collection $items;

    public function __construct()
    {
        $this->items = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getKey(): string { return $this->key; }
    public function setKey(string $v): static { $this->key = $v; return $this; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $v): static { $this->title = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }
    public function getSection(): ?MenuSection { return $this->section; }
    public function setSection(?MenuSection $v): static { $this->section = $v; return $this; }

    /** @return Collection<int, MenuItem> */
    public function getItems(): Collection { return $this->items; }

    public function addItem(MenuItem $i): static
    {
        if (!$this->items->contains($i)) {
            $this->items->add($i);
            $i->setCategory($this);
        }
        return $this;
    }

    public function removeItem(MenuItem $i): static
    {
        if ($this->items->removeElement($i) && $i->getCategory() === $this) {
            $i->setCategory(null);
        }
        return $this;
    }

    public function __toString(): string { return $this->title; }
}
