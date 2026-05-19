<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use App\Enum\MediaTag;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Bibliothèque média uploadée par le back-office (PR7).
 *
 * Storage local V1 : `public/uploads/medias/{yyyy}/{mm}/{slug}.{ext}` —
 * cf. `MediaUploader`. Pas de relation ManyToOne back-référencée dans User
 * (gotcha #4 : `User.uploadedMedias` PAS exposée en Groups).
 *
 * POST = controller dédié `MediaUploadController` (multipart) ; le reste
 * passe par ApiResource.
 */
#[ORM\Entity(repositoryClass: \App\Repository\MediaRepository::class)]
#[ORM\Table(name: 'media')]
#[ORM\Index(name: 'idx_media_tag_created', columns: ['tag', 'created_at'])]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        // GETs admin uniquement (le POST est sur un controller dédié pour
        // simplifier le multipart — gotcha si bloqué cf. prompt § "Si bloqué").
        new GetCollection(
            uriTemplate: '/admin/medias',
            security: "is_granted('ROLE_STAFF')",
            normalizationContext: ['groups' => ['media:admin:read']],
            order: ['createdAt' => 'DESC'],
            paginationItemsPerPage: 24,
        ),
        new Get(
            uriTemplate: '/admin/medias/{id}',
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            normalizationContext: ['groups' => ['media:admin:read']],
        ),
        new Patch(
            uriTemplate: '/admin/medias/{id}',
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            denormalizationContext: ['groups' => ['media:admin:write']],
            normalizationContext: ['groups' => ['media:admin:read']],
        ),
        new Delete(
            uriTemplate: '/admin/medias/{id}',
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            // La suppression du fichier disque est gérée par MediaDeleteSubscriber.
        ),
    ],
)]
#[ApiFilter(SearchFilter::class, properties: ['tag' => 'exact'])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt'])]
class Media
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['media:admin:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['media:admin:read'])]
    private string $filename = '';

    #[ORM\Column(length: 255)]
    #[Groups(['media:admin:read'])]
    private string $originalName = '';

    #[ORM\Column(length: 50)]
    #[Groups(['media:admin:read'])]
    private string $mimeType = '';

    #[ORM\Column(type: 'integer')]
    #[Groups(['media:admin:read'])]
    private int $sizeBytes = 0;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['media:admin:read'])]
    private ?int $width = null;

    #[ORM\Column(type: 'integer', nullable: true)]
    #[Groups(['media:admin:read'])]
    private ?int $height = null;

    #[ORM\Column(length: 20, enumType: MediaTag::class)]
    #[Groups(['media:admin:read', 'media:admin:write'])]
    #[Assert\NotNull]
    private MediaTag $tag = MediaTag::Global;

    /** URL publique relative — buildée par MediaUploader. */
    #[ORM\Column(length: 500)]
    #[Groups(['media:admin:read'])]
    private string $url = '';

    /** Chemin disque absolu (utilisé par DELETE pour purger). */
    #[ORM\Column(length: 500)]
    private string $diskPath = '';

    #[ORM\ManyToOne(targetEntity: User::class)]
    #[ORM\JoinColumn(nullable: true, onDelete: 'SET NULL')]
    // PAS dans Groups — back-ref non exposée (gotcha #4).
    private ?User $uploadedBy = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['media:admin:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt ??= new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getFilename(): string { return $this->filename; }
    public function setFilename(string $v): static { $this->filename = $v; return $this; }
    public function getOriginalName(): string { return $this->originalName; }
    public function setOriginalName(string $v): static { $this->originalName = $v; return $this; }
    public function getMimeType(): string { return $this->mimeType; }
    public function setMimeType(string $v): static { $this->mimeType = $v; return $this; }
    public function getSizeBytes(): int { return $this->sizeBytes; }
    public function setSizeBytes(int $v): static { $this->sizeBytes = $v; return $this; }
    public function getWidth(): ?int { return $this->width; }
    public function setWidth(?int $v): static { $this->width = $v; return $this; }
    public function getHeight(): ?int { return $this->height; }
    public function setHeight(?int $v): static { $this->height = $v; return $this; }
    public function getTag(): MediaTag { return $this->tag; }
    public function setTag(MediaTag $v): static { $this->tag = $v; return $this; }
    public function getUrl(): string { return $this->url; }
    public function setUrl(string $v): static { $this->url = $v; return $this; }
    public function getDiskPath(): string { return $this->diskPath; }
    public function setDiskPath(string $v): static { $this->diskPath = $v; return $this; }
    public function getUploadedBy(): ?User { return $this->uploadedBy; }
    public function setUploadedBy(?User $v): static { $this->uploadedBy = $v; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
}
