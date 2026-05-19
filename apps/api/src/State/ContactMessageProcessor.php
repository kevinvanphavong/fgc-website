<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Dto\ContactMessageInput;
use App\Entity\ContactMessage;
use App\Enum\ContactMessageStatus;
use App\Enum\ContactSubject;
use App\Service\ContactMessageMailer;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;

/**
 * @implements ProcessorInterface<ContactMessageInput, ContactMessage>
 */
final class ContactMessageProcessor implements ProcessorInterface
{
    private const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ContactMessageMailer $mailer,
        private readonly LoggerInterface $logger,
        private readonly RequestStack $requestStack,
        #[Autowire(service: 'limiter.contact_post')]
        private readonly RateLimiterFactory $postLimiter,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof ContactMessageInput) {
            throw new \LogicException('Processor attend un ContactMessageInput.');
        }

        $request = $this->requestStack->getCurrentRequest();
        $consume = $this->postLimiter
            ->create($request?->getClientIp() ?? 'anonymous')
            ->consume();
        if (!$consume->isAccepted()) {
            throw new TooManyRequestsHttpException();
        }

        $entity = (new ContactMessage())
            ->setReference($this->generateReference())
            ->setStatus(ContactMessageStatus::Nouveau)
            ->setName($data->name)
            ->setEmail($data->email)
            ->setPhone($data->phone ?: null)
            ->setSubject(ContactSubject::from($data->subject))
            ->setMessage($data->message)
            ->setAcceptRgpd($data->acceptRgpd);

        $this->em->persist($entity);
        $this->em->flush();

        // Mails best-effort.
        try {
            $this->mailer->sendAdminNotification($entity);
        } catch (\Throwable $e) {
            $this->logger->error('Mail admin contact KO', ['ref' => $entity->getReference(), 'err' => $e->getMessage()]);
        }
        try {
            $this->mailer->sendClientConfirmation($entity);
        } catch (\Throwable $e) {
            $this->logger->error('Mail client contact KO', ['ref' => $entity->getReference(), 'err' => $e->getMessage()]);
        }

        return $entity;
    }

    private function generateReference(): string
    {
        $out = 'FGC-CT-';
        $max = strlen(self::REF_ALPHABET) - 1;
        for ($i = 0; $i < 6; $i++) {
            $out .= self::REF_ALPHABET[random_int(0, $max)];
        }
        return $out;
    }
}
