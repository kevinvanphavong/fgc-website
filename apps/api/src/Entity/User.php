<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'app_user')]
#[ORM\HasLifecycleCallbacks]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    public const ROLE_STAFF = 'ROLE_STAFF';
    public const ROLE_MANAGER = 'ROLE_MANAGER';
    public const ROLE_ADMIN = 'ROLE_ADMIN';
    /** Espace client public (parents anniv + contacts B2B). Indépendant des rôles staff. */
    public const ROLE_CLIENT = 'ROLE_CLIENT';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private string $email = '';

    /** @var list<string> */
    #[ORM\Column(type: 'json')]
    private array $roles = [self::ROLE_STAFF];

    #[ORM\Column]
    private string $password = '';

    #[ORM\Column(length: 80, nullable: true)]
    private ?string $firstName = null;

    #[ORM\Column(length: 80, nullable: true)]
    private ?string $lastName = null;

    #[ORM\Column(length: 20, nullable: true)]
    private ?string $phone = null;

    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private bool $acceptNewsletter = false;

    /** Gradient CSS consommé par <Avatar /> côté Next. */
    #[ORM\Column(length: 120, nullable: true)]
    private ?string $avatarColor = null;

    #[ORM\Column(type: 'boolean', options: ['default' => true])]
    private bool $enabled = true;

    /** Token réinitialisation mot de passe — invité OU oubli (V2). */
    #[ORM\Column(length: 64, nullable: true, unique: true)]
    private ?string $resetToken = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $resetTokenExpiresAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $lastLoginAt = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        $this->createdAt ??= new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getEmail(): string { return $this->email; }
    public function setEmail(string $v): static { $this->email = $v; return $this; }

    public function getUserIdentifier(): string { return $this->email; }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';
        return array_values(array_unique($roles));
    }

    /** @return list<string> Rôles bruts (sans ROLE_USER ajouté). */
    public function getRawRoles(): array
    {
        return $this->roles;
    }

    public function setRoles(array $v): static { $this->roles = array_values($v); return $this; }

    public function getPassword(): string { return $this->password; }
    public function setPassword(string $v): static { $this->password = $v; return $this; }

    public function getFirstName(): ?string { return $this->firstName; }
    public function setFirstName(?string $v): static { $this->firstName = $v; return $this; }

    public function getLastName(): ?string { return $this->lastName; }
    public function setLastName(?string $v): static { $this->lastName = $v; return $this; }

    public function getPhone(): ?string { return $this->phone; }
    public function setPhone(?string $v): static { $this->phone = $v; return $this; }

    public function isAcceptNewsletter(): bool { return $this->acceptNewsletter; }
    public function setAcceptNewsletter(bool $v): static { $this->acceptNewsletter = $v; return $this; }

    public function isClient(): bool { return in_array(self::ROLE_CLIENT, $this->roles, true); }
    public function isStaff(): bool
    {
        return in_array(self::ROLE_STAFF, $this->roles, true)
            || in_array(self::ROLE_MANAGER, $this->roles, true)
            || in_array(self::ROLE_ADMIN, $this->roles, true);
    }

    public function getAvatarColor(): ?string { return $this->avatarColor; }
    public function setAvatarColor(?string $v): static { $this->avatarColor = $v; return $this; }

    public function isEnabled(): bool { return $this->enabled; }
    public function setEnabled(bool $v): static { $this->enabled = $v; return $this; }

    public function getResetToken(): ?string { return $this->resetToken; }
    public function setResetToken(?string $v): static { $this->resetToken = $v; return $this; }

    public function getResetTokenExpiresAt(): ?\DateTimeImmutable { return $this->resetTokenExpiresAt; }
    public function setResetTokenExpiresAt(?\DateTimeImmutable $v): static { $this->resetTokenExpiresAt = $v; return $this; }

    public function isResetTokenValid(): bool
    {
        return $this->resetToken !== null
            && $this->resetTokenExpiresAt instanceof \DateTimeImmutable
            && $this->resetTokenExpiresAt > new \DateTimeImmutable();
    }

    public function getLastLoginAt(): ?\DateTimeImmutable { return $this->lastLoginAt; }
    public function setLastLoginAt(?\DateTimeImmutable $v): static { $this->lastLoginAt = $v; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }

    public function getFullName(): string
    {
        $parts = array_filter([$this->firstName, $this->lastName]);
        return $parts ? implode(' ', $parts) : $this->email;
    }

    public function eraseCredentials(): void {}

    public function __toString(): string { return $this->getFullName(); }
}
