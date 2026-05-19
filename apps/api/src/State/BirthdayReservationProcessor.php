<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\Validator\Exception\ValidationException;
use App\Dto\BirthdayReservationInput;
use App\Entity\AnnivCard;
use App\Entity\DemandeReservation;
use App\Entity\User;
use App\Enum\DemandeReservationStatus;
use App\Repository\DemandeReservationRepository;
use App\Service\BirthdayReservationMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\ConflictHttpException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;

/**
 * @implements ProcessorInterface<BirthdayReservationInput, DemandeReservation>
 */
final class BirthdayReservationProcessor implements ProcessorInterface
{
    /** Caractères de la référence FGC-XXXXXX (sans confusion I/O/0/1). */
    private const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly DemandeReservationRepository $repo,
        private readonly BirthdayReservationMailer $mailer,
        private readonly LoggerInterface $logger,
        private readonly RequestStack $requestStack,
        #[Autowire(service: 'limiter.anniv_post')]
        private readonly RateLimiterFactory $postLimiter,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof BirthdayReservationInput) {
            throw new \LogicException('Processor attend un BirthdayReservationInput.');
        }

        $request = $this->requestStack->getCurrentRequest();
        $consume = $this->postLimiter
            ->create($request?->getClientIp() ?? 'anonymous')
            ->consume();
        if (!$consume->isAccepted()) {
            throw new TooManyRequestsHttpException();
        }

        $eventDate = \DateTimeImmutable::createFromFormat('!Y-m-d', $data->eventDate);
        if (!$eventDate instanceof \DateTimeImmutable) {
            // Normalement déjà attrapé par Assert\Regex sur le DTO, garde-fou.
            throw new \LogicException('eventDate format invalide arrivé jusqu\'au Processor.');
        }

        $formule = $this->em->getRepository(AnnivCard::class)->findOneBy(['key' => $data->formuleKey]);
        if ($formule === null) {
            // Choice + EM cohérents : ne devrait pas arriver, mais on couvre.
            $this->throwValidation('formuleKey', 'Formule inconnue.');
        }

        // Cross-field DB : kidsCount ≥ minKids — sécurité serveur même si le DTO
        // a déjà sa propre validation côté front (CLAUDE.md §6.4 : « assume-le »).
        if ($data->kidsCount < $formule->getMinKids()) {
            $this->throwValidation(
                'kidsCount',
                sprintf('Minimum %d enfants pour la formule %s.', $formule->getMinKids(), $formule->getName()),
            );
        }

        // Conflit créneau : 409 si une demande active occupe déjà (date, slot).
        if ($this->repo->isSlotTaken($eventDate, $data->timeSlot)) {
            throw new ConflictHttpException(
                sprintf('Créneau %s du %s déjà réservé.', $data->timeSlot, $eventDate->format('d/m/Y')),
            );
        }

        $reservation = (new DemandeReservation())
            ->setReference($this->generateReference())
            ->setStatus(DemandeReservationStatus::Nouveau)
            ->setFormuleKey($data->formuleKey)
            ->setEventDate($eventDate)
            ->setTimeSlot($data->timeSlot)
            ->setChildName($data->childName)
            ->setChildAge($data->childAge)
            ->setKidsCount($data->kidsCount)
            ->setCakeNote($data->cakeNote)
            ->setAllergies($data->allergies)
            ->setParentFirstName($data->parentFirstName)
            ->setParentLastName($data->parentLastName)
            ->setParentEmail($data->parentEmail)
            ->setParentPhone($data->parentPhone)
            ->setSource($data->source ?: null)
            ->setMessage($data->message ?: null)
            ->setAcceptCGV($data->acceptCGV)
            ->setAcceptNewsletter($data->acceptNewsletter)
            ->setUpsellVR($data->upsellVR)
            ->setUnitPriceCentsSnapshot($formule->getUnitPriceCents());

        // Rattachement à un compte client connecté (cookie client_token forwardé).
        $authUser = $this->security->getUser();
        if ($authUser instanceof User && $authUser->isClient()) {
            $reservation->setUser($authUser);
        }

        $this->em->persist($reservation);
        $this->em->flush();

        // Mails best-effort — un échec ne rollback PAS la résa (CLAUDE.md §11) :
        // le gérant rappellera de toute façon, on log et on continue.
        try {
            $this->mailer->sendAdminNotification($reservation, $formule);
        } catch (\Throwable $e) {
            $this->logger->error('Mail admin anniv KO', ['ref' => $reservation->getReference(), 'err' => $e->getMessage()]);
        }
        try {
            $this->mailer->sendClientConfirmation($reservation, $formule);
        } catch (\Throwable $e) {
            $this->logger->error('Mail client anniv KO', ['ref' => $reservation->getReference(), 'err' => $e->getMessage()]);
        }

        return $reservation;
    }

    private function generateReference(): string
    {
        // 6 chars sur l'alphabet sans confusion → 31^6 ≈ 887M combinaisons.
        // Probabilité de collision négligeable au volume V1. Si un jour le
        // gérant fait 100k résas/an, ajouter un retry sur UniqueConstraint.
        $out = 'FGC-';
        $max = strlen(self::REF_ALPHABET) - 1;
        for ($i = 0; $i < 6; $i++) {
            $out .= self::REF_ALPHABET[random_int(0, $max)];
        }
        return $out;
    }

    private function throwValidation(string $path, string $message): never
    {
        $violations = new ConstraintViolationList([
            new ConstraintViolation($message, $message, [], null, $path, null),
        ]);
        throw new ValidationException($violations);
    }
}
