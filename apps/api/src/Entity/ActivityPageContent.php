<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    operations: [
        new GetCollection(uriTemplate: '/activites'),
        new Get(uriTemplate: '/activites/{slug}', uriVariables: ['slug']),
        new GetCollection(security: "is_granted('ROLE_STAFF')"),
        new Get(security: "is_granted('ROLE_STAFF')"),
        new Post(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['activity:write']]),
        new Put(security: "is_granted('ROLE_STAFF')", denormalizationContext: ['groups' => ['activity:write']]),
        new Delete(security: "is_granted('ROLE_STAFF')"),
    ]),
    ],
    normalizationContext: ['groups' => ['activity:read']],
    order: ['slug' => 'ASC'],
    paginationEnabled: false,
)]
class ActivityPageContent
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[Groups(['activity:read'])]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 50, unique: true)]
    #[Groups(['activity:read', 'activity:write'])]
    #[Assert\NotBlank]
    private string $slug = '';

    #[ORM\Column(length: 255)]
    #[Groups(['activity:read', 'activity:write'])]
    #[Assert\NotBlank]
    private string $image = '';

    #[ORM\Column(length: 255)]
    #[Groups(['activity:read', 'activity:write'])]
    private string $imageAlt = '';

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['activity:read', 'activity:write'])]
    private ?string $inlinePriceAmount = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['activity:read', 'activity:write'])]
    private ?string $inlinePriceDescription = null;

    /** @var array<int, string> */
    #[ORM\Column(type: 'json')]
    #[Groups(['activity:read', 'activity:write'])]
    private array $features = [];

    /** @var array<int, array<string, mixed>> */
    #[ORM\Column(type: 'json')]
    #[Groups(['activity:read', 'activity:write'])]
    private array $priceCards = [];

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['activity:read', 'activity:write'])]
    private ?string $pricingEyebrow = null;

    #[ORM\Column(length: 150, nullable: true)]
    #[Groups(['activity:read', 'activity:write'])]
    private ?string $pricingTitle = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['activity:read', 'activity:write'])]
    private ?string $pricingLead = null;

    public function getId(): ?int { return $this->id; }
    public function getSlug(): string { return $this->slug; }
    public function setSlug(string $v): static { $this->slug = $v; return $this; }
    public function getImage(): string { return $this->image; }
    public function setImage(string $v): static { $this->image = $v; return $this; }
    public function getImageAlt(): string { return $this->imageAlt; }
    public function setImageAlt(string $v): static { $this->imageAlt = $v; return $this; }
    public function getInlinePriceAmount(): ?string { return $this->inlinePriceAmount; }
    public function setInlinePriceAmount(?string $v): static { $this->inlinePriceAmount = $v; return $this; }
    public function getInlinePriceDescription(): ?string { return $this->inlinePriceDescription; }
    public function setInlinePriceDescription(?string $v): static { $this->inlinePriceDescription = $v; return $this; }
    public function getFeatures(): array { return $this->features; }
    public function setFeatures(array $v): static { $this->features = $v; return $this; }
    public function getPriceCards(): array { return $this->priceCards; }
    public function setPriceCards(array $v): static { $this->priceCards = $v; return $this; }
    public function getPricingEyebrow(): ?string { return $this->pricingEyebrow; }
    public function setPricingEyebrow(?string $v): static { $this->pricingEyebrow = $v; return $this; }
    public function getPricingTitle(): ?string { return $this->pricingTitle; }
    public function setPricingTitle(?string $v): static { $this->pricingTitle = $v; return $this; }
    public function getPricingLead(): ?string { return $this->pricingLead; }
    public function setPricingLead(?string $v): static { $this->pricingLead = $v; return $this; }

    public function __toString(): string { return $this->slug; }
}
