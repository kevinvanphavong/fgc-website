<?php

namespace App\Controller\Api;

use App\Entity\B2BRequest;
use App\Entity\DemandeReservation;
use App\Entity\User;
use App\Enum\B2BStage;
use App\Enum\DemandeReservationStatus;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

/**
 * Endpoints espace client connecté (PR11) :
 *   - GET    /api/me                       — profil
 *   - PATCH  /api/me                       — édite firstName/lastName/phone/acceptNewsletter
 *   - POST   /api/me/change-password
 *   - DELETE /api/me                       — anonymisation (jamais hard delete)
 *   - GET    /api/me/reservations          — agrège anniv + b2b
 *
 * Tous protégés par ROLE_CLIENT (cf. security.yaml access_control).
 */
#[Route('/api/me')]
#[IsGranted('ROLE_CLIENT')]
class MeController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly UserPasswordHasherInterface $hasher,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('', name: 'api_me_get', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->currentUser();
        return new JsonResponse($this->serializeMe($user));
    }

    #[Route('', name: 'api_me_patch', methods: ['PATCH'])]
    public function patchMe(Request $request): JsonResponse
    {
        $user = $this->currentUser();

        $contentType = (string) $request->headers->get('Content-Type', '');
        if (!str_contains($contentType, 'merge-patch+json') && !str_contains($contentType, 'application/json')) {
            return new JsonResponse(['error' => 'Content-Type doit être application/merge-patch+json ou application/json.'], 415);
        }

        try {
            $payload = json_decode((string) $request->getContent(), true, flags: JSON_THROW_ON_ERROR) ?? [];
        } catch (\JsonException) {
            return new JsonResponse(['error' => 'JSON invalide.'], 400);
        }

        // Champs autorisés uniquement.
        $allowed = ['firstName', 'lastName', 'phone', 'acceptNewsletter'];
        foreach (array_keys($payload) as $key) {
            if (!in_array($key, $allowed, true)) {
                return new JsonResponse([
                    'violations' => [['propertyPath' => $key, 'message' => 'Champ non éditable via /me.']],
                    'detail' => 'Validation failed.',
                ], 422);
            }
        }

        if (array_key_exists('firstName', $payload)) {
            $fn = trim((string) $payload['firstName']);
            $v = $this->validator->validate($fn, [new Assert\NotBlank(message: 'Prénom requis.'), new Assert\Length(max: 80)]);
            if (count($v) > 0) return $this->violations422('firstName', (string) $v[0]->getMessage());
            $user->setFirstName($fn);
        }
        if (array_key_exists('lastName', $payload)) {
            $ln = trim((string) $payload['lastName']);
            $v = $this->validator->validate($ln, [new Assert\NotBlank(message: 'Nom requis.'), new Assert\Length(max: 80)]);
            if (count($v) > 0) return $this->violations422('lastName', (string) $v[0]->getMessage());
            $user->setLastName($ln);
        }
        if (array_key_exists('phone', $payload)) {
            $phone = $payload['phone'] !== null ? trim((string) $payload['phone']) : null;
            if ($phone !== null && $phone !== '') {
                if (!preg_match('/^(?:(?:\+33|0)\s?[1-9](?:[\s.\-]?\d{2}){4})$/', $phone)) {
                    return $this->violations422('phone', 'Numéro de téléphone français attendu.');
                }
                $user->setPhone($phone);
            } else {
                $user->setPhone(null);
            }
        }
        if (array_key_exists('acceptNewsletter', $payload)) {
            $user->setAcceptNewsletter((bool) $payload['acceptNewsletter']);
        }

        $this->em->flush();

        return new JsonResponse($this->serializeMe($user));
    }

    #[Route('/change-password', name: 'api_me_change_password', methods: ['POST'])]
    public function changePassword(Request $request): JsonResponse
    {
        $user = $this->currentUser();

        try {
            $payload = json_decode((string) $request->getContent(), true, flags: JSON_THROW_ON_ERROR) ?? [];
        } catch (\JsonException) {
            return new JsonResponse(['error' => 'JSON invalide.'], 400);
        }

        $current = (string) ($payload['currentPassword'] ?? '');
        $new = (string) ($payload['newPassword'] ?? '');

        if (!$this->hasher->isPasswordValid($user, $current)) {
            return $this->violations422('currentPassword', 'Mot de passe actuel incorrect.');
        }

        if (strlen($new) < 10 || !preg_match('/[A-Z]/', $new) || !preg_match('/[0-9]/', $new)) {
            return $this->violations422('newPassword', 'Mot de passe : 10 caractères, une majuscule et un chiffre minimum.');
        }

        $user->setPassword($this->hasher->hashPassword($user, $new));
        $this->em->flush();

        return new JsonResponse(['ok' => true]);
    }

    #[Route('', name: 'api_me_delete', methods: ['DELETE'])]
    public function deleteMe(): JsonResponse
    {
        $user = $this->currentUser();

        // Anonymisation : on garde l'user enregistré (pour ne pas casser les FK
        // sur DemandeReservation/B2BRequest qui sont en SET NULL onDelete mais
        // dont l'historique métier reste pertinent côté admin).
        // L'email original des résa est figé à la création (parentEmail/contactEmail),
        // donc côté admin la traçabilité reste intacte.
        $user
            ->setEmail(sprintf('deleted-%d@deleted.fgc', $user->getId()))
            ->setFirstName(null)
            ->setLastName(null)
            ->setPhone(null)
            ->setAcceptNewsletter(false)
            ->setEnabled(false)
            ->setResetToken(null)
            ->setResetTokenExpiresAt(null);

        $this->em->flush();

        return new JsonResponse(['ok' => true]);
    }

    #[Route('/reservations', name: 'api_me_reservations', methods: ['GET'])]
    public function reservations(Request $request): JsonResponse
    {
        $user = $this->currentUser();
        $email = mb_strtolower($user->getEmail());

        // Anniv : userId OU parentEmail match (résa créée avant inscription).
        $anniv = $this->em->createQueryBuilder()
            ->select('d')
            ->from(DemandeReservation::class, 'd')
            ->where('d.user = :user')
            ->orWhere('LOWER(d.parentEmail) = :email')
            ->setParameter('user', $user)
            ->setParameter('email', $email)
            ->orderBy('d.eventDate', 'DESC')
            ->getQuery()
            ->getResult();

        // B2B idem.
        $b2b = $this->em->createQueryBuilder()
            ->select('b')
            ->from(B2BRequest::class, 'b')
            ->where('b.user = :user')
            ->orWhere('LOWER(b.contactEmail) = :email')
            ->setParameter('user', $user)
            ->setParameter('email', $email)
            ->orderBy('b.eventDate', 'DESC')
            ->getQuery()
            ->getResult();

        $items = [];
        /** @var DemandeReservation $d */
        foreach ($anniv as $d) {
            $items[] = [
                'kind' => 'anniv',
                'id' => $d->getId(),
                'reference' => $d->getReference(),
                'status' => $d->getStatus()->value,
                'statusLabel' => $this->annivStatusLabel($d->getStatus()),
                'eventDate' => $d->getEventDate()?->format('Y-m-d'),
                'timeSlot' => $d->getTimeSlot(),
                'summary' => sprintf(
                    'Anniversaire de %s · %d enfants · %s',
                    $d->getChildName(),
                    $d->getKidsCount(),
                    ucfirst($d->getFormuleKey()),
                ),
                'totalCents' => $d->getKidsCount() * $d->getUnitPriceCentsSnapshot(),
                'createdAt' => $d->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            ];
        }
        /** @var B2BRequest $b */
        foreach ($b2b as $b) {
            $items[] = [
                'kind' => 'b2b',
                'id' => $b->getId(),
                'reference' => $b->getReference(),
                'status' => $b->getStage()->value,
                'statusLabel' => $this->b2bStageLabel($b->getStage()),
                'eventDate' => $b->getEventDate()?->format('Y-m-d'),
                'timeSlot' => null,
                'summary' => sprintf(
                    '%s · %s · %d personnes',
                    $b->getCompanyName(),
                    $b->getType()->value,
                    $b->getExpectedAttendees(),
                ),
                'totalCents' => $b->getEstimatedValueCents(),
                'createdAt' => $b->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            ];
        }

        // Tri : eventDate DESC (null en dernier), createdAt DESC en tie-break.
        usort($items, function ($a, $b) {
            $da = $a['eventDate'] ?? '0000-00-00';
            $db = $b['eventDate'] ?? '0000-00-00';
            if ($da === $db) {
                return strcmp((string) ($b['createdAt'] ?? ''), (string) ($a['createdAt'] ?? ''));
            }
            return strcmp($db, $da);
        });

        $page = max(1, (int) $request->query->get('page', '1'));
        $perPage = 25;
        $total = count($items);
        $slice = array_slice($items, ($page - 1) * $perPage, $perPage);

        return new JsonResponse([
            'items' => $slice,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
        ]);
    }

    private function currentUser(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException();
        }
        return $user;
    }

    private function serializeMe(User $u): array
    {
        return [
            'id' => $u->getId(),
            'email' => $u->getEmail(),
            'firstName' => $u->getFirstName(),
            'lastName' => $u->getLastName(),
            'fullName' => $u->getFullName(),
            'phone' => $u->getPhone(),
            'acceptNewsletter' => $u->isAcceptNewsletter(),
            'createdAt' => $u->getCreatedAt()?->format(\DateTimeInterface::ATOM),
            'roles' => $u->getRoles(),
        ];
    }

    private function violations422(string $field, string $message): JsonResponse
    {
        return new JsonResponse([
            'violations' => [['propertyPath' => $field, 'message' => $message]],
            'detail' => 'Validation failed.',
        ], 422);
    }

    private function annivStatusLabel(DemandeReservationStatus $s): string
    {
        return match ($s) {
            DemandeReservationStatus::Nouveau => 'En attente de validation',
            DemandeReservationStatus::Contacte => 'Contacté par l\'équipe',
            DemandeReservationStatus::Confirme => 'Confirmé',
            DemandeReservationStatus::Refuse => 'Refusé',
            DemandeReservationStatus::Passe => 'Passé',
        };
    }

    private function b2bStageLabel(B2BStage $s): string
    {
        return match ($s) {
            B2BStage::Nouveau => 'Nouvelle demande',
            B2BStage::Qualifie => 'Qualifié',
            B2BStage::DevisEnvoye => 'Devis envoyé',
            B2BStage::Negociation => 'En négociation',
            B2BStage::Gagne => 'Gagné',
            B2BStage::Perdu => 'Perdu',
        };
    }
}
