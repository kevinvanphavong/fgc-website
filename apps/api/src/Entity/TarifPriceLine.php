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
        new Post(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['tarif:write']]),
        new Put(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['tarif:write']]),
        new Delete(security: "is_granted('ROLE_STAFF')"),
    ],
    normalizationContext: ['groups' => ['tarif:read']],
    paginationEnabled: false,
)]
#[ORM\Entity]
#[ORM\Table(name: 'tarif_price_line')]
class TarifPriceLine
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[Groups(['tarif:read'])]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 150)]
    #[Groups(['tarif:read', 'tarif:write'])]
    #[Assert\NotBlank]
    private string $label = '';

    #[ORM\Column(length: 50)]
    #[Groups(['tarif:read', 'tarif:write'])]
    #[Assert\NotBlank]
    private string $price = '';

    #[ORM\Column]
    #[Groups(['tarif:read', 'tarif:write'])]
    private int $position = 0;

    // tarifCard : non exposé en API. Le TarifPriceLine s'édite via la
    // collection `prices` de TarifCard (cascade persist).
    // Cf. note sur MenuCategory::section.
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
