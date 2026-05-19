<?php

namespace App\State;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\Validator\Exception\ValidationException;
use App\Entity\ContactMessage;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;

/**
 * Processor du PATCH admin sur ContactMessage (PR9 finitions).
 * Valide la transition de statut via `canTransitionTo()` puis délègue le persist.
 * Pas de stamp internal*At ici — l'historique est volontairement simple.
 *
 * @implements ProcessorInterface<ContactMessage, ContactMessage>
 */
final class AdminContactMessageProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: PersistProcessor::class)]
        private readonly ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof ContactMessage) {
            throw new \LogicException('AdminContactMessageProcessor attend un ContactMessage.');
        }

        $previous = $context['previous_data'] ?? null;
        if ($previous instanceof ContactMessage) {
            $from = $previous->getStatus();
            $to = $data->getStatus();
            if (!$from->canTransitionTo($to)) {
                $message = sprintf('Transition %s → %s non autorisée.', $from->value, $to->value);
                $violations = new ConstraintViolationList([
                    new ConstraintViolation($message, $message, [], null, 'status', null),
                ]);
                throw new ValidationException($violations);
            }
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}
