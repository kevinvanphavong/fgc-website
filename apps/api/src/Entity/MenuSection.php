<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [new GetCollection(uriTemplate: '/menu')],
    normalizationContext: ['groups' => ['menu:read']],
    order: ['position' => 'ASC'],
    paginationEnabled: false,
)]
class MenuSection
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['menu:read'])]
    private string $key = '';

    #[ORM\Column(length: 150)]
    #[Groups(['menu:read'])]
    private string $eyebrow = '';

    #[ORM\Column(length: 150)]
    #[Groups(['menu:read'])]
    private string $title = '';

    #[ORM\Column(length: 150)]
    #[Groups(['menu:read'])]
    private string $titleAccent = '';

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['menu:read'])]
    private ?string $lead = null;

    #[ORM\Column]
    private int $position = 0;

    /** @var Collection<int, MenuCategory> */
    #[ORM\OneToMany(targetEntity: MenuCategory::class, mappedBy: 'section', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    #[Groups(['menu:read'])]
    private Collection $columns;

    public function __construct()
    {
        $this->columns = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getKey(): string { return $this->key; }
    public function setKey(string $v): static { $this->key = $v; return $this; }
    public function getEyebrow(): string { return $this->eyebrow; }
    public function setEyebrow(string $v): static { $this->eyebrow = $v; return $this; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $v): static { $this->title = $v; return $this; }
    public function getTitleAccent(): string { return $this->titleAccent; }
    public function setTitleAccent(string $v): static { $this->titleAccent = $v; return $this; }
    public function getLead(): ?string { return $this->lead; }
    public function setLead(?string $v): static { $this->lead = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    /** @return Collection<int, MenuCategory> */
    public function getColumns(): Collection { return $this->columns; }

    public function addColumn(MenuCategory $c): static
    {
        if (!$this->columns->contains($c)) {
            $this->columns->add($c);
            $c->setSection($this);
        }
        return $this;
    }

    public function removeColumn(MenuCategory $c): static
    {
        if ($this->columns->removeElement($c) && $c->getSection() === $this) {
            $c->setSection(null);
        }
        return $this;
    }

    public function __toString(): string { return $this->title . $this->titleAccent; }
}
