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
use App\Dto\ContactMessageInput;
use App\Enum\ContactMessageStatus;
use App\Enum\ContactSubject;
use App\State\AdminContactMessageProcessor;
use App\State\ContactMessageProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * Message du formulaire /contact (PR9 finitions). Pattern aligné PR10/PR6 :
 *   POST public via DTO + Processor, GET/Patch admin via ApiResource + machine d'état.
 */
#[ORM\Entity(repositoryClass: \App\Repository\ContactMessageRepository::class)]
#[ORM\Table(name: 'contact_message')]
#[ORM\Index(name: 'idx_contact_status_created', columns: ['status', 'created_at'])]
#[ORM\HasLifecycleCallbacks]
#[ApiResource(
    operations: [
        // Public — création depuis /contact.
        new Post(
            uriTemplate: '/contact',
            input: ContactMessageInput::class,
            processor: ContactMessageProcessor::class,
            denormalizationContext: ['groups' => ['contact:write']],
            normalizationContext: ['groups' => ['contact:read']],
        ),

        // Admin — uriTemplate explicite (gotcha #6).
        new GetCollection(
            uriTemplate: '/admin/contact-messages',
            security: "is_granted('ROLE_STAFF')",
            normalizationContext: ['groups' => ['contact:admin:read']],
            order: ['createdAt' => 'DESC'],
            paginationItemsPerPage: 25,
        ),
        new Get(
            uriTemplate: '/admin/contact-messages/{id}',
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            normalizationContext: ['groups' => ['contact:admin:read']],
        ),
        new Patch(
            uriTemplate: '/admin/contact-messages/{id}',
            requirements: ['id' => '\d+'],
            security: "is_granted('ROLE_STAFF')",
            denormalizationContext: ['groups' => ['contact:admin:write']],
            normalizationContext: ['groups' => ['contact:admin:read']],
            processor: AdminContactMessageProcessor::class,
        ),
    ],
)]
#[ApiFilter(SearchFilter::class, properties: [
    'status' => 'exact',
    'subject' => 'exact',
    'name' => 'partial',
    'email' => 'partial',
])]
#[ApiFilter(DateFilter::class, properties: ['createdAt'])]
#[ApiFilter(OrderFilter::class, properties: ['createdAt', 'status'])]
class ContactMessage
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['contact:read', 'contact:admin:read'])]
    private ?int $id = null;

    /** Référence FGC-CT-XXXXXX. */
    #[ORM\Column(length: 16, unique: true)]
    #[Groups(['contact:read', 'contact:admin:read'])]
    private string $reference = '';

    #[ORM\Column(length: 20, enumType: ContactMessageStatus::class)]
    #[Groups(['contact:admin:read', 'contact:admin:write'])]
    private ContactMessageStatus $status = ContactMessageStatus::Nouveau;

    #[ORM\Column(length: 120)]
    #[Groups(['contact:admin:read'])]
    private string $name = '';

    #[ORM\Column(length: 180)]
    #[Groups(['contact:admin:read'])]
    private string $email = '';

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['contact:admin:read'])]
    private ?string $phone = null;

    #[ORM\Column(length: 20, enumType: ContactSubject::class)]
    #[Groups(['contact:admin:read'])]
    private ContactSubject $subject = ContactSubject::Autre;

    #[ORM\Column(type: 'text')]
    #[Groups(['contact:admin:read'])]
    private string $message = '';

    #[ORM\Column]
    #[Groups(['contact:admin:read'])]
    private bool $acceptRgpd = false;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['contact:admin:read', 'contact:admin:write'])]
    #[Assert\Length(max: 2000)]
    private ?string $adminNote = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['contact:read', 'contact:admin:read'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt ??= new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }
    public function getReference(): string { return $this->reference; }
    public function setReference(string $v): static { $this->reference = $v; return $this; }
    public function getStatus(): ContactMessageStatus { return $this->status; }
    public function setStatus(ContactMessageStatus $v): static { $this->status = $v; return $this; }
    public function getName(): string { return $this->name; }
    public function setName(string $v): static { $this->name = $v; return $this; }
    public function getEmail(): string { return $this->email; }
    public function setEmail(string $v): static { $this->email = $v; return $this; }
    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $v): static { $this->phone = $v; return $this; }
    public function getSubject(): ContactSubject { return $this->subject; }
    public function setSubject(ContactSubject $v): static { $this->subject = $v; return $this; }
    public function getMessage(): string { return $this->message; }
    public function setMessage(string $v): static { $this->message = $v; return $this; }
    public function isAcceptRgpd(): bool { return $this->acceptRgpd; }
    public function setAcceptRgpd(bool $v): static { $this->acceptRgpd = $v; return $this; }
    public function getAdminNote(): ?string { return $this->adminNote; }
    public function setAdminNote(?string $v): static { $this->adminNote = $v; return $this; }
    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
}
