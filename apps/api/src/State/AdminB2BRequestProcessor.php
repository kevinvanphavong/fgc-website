<?php

namespace App\State;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use ApiPlatform\Validator\Exception\ValidationException;
use App\Entity\B2BRequest;
use App\Enum\B2BStage;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Validator\ConstraintViolation;
use Symfony\Component\Validator\ConstraintViolationList;

/**
 * Processor du PATCH admin sur B2BRequest :
 *   1. Valide la transition de stage (machine d'état — cf. B2BStage).
 *   2. Stamp le timestamp correspondant.
 *   3. Délègue le persist au processor Doctrine standard.
 *
 * @implements ProcessorInterface<B2BRequest, B2BRequest>
 */
final class AdminB2BRequestProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: PersistProcessor::class)]
        private readonly ProcessorInterface $persistProcessor,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof B2BRequest) {
            throw new \LogicException('AdminB2BRequestProcessor attend une B2BRequest.');
        }

        $previousData = $context['previous_data'] ?? null;
        if ($previousData instanceof B2BRequest) {
            $previousStage = $previousData->getStage();
            $newStage = $data->getStage();

            if (!$previousStage->canTransitionTo($newStage)) {
                $this->throwValidation(
                    'stage',
                    sprintf(
                        'Transition %s → %s non autorisée. Transitions valides depuis %s : %s.',
                        $previousStage->value,
                        $newStage->value,
                        $previousStage->value,
                        $this->describeAllowed($previousStage),
                    ),
                );
            }

            if ($newStage !== $previousStage) {
                $now = new \DateTimeImmutable();
                match ($newStage) {
                    B2BStage::Qualifie => $data->setInternalQualifiedAt($now),
                    B2BStage::DevisEnvoye => $data->setInternalQuotedAt($now),
                    B2BStage::Negociation => $data->setInternalNegotiatedAt($now),
                    B2BStage::Gagne, B2BStage::Perdu => $data->setInternalClosedAt($now),
                    default => null,
                };
            }
        }

        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }

    private function describeAllowed(B2BStage $from): string
    {
        $allowed = $from->allowedNextStates();
        if ($allowed === []) {
            return '(terminal — aucune)';
        }
        return implode(', ', array_map(static fn(B2BStage $s) => $s->value, $allowed));
    }

    private function throwValidation(string $path, string $message): never
    {
        $violations = new ConstraintViolationList([
            new ConstraintViolation($message, $message, [], null, $path, null),
        ]);
        throw new ValidationException($violations);
    }
}
