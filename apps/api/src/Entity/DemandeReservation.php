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
use App\Dto\BirthdayReservationInput;
use App\Enum\DemandeReservationStatus;
use App\State\AdminDemandeReservationProcessor;
use App\State\BirthdayReservationProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Demande de réservation anniversaire enfant. V1 sans paiement (CLAUDE.md §11) :
 *   le tunnel POST → entité créée avec status `nouveau`, mails envoyés,
 *   le gérant rappelle sous 24h pour valider la date et organiser l'acompte.
 *
 * Pas exposée en ApiResource ici : l'écriture passe par
 *   POST /api/reservations/anniversaire → BirthdayReservationInput DTO
 *   → BirthdayReservationProcessor → instancie + persist cette entité.
 * La lecture admin viendra en PR5 (back-office gestion demandes).
 */
#[ORM\Entity(repositoryClass: \App\Repository\DemandeReservationRepository::class)]
#[ORM\Table(name: 'demande_reservation')]
#[ORM\Index(name: 'idx_event_slot', columns: ['event_date', 'time_slot'])]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        // Public — création depuis le tunnel anniv (PR10). Réservation en mode
        // INVITÉ (décision Kévin 2026-07-04, retour arrière sur le login
        // obligatoire) : nom + email + coordonnées suffisent, pas de compte
        // requis. Si un client est connecté, la demande lui est rattachée
        // (optionnel, cf. BirthdayReservationProcessor).
        new Post(
            uriTemplate: '/reservations/anniversaire',
            input: BirthdayReservationInput::class,
            processor: BirthdayReservationProcessor::class,
            denormalizationContext: ['groups' => ['anniv:write']],
            normalizationContext: ['groups' => ['anniv:read']],
        ),

        // Admin — gestion des demandes (PR5). uriTemplate explicite
        // pour ne pas se faire écraser par d'autres ops (cf. GOTCHAS #6).
        new GetCollection(
            uriTemplate: '/admin/demandes-reservation',
            security: "is_granted('ROLE_STAFF')",
            normalizationContext: ['groups' => ['demande:admin:read']],
            order: ['createdAt' => 'DESC'],
            paginationItemsPerPage: 25,
        ),
        new Get(
            uriTemplate: '/admin/demandes-reservation/{id}',
            // `\d+` indispensable pour ne pas capturer /demandes-reservation/stats
            // qui est servi par DemandeReservationStatsController.
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            normalizationContext: ['groups' => ['demande:admin:read']],
        ),
        new Patch(
            uriTemplate: '/admin/demandes-reservation/{id}',
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            denormalizationContext: ['groups' => ['demande:admin:write']],
            normalizationContext: ['groups' => ['demande:admin:read']],
            processor: AdminDemandeReservationProcessor::class,
        ),
    ],
)]
#[ApiFilter(SearchFilter::class, properties: [
    'status' => 'exact',
    'reference' => 'partial',
    'parentLastName' => 'partial',
    'parentFirstName' => 'partial',
    'parentEmail' => 'partial',
    'childName' => 'partial',
    'formuleKey' => 'exact',
])]
#[ApiFilter(DateFilter::class, properties: ['createdAt', 'eventDate'])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt', 'eventDate', 'status'])]
class DemandeReservation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['anniv:read', 'demande:admin:read'])]
    private ?int $id = null;

    /** Référence FGC-XXXXXX (alphabet sans confusion : I/O/0/1 exclus). */
    #[ORM\Column(length: 12, unique: true)]
    #[Groups(['anniv:read', 'demande:admin:read'])]
    private string $reference = '';

    #[ORM\Column(length: 20, enumType: DemandeReservationStatus::class)]
    #[Groups(['anniv:read', 'demande:admin:read', 'demande:admin:write'])]
    private DemandeReservationStatus $status = DemandeReservationStatus::Nouveau;

    /** FK logique vers AnnivCard.key (newbowler|superbowler|probowler). */
    #[ORM\Column(length: 50)]
    #[Groups(['anniv:read', 'demande:admin:read'])]
    private string $formuleKey = '';

    #[ORM\Column(type: 'date_immutable')]
    #[Groups(['anniv:read', 'demande:admin:read'])]
    private ?\DateTimeImmutable $eventDate = null;

    /** Format `HH:mm` (10:00, 14:00, 14:30, 16:00, 16:30, 17:00). */
    #[ORM\Column(length: 5)]
    #[Groups(['anniv:read', 'demande:admin:read'])]
    private string $timeSlot = '';

    #[ORM\Column(length: 80)]
    #[Groups(['demande:admin:read'])]
    private string $childName = '';

    #[ORM\Column(type: 'smallint')]
    #[Groups(['demande:admin:read'])]
    private int $childAge = 0;

    #[ORM\Column(type: 'smallint')]
    #[Groups(['demande:admin:read'])]
    private int $kidsCount = 0;

    #[ORM\Column(length: 300, nullable: true)]
    #[Groups(['demande:admin:read'])]
    private ?string $cakeNote = null;

    #[ORM\Column(length: 300, nullable: true)]
    #[Groups(['demande:admin:read'])]
    private ?string $allergies = null;

    #[ORM\Column(length: 80)]
    #[Groups(['demande:admin:read'])]
    private string $parentFirstName = '';

    #[ORM\Column(length: 80)]
    #[Groups(['demande:admin:read'])]
    private string $parentLastName = '';

    #[ORM\Column(length: 180)]
    #[Groups(['demande:admin:read'])]
    private string $parentEmail = '';

    #[ORM\Column(length: 20)]
    #[Groups(['demande:admin:read'])]
    private string $parentPhone = '';

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['demande:admin:read'])]
    private ?string $source = null;

    #[ORM\Column(length: 1000, nullable: true)]
    #[Groups(['demande:admin:read'])]
    private ?string $message = null;

    #[ORM\Column]
    #[Groups(['demande:admin:read'])]
    private bool $acceptCGV = false;

    #[ORM\Column]
    #[Groups(['demande:admin:read'])]
    private bool $acceptNewsletter = false;

    /** Upsell VR coché à l'étape 3 (CLAUDE.md §11). Tracé pour analyse. */
    #[ORM\Column]
    #[Groups(['demande:admin:read'])]
    private bool $upsellVR = false;

    /** Snapshot du prix unitaire en centimes au moment de la demande
     *  (la formule peut changer après — on garde la trace). */
    #[ORM\Column(type: 'integer', options: ['default' => 0])]
    #[Groups(['demande:admin:read'])]
    private int $unitPriceCentsSnapshot = 0;

    /** Note libre du gérant (transcrip d'appel, etc.). */
    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['demande:admin:read', 'demande:admin:write'])]
    #[Assert\Length(max: 2000)]
    private ?string $adminNote = null;

    // Stamps de transition — posés automatiquement par AdminDemandeReservationProcessor.
    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['demande:admin:read'])]
    private ?\DateTimeImmutable $internalContactedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['demande:admin:read'])]
    private ?\DateTimeImmutable $internalConfirmedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['demande:admin:read'])]
    private ?\DateTimeImmutable $internalRefusedAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    #[Groups(['demande:admin:read'])]
    private ?\DateTimeImmutable $internalPassedAt = null;

    /**
     * Rattachement (optionnel) à un compte client. Posé à l'INSERT si un user
     * `ROLE_CLIENT` est authentifié au moment du POST. Pas exposé en Groups :
     * la lecture pour /api/me/reservations passe par MeController, pas par
     * la back-ref User.reservations (gotcha #4 : eager loading boucle infinie).
     */
    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id', nullable: true, onDelete: 'SET NULL')]
    private ?User $user = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['anniv:read', 'demande:admin:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['demande:admin:read'])]
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
    public function getStatus(): DemandeReservationStatus { return $this->status; }
    public function setStatus(DemandeReservationStatus $v): static { $this->status = $v; return $this; }
    public function getFormuleKey(): string { return $this->formuleKey; }
    public function setFormuleKey(string $v): static { $this->formuleKey = $v; return $this; }
    public function getEventDate(): ?\DateTimeImmutable { return $this->eventDate; }
    public function setEventDate(?\DateTimeImmutable $v): static { $this->eventDate = $v; return $this; }
    public function getTimeSlot(): string { return $this->timeSlot; }
    public function setTimeSlot(string $v): static { $this->timeSlot = $v; return $this; }
    public function getChildName(): string { return $this->childName; }
    public function setChildName(string $v): static { $this->childName = $v; return $this; }
    public function getChildAge(): int { return $this->childAge; }
    public function setChildAge(int $v): static { $this->childAge = $v; return $this; }
    public function getKidsCount(): int { return $this->kidsCount; }
    public function setKidsCount(int $v): static { $this->kidsCount = $v; return $this; }
    public function getCakeNote(): ?string { return $this->cakeNote; }
    public function setCakeNote(?string $v): static { $this->cakeNote = $v; return $this; }
    public function getAllergies(): ?string { return $this->allergies; }
    public function setAllergies(?string $v): static { $this->allergies = $v; return $this; }
    public function getParentFirstName(): string { return $this->parentFirstName; }
    public function setParentFirstName(string $v): static { $this->parentFirstName = $v; return $this; }
    public function getParentLastName(): string { return $this->parentLastName; }
    public function setParentLastName(string $v): static { $this->parentLastName = $v; return $this; }
    public function getParentEmail(): string { return $this->parentEmail; }
    public function setParentEmail(string $v): static { $this->parentEmail = $v; return $this; }
    public function getParentPhone(): string { return $this->parentPhone; }
    public function setParentPhone(string $v): static { $this->parentPhone = $v; return $this; }
    public function getSource(): ?string { return $this->source; }
    public function setSource(?string $v): static { $this->source = $v; return $this; }
    public function getMessage(): ?string { return $this->message; }
    public function setMessage(?string $v): static { $this->message = $v; return $this; }
    public function isAcceptCGV(): bool { return $this->acceptCGV; }
    public function setAcceptCGV(bool $v): static { $this->acceptCGV = $v; return $this; }
    public function isAcceptNewsletter(): bool { return $this->acceptNewsletter; }
    public function setAcceptNewsletter(bool $v): static { $this->acceptNewsletter = $v; return $this; }
    public function isUpsellVR(): bool { return $this->upsellVR; }
    public function setUpsellVR(bool $v): static { $this->upsellVR = $v; return $this; }
    public function getUnitPriceCentsSnapshot(): int { return $this->unitPriceCentsSnapshot; }
    public function setUnitPriceCentsSnapshot(int $v): static { $this->unitPriceCentsSnapshot = $v; return $this; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $v): static { $this->user = $v; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function getAdminNote(): ?string { return $this->adminNote; }
    public function setAdminNote(?string $v): static { $this->adminNote = $v; return $this; }
    public function getInternalContactedAt(): ?\DateTimeImmutable { return $this->internalContactedAt; }
    public function setInternalContactedAt(?\DateTimeImmutable $v): static { $this->internalContactedAt = $v; return $this; }
    public function getInternalConfirmedAt(): ?\DateTimeImmutable { return $this->internalConfirmedAt; }
    public function setInternalConfirmedAt(?\DateTimeImmutable $v): static { $this->internalConfirmedAt = $v; return $this; }
    public function getInternalRefusedAt(): ?\DateTimeImmutable { return $this->internalRefusedAt; }
    public function setInternalRefusedAt(?\DateTimeImmutable $v): static { $this->internalRefusedAt = $v; return $this; }
    public function getInternalPassedAt(): ?\DateTimeImmutable { return $this->internalPassedAt; }
    public function setInternalPassedAt(?\DateTimeImmutable $v): static { $this->internalPassedAt = $v; return $this; }

    public function getTotalCents(): int
    {
        return $this->unitPriceCentsSnapshot * $this->kidsCount;
    }

    public function getParentFullName(): string
    {
        return trim($this->parentFirstName.' '.$this->parentLastName);
    }
}
