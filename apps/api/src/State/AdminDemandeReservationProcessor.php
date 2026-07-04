<?php

namespace App\State;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\Validator\Exception\ValidationException;
use App\Entity\DemandeReservation;
use App\Enum\DemandeReservationStatus;
use App\Message\PushReservationToShiftly;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Messenger\MessageBusInterface;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;

/**
 * Processor du PATCH admin sur DemandeReservation :
 *   1. Valide la transition de statut (machine d'état — cf. enum).
 *   2. Stamp le timestamp correspondant (`internalContactedAt`, etc.).
 *   3. Délègue le persist au processor Doctrine standard.
 *
 * @implements ProcessorInterface<DemandeReservation, DemandeReservation>
 */
final class AdminDemandeReservationProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: PersistProcessor::class)]
        private readonly ProcessorInterface $persistProcessor,
        private readonly MessageBusInterface $bus,
        private readonly LoggerInterface $logger,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof DemandeReservation) {
            throw new \LogicException('AdminDemandeReservationProcessor attend une DemandeReservation.');
        }

        $statusChanged = false;

        $previousData = $context['previous_data'] ?? null;
        if ($previousData instanceof DemandeReservation) {
            $previousStatus = $previousData->getStatus();
            $newStatus = $data->getStatus();

            if (!$previousStatus->canTransitionTo($newStatus)) {
                $this->throwValidation(
                    'status',
                    sprintf(
                        'Transition %s → %s non autorisée. Transitions valides depuis %s : %s.',
                        $previousStatus->value,
                        $newStatus->value,
                        $previousStatus->value,
                        $this->describeAllowed($previousStatus),
                    ),
                );
            }

            // Stamp la transition (poser une seule fois ; ré-écrire la même
            // valeur si on PATCH avec un status identique au précédent est
            // un no-op du côté metier — on ne touche pas au stamp existant).
            if ($newStatus !== $previousStatus) {
                $statusChanged = true;
                $now = new \DateTimeImmutable();
                match ($newStatus) {
                    DemandeReservationStatus::Contacte => $data->setInternalContactedAt($now),
                    DemandeReservationStatus::Confirme => $data->setInternalConfirmedAt($now),
                    DemandeReservationStatus::Refuse => $data->setInternalRefusedAt($now),
                    DemandeReservationStatus::Passe => $data->setInternalPassedAt($now),
                    default => null,
                };
            }
        }

        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        // Remonter le NOUVEAU statut vers Shiftly (v1.1) — APRÈS le flush, hors
        // transaction, async best-effort : même mécanisme qu'à la création
        // (même sourceRef → Shiftly upsert, pas de doublon). Un changement de
        // statut ne doit jamais échouer si Shiftly est indisponible.
        if ($statusChanged && $data->getId() !== null) {
            try {
                $this->bus->dispatch(new PushReservationToShiftly($data->getId()));
            } catch (\Throwable $e) {
                $this->logger->error('Dispatch push Shiftly (transition statut) KO', [
                    'ref' => $data->getReference(),
                    'err' => $e->getMessage(),
                ]);
            }
        }

        return $result;
    }

    private function describeAllowed(DemandeReservationStatus $from): string
    {
        $allowed = $from->allowedNextStates();
        if ($allowed === []) {
            return '(terminal — aucune)';
        }
        return implode(', ', array_map(static fn(DemandeReservationStatus $s) => $s->value, $allowed));
    }

    private function throwValidation(string $path, string $message): never
    {
        $violations = new ConstraintViolationList([
            new ConstraintViolation($message, $message, [], null, $path, null),
        ]);
        throw new ValidationException($violations);
    }
}
