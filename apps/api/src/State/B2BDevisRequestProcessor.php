<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\B2BDevisRequestInput;
use App\Entity\B2BRequest;
use App\Enum\B2BStage;
use App\Enum\B2BType;
use App\Service\B2BDevisMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;

/**
 * @implements ProcessorInterface<B2BDevisRequestInput, B2BRequest>
 */
final class B2BDevisRequestProcessor implements ProcessorInterface
{
    /** Caractères de la référence FGC-B2B-XXXXXX (sans confusion I/O/0/1). */
    private const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly B2BDevisMailer $mailer,
        private readonly LoggerInterface $logger,
        private readonly RequestStack $requestStack,
        #[Autowire(service: 'limiter.b2b_devis_post')]
        private readonly RateLimiterFactory $postLimiter,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof B2BDevisRequestInput) {
            throw new \LogicException('Processor attend un B2BDevisRequestInput.');
        }

        $request = $this->requestStack->getCurrentRequest();
        $consume = $this->postLimiter
            ->create($request?->getClientIp() ?? 'anonymous')
            ->consume();
        if (!$consume->isAccepted()) {
            throw new TooManyRequestsHttpException();
        }

        $eventDate = null;
        if ($data->eventDate !== null && $data->eventDate !== '') {
            $eventDate = \DateTimeImmutable::createFromFormat('!Y-m-d', $data->eventDate) ?: null;
        }

        $b2b = (new B2BRequest())
            ->setReference($this->generateReference())
            ->setStage(B2BStage::Nouveau)
            ->setType(B2BType::from($data->type))
            ->setCompanyName($data->companyName)
            ->setContactFirstName($data->contactFirstName)
            ->setContactLastName($data->contactLastName)
            ->setContactEmail($data->contactEmail)
            ->setContactPhone($data->contactPhone)
            ->setEventDate($eventDate)
            ->setExpectedAttendees($data->expectedAttendees)
            ->setMessage($data->message ?: null)
            ->setAcceptRgpd($data->acceptRgpd);

        $this->em->persist($b2b);
        $this->em->flush();

        // Mails best-effort — un échec ne rollback PAS la demande.
        try {
            $this->mailer->sendAdminNotification($b2b);
        } catch (\Throwable $e) {
            $this->logger->error('Mail admin B2B KO', ['ref' => $b2b->getReference(), 'err' => $e->getMessage()]);
        }
        try {
            $this->mailer->sendClientConfirmation($b2b);
        } catch (\Throwable $e) {
            $this->logger->error('Mail client B2B KO', ['ref' => $b2b->getReference(), 'err' => $e->getMessage()]);
        }

        return $b2b;
    }

    private function generateReference(): string
    {
        $out = 'FGC-B2B-';
        $max = strlen(self::REF_ALPHABET) - 1;
        for ($i = 0; $i < 6; $i++) {
            $out .= self::REF_ALPHABET[random_int(0, $max)];
        }
        return $out;
    }
}
