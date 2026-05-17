<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
class MenuCategory
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    #[Groups(['menu:read'])]
    private string $key = '';

    #[ORM\Column(length: 150)]
    #[Groups(['menu:read'])]
    private string $title = '';

    #[ORM\Column]
    private int $position = 0;

    #[ORM\ManyToOne(targetEntity: MenuSection::class, inversedBy: 'columns')]
    #[ORM\JoinColumn(nullable: false)]
    private ?MenuSection $section = null;

    /** @var Collection<int, MenuItem> */
    #[ORM\OneToMany(targetEntity: MenuItem::class, mappedBy: 'category', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    #[Groups(['menu:read'])]
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
