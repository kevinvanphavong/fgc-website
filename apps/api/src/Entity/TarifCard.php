<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Validator\Constraints as Assert;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'tarif_card')]
#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/formules/tarifs'),
        new Get(uriTemplate: '/formules/tarifs/{id}', uriVariables: ['id']),
        new GetCollection(security: "is_granted('ROLE_STAFF')"),
        new Get(security: "is_granted('ROLE_STAFF')"),
        new Post(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['tarif:write']]),
        new Put(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['tarif:write']]),
        new Delete(security: "is_granted('ROLE_STAFF')"),
    ],
    normalizationContext: ['groups' => ['tarif:read']],
    order: ['position' => 'ASC'],
    paginationEnabled: false,
)]
#[ApiFilter(SearchFilter::class, properties: ['cardGroup' => 'exact'])]
class TarifCard
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[Groups(['tarif:read'])]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 20)]
    #[Groups(['tarif:read', 'tarif:write'])]
    private string $cardGroup = 'activites';

    #[ORM\Column(length: 10)]
    #[Groups(['tarif:read', 'tarif:write'])]
    private string $icon = '';

    #[ORM\Column(length: 100)]
    #[Groups(['tarif:read', 'tarif:write'])]
    #[Assert\NotBlank]
    private string $name = '';

    #[ORM\Column(length: 150)]
    #[Groups(['tarif:read', 'tarif:write'])]
    #[Assert\NotBlank]
    private string $unit = '';

    #[ORM\Column(length: 500, nullable: true)]
    #[Groups(['tarif:read', 'tarif:write'])]
    private ?string $note = null;

    #[ORM\Column]
    #[Groups(['tarif:read', 'tarif:write'])]
    private int $position = 0;

    /** @var Collection<int, TarifPriceLine> */
    #[ORM\OneToMany(targetEntity: TarifPriceLine::class, mappedBy: 'tarifCard', cascade: ['persist', 'remove'], orphanRemoval: true)]
    #[ORM\OrderBy(['position' => 'ASC'])]
    #[Groups(['tarif:read', 'tarif:write'])]
    private Collection $prices;

    public function __construct()
    {
        $this->prices = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }
    public function getCardGroup(): string { return $this->cardGroup; }
    public function setCardGroup(string $v): static { $this->cardGroup = $v; return $this; }
    public function getIcon(): string { return $this->icon; }
    public function setIcon(string $v): static { $this->icon = $v; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $v): static { $this->name = $v; return $this; }
    public function getUnit(): string { return $this->unit; }
    public function setUnit(string $v): static { $this->unit = $v; return $this; }
    public function getNote(): ?string { return $this->note; }
    public function setNote(?string $v): static { $this->note = $v; return $this; }
    public function getPosition(): int { return $this->position; }
    public function setPosition(int $v): static { $this->position = $v; return $this; }

    /** @return Collection<int, TarifPriceLine> */
    public function getPrices(): Collection { return $this->prices; }

    public function addPrice(TarifPriceLine $p): static
    {
        if (!$this->prices->contains($p)) {
            $this->prices->add($p);
            $p->setTarifCard($this);
        }
        return $this;
    }

    public function removePrice(TarifPriceLine $p): static
    {
        if ($this->prices->removeElement($p) && $p->getTarifCard() === $this) {
            $p->setTarifCard(null);
        }
        return $this;
    }

    public function __toString(): string { return $this->icon . ' ' . $this->name; }
}
