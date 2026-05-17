<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [new GetCollection(uriTemplate: '/offres')],
    normalizationContext: ['groups' => ['offer:read']],
    order: ['position' => 'ASC'],
    paginationEnabled: false,
)]
class Offer
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['offer:read'])]
    private string $key = '';

    #[ORM\Column(length: 255)]
    #[Groups(['offer:read'])]
    private string $image = '';

    #[ORM\Column(length: 150)]
    #[Groups(['offer:read'])]
    private string $title = '';

    #[ORM\Column(length: 50)]
    #[Groups(['offer:read'])]
    private string $badge = '';

    #[ORM\Column(length: 20)]
    #[Groups(['offer:read'])]
    private string $badgeVariant = 'yellow';

    #[ORM\Column(length: 200)]
    #[Groups(['offer:read'])]
    private string $href = '';

    #[ORM\Column]
    private int $position = 0;

    public function getId(): ?int { return $this->id; }
    public function getKey(): string { return $this->key; }
    public function setKey(string $v): static { $this->key = $v; return $this; }
    public function getImage(): string { return $this->image; }
    public function setImage(string $v): static { $this->image = $v; return $this; }
    public function getTitle(): string { return $this->title; }
    public function setTitle(string $v): static { $this->title = $v; return $this; }
    public function getBadge(): string { return $this->badge; }
    public function setBadge(string $v): static { $this->badge = $v; return $this; }
    public function getBadgeVariant(): string { return $this->badgeVariant; }
    public function setBadgeVariant(string $v): static { $this->badgeVariant = $v; return $this; }
    public function getHref(): string { return $this->href; }
    public function setHref(string $v): static { $this->href = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    public function __toString(): string { return $this->title; }
}
