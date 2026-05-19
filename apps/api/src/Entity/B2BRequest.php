<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\DateFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Dto\B2BDevisRequestInput;
use App\Enum\B2BStage;
use App\Enum\B2BType;
use App\State\AdminB2BRequestProcessor;
use App\State\B2BDevisRequestProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Demande de devis B2B (séminaire / team-building / soirée / arbre de Noël…).
 * V1 sans génération de PDF — l'admin envoie un devis par mail externe.
 *
 *   POST /api/entreprises/devis  (public)    → création stage `nouveau`
 *   GET  /api/admin/b2b-requests           (admin)    → listing Kanban
 *   GET  /api/admin/b2b-requests/{id}      (admin)
 *   PATCH /api/admin/b2b-requests/{id}     (admin)    → transition + adminNote + estimatedValueCents
 */
#[ORM\Entity(repositoryClass: \App\Repository\B2BRequestRepository::class)]
#[ORM\Table(name: 'b2b_request')]
#[ORM\Index(name: 'idx_b2b_stage_created', columns: ['stage', 'created_at'])]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        // Public — création depuis le formulaire /entreprises.
        new Post(
            uriTemplate: '/entreprises/devis',
            input: B2BDevisRequestInput::class,
            processor: B2BDevisRequestProcessor::class,
            denormalizationContext: ['groups' => ['b2b:write']],
            normalizationContext: ['groups' => ['b2b:read']],
        ),

        // Admin — uriTemplate explicite pour ne pas se faire écraser (GOTCHAS #6).
        new GetCollection(
            uriTemplate: '/admin/b2b-requests',
            security: "is_granted('ROLE_STAFF')",
            normalizationContext: ['groups' => ['b2b:admin:read']],
            order: ['createdAt' => 'DESC'],
            paginationItemsPerPage: 25,
        ),
        new Get(
            uriTemplate: '/admin/b2b-requests/{id}',
            // `\d+` indispensable pour ne pas capturer /b2b-requests/stats.
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            normalizationContext: ['groups' => ['b2b:admin:read']],
        ),
        new Patch(
            uriTemplate: '/admin/b2b-requests/{id}',
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            denormalizationContext: ['groups' => ['b2b:admin:write']],
            normalizationContext: ['groups' => ['b2b:admin:read']],
            processor: AdminB2BRequestProcessor::class,
        ),
    ],
)]
#[ApiFilter(SearchFilter::class, properties: [
    'stage' => 'exact',
    'type' => 'exact',
    'reference' => 'partial',
    'companyName' => 'partial',
    'contactLastName' => 'partial',
    'contactEmail' => 'partial',
])]
#[ApiFilter(DateFilter::class, properties: ['createdAt', 'eventDate'])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt', 'eventDate', 'stage', 'estimatedValueCents'])]
class B2BRequest
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['b2b:read', 'b2b:admin:read'])]
    private ?int $id = null;

    /** Référence FGC-B2B-XXXXXX (alphabet sans confusion). */
    #[ORM\Column(length: 16, unique: true)]
    #[Groups(['b2b:read', 'b2b:admin:read'])]
    private string $reference = '';

    #[ORM\Column(length: 20, enumType: B2BStage::class)]
    #[Groups(['b2b:read', 'b2b:admin:read', 'b2b:admin:write'])]
    private B2BStage $stage = B2BStage::Nouveau;

    #[ORM\Column(length: 30, enumType: B2BType::class)]
    #[Groups(['b2b:read', 'b2b:admin:read'])]
    private B2BType $type = B2BType::Autre;

    #[ORM\Column(length: 120)]
    #[Groups(['b2b:admin:read'])]
    private string $companyName = '';

    #[ORM\Column(length: 80)]
    #[Groups(['b2b:admin:read'])]
    private string $contactFirstName = '';

    #[ORM\Column(length: 80)]
    #[Groups(['b2b:admin:read'])]
    private string $contactLastName = '';

    #[ORM\Column(length: 180)]
    #[Groups(['b2b:admin:read'])]
    private string $contactEmail = '';

    #[ORM\Column(length: 20)]
    #[Groups(['b2b:admin:read'])]
    private string $contactPhone = '';

    #[ORM\Column(type: 'date_immutable', nullable: true)]
    #[Groups(['b2b:admin:read'])]
    private ?\DateTimeImmutable $eventDate = null;

    #[ORM\Column(type: 'smallint')]
    #[Groups(['b2b:admin:read'])]
    private int $expectedAttendees = 0;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['b2b:admin:read'])]
    private ?string $message = null;

    /** Valeur estimée du devis, posée par l'admin après qualification. */
    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['b2b:admin:read', 'b2b:admin:write'])]
    #[Assert\Range(min: 0, max: 1_000_000_00)]
    private ?int $estimatedValueCents = null;

    /** Note libre du gérant (transcription d'appel, contraintes, etc.). */
    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['b2b:admin:read', 'b2b:admin:write'])]
    #[Assert\Length(max: 2000)]
    private ?string $adminNote = null;

    #[ORM\Column]
    #[Groups(['b2b:admin:read'])]
    private bool $acceptRgpd = false;

    // Stamps internes — posés par AdminB2BRequestProcessor à chaque transition.
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['b2b:admin:read'])]
    private ?\DateTimeImmutable $internalQualifiedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['b2b:admin:read'])]
    private ?\DateTimeImmutable $internalQuotedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['b2b:admin:read'])]
    private ?\DateTimeImmutable $internalNegotiatedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['b2b:admin:read'])]
    private ?\DateTimeImmutable $internalClosedAt = null;

    /**
     * Rattachement (optionnel) à un compte client. Posé à l'INSERT si un user
     * `ROLE_CLIENT` est authentifié au moment du POST. Pas exposé en Groups
     * (back-ref non exposée, cf. GOTCHAS #4).
     */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['b2b:read', 'b2b:admin:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['b2b:admin:read'])]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $now = new \DateTimeImmutable();
        $this->createdAt ??= $now;
        $this->updatedAt ??= $now;
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getReference(): string { return $this->reference; }
    public function setReference(string $v): static { $this->reference = $v; return $this; }
    public function getStage(): B2BStage { return $this->stage; }
    public function setStage(B2BStage $v): static { $this->stage = $v; return $this; }
    public function getType(): B2BType { return $this->type; }
    public function setType(B2BType $v): static { $this->type = $v; return $this; }
    public function getCompanyName(): string { return $this->companyName; }
    public function setCompanyName(string $v): static { $this->companyName = $v; return $this; }
    public function getContactFirstName(): string { return $this->contactFirstName; }
    public function setContactFirstName(string $v): static { $this->contactFirstName = $v; return $this; }
    public function getContactLastName(): string { return $this->contactLastName; }
    public function setContactLastName(string $v): static { $this->contactLastName = $v; return $this; }
    public function getContactEmail(): string { return $this->contactEmail; }
    public function setContactEmail(string $v): static { $this->contactEmail = $v; return $this; }
    public function getContactPhone(): string { return $this->contactPhone; }
    public function setContactPhone(string $v): static { $this->contactPhone = $v; return $this; }
    public function getEventDate(): ?\DateTimeImmutable { return $this->eventDate; }
    public function setEventDate(?\DateTimeImmutable $v): static { $this->eventDate = $v; return $this; }
    public function getExpectedAttendees(): int { return $this->expectedAttendees; }
    public function setExpectedAttendees(int $v): static { $this->expectedAttendees = $v; return $this; }
    public function getMessage(): ?string { return $this->message; }
    public function setMessage(?string $v): static { $this->message = $v; return $this; }
    public function getEstimatedValueCents(): ?int { return $this->estimatedValueCents; }
    public function setEstimatedValueCents(?int $v): static { $this->estimatedValueCents = $v; return $this; }
    public function getAdminNote(): ?string { return $this->adminNote; }
    public function setAdminNote(?string $v): static { $this->adminNote = $v; return $this; }
    public function isAcceptRgpd(): bool { return $this->acceptRgpd; }
    public function setAcceptRgpd(bool $v): static { $this->acceptRgpd = $v; return $this; }
    public function getInternalQualifiedAt(): ?\DateTimeImmutable { return $this->internalQualifiedAt; }
    public function setInternalQualifiedAt(?\DateTimeImmutable $v): static { $this->internalQualifiedAt = $v; return $this; }
    public function getInternalQuotedAt(): ?\DateTimeImmutable { return $this->internalQuotedAt; }
    public function setInternalQuotedAt(?\DateTimeImmutable $v): static { $this->internalQuotedAt = $v; return $this; }
    public function getInternalNegotiatedAt(): ?\DateTimeImmutable { return $this->internalNegotiatedAt; }
    public function setInternalNegotiatedAt(?\DateTimeImmutable $v): static { $this->internalNegotiatedAt = $v; return $this; }
    public function getInternalClosedAt(): ?\DateTimeImmutable { return $this->internalClosedAt; }
    public function setInternalClosedAt(?\DateTimeImmutable $v): static { $this->internalClosedAt = $v; return $this; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $v): static { $this->user = $v; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }

    public function getContactFullName(): string
    {
        return trim($this->contactFirstName.' '.$this->contactLastName);
    }
}
