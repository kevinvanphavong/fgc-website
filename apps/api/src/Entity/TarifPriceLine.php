<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'tarif_price_line')]
class TarifPriceLine
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Groups(['tarif:read'])]
    private string $label = '';

    #[ORM\Column(length: 50)]
    #[Groups(['tarif:read'])]
    private string $price = '';

    #[ORM\Column]
    private int $position = 0;

    #[ORM\ManyToOne(targetEntity: TarifCard::class, inversedBy: 'prices')]
    #[ORM\JoinColumn(nullable: false)]
    private ?TarifCard $tarifCard = null;

    public function getId(): ?int { return $this->id; }
    public function getLabel(): string { return $this->label; }
    public function setLabel(string $v): static { $this->label = $v; return $this; }
    public function getPrice(): string { return $this->price; }
    public function setPrice(string $v): static { $this->price = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }
    public function getTarifCard(): ?TarifCard { return $this->tarifCard; }
    public function setTarifCard(?TarifCard $v): static { $this->tarifCard = $v; return $this; }

    public function __toString(): string { return $this->label . ' — ' . $this->price; }
}
