<?php

namespace App\Repository;

use App\Entity\B2BRequest;
use App\Enum\B2BStage;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<B2BRequest>
 */
class B2BRequestRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, B2BRequest::class);
    }

    /**
     * Stats pipeline B2B :
     *   - counts par stage (couvre tous les stages, même à 0),
     *   - openCount (somme stages ouverts),
     *   - openValueCents (somme estimatedValueCents sur les stages ouverts),
     *   - wonValueCentsThisQuarter,
     *   - conversionRate (gagne / (gagne + perdu)),
     *   - avgResponseTimeMinutes (createdAt → internalQualifiedAt, sur les
     *     demandes effectivement qualifiées).
     *
     * @return array{
     *     byStage: array<string, int>,
     *     openCount: int,
     *     openValueCents: int,
     *     wonValueCentsThisQuarter: int,
     *     conversionRate: float,
     *     avgResponseTimeMinutes: int|null,
     * }
     */
    public function getAdminStats(): array
    {
        // 1. byStage : count + sum.
        $rows = $this->createQueryBuilder('b')
            ->select('b.stage AS stage, COUNT(b.id) AS cnt, COALESCE(SUM(b.estimatedValueCents), 0) AS val')
            ->groupBy('b.stage')
            ->getQuery()
            ->getArrayResult();

        $byStage = [];
        foreach (B2BStage::cases() as $case) {
            $byStage[$case->value] = 0;
        }
        $valueByStage = $byStage;
        foreach ($rows as $row) {
            $key = $row['stage'] instanceof B2BStage ? $row['stage']->value : (string) $row['stage'];
            $byStage[$key] = (int) $row['cnt'];
            $valueByStage[$key] = (int) $row['val'];
        }

        $openValueCents = 0;
        $openCount = 0;
        foreach (B2BStage::openStages() as $open) {
            $openCount += $byStage[$open->value] ?? 0;
            $openValueCents += $valueByStage[$open->value] ?? 0;
        }

        // 2. wonValueCentsThisQuarter : SUM gagne sur trim. courant.
        $startOfQuarter = $this->startOfCurrentQuarter();
        $wonValueCentsThisQuarter = (int) $this->createQueryBuilder('b')
            ->select('COALESCE(SUM(b.estimatedValueCents), 0)')
            ->where('b.stage = :stage')
            ->andWhere('b.internalClosedAt >= :start')
            ->setParameter('stage', B2BStage::Gagne)
            ->setParameter('start', $startOfQuarter)
            ->getQuery()
            ->getSingleScalarResult();

        // 3. conversionRate = gagne / (gagne + perdu).
        $gagne = $byStage[B2BStage::Gagne->value] ?? 0;
        $perdu = $byStage[B2BStage::Perdu->value] ?? 0;
        $closed = $gagne + $perdu;
        $conversionRate = $closed > 0 ? round($gagne / $closed, 4) : 0.0;

        // 4. avgResponseTimeMinutes : moyenne minutes createdAt → qualifie.
        // En SQL natif pour rester portable (Doctrine DQL n'a pas EXTRACT EPOCH).
        $sql = <<<SQL
            SELECT AVG(EXTRACT(EPOCH FROM (internal_qualified_at - created_at)) / 60) AS avg_minutes
            FROM b2b_request
            WHERE internal_qualified_at IS NOT NULL
        SQL;
        $stmt = $this->getEntityManager()->getConnection()->executeQuery($sql);
        $row = $stmt->fetchAssociative();
        $avgResponseTimeMinutes = $row && $row['avg_minutes'] !== null
            ? (int) round((float) $row['avg_minutes'])
            : null;

        return [
            'byStage' => $byStage,
            'openCount' => $openCount,
            'openValueCents' => $openValueCents,
            'wonValueCentsThisQuarter' => $wonValueCentsThisQuarter,
            'conversionRate' => $conversionRate,
            'avgResponseTimeMinutes' => $avgResponseTimeMinutes,
        ];
    }

    private function startOfCurrentQuarter(): \DateTimeImmutable
    {
        $now = new \DateTimeImmutable('today');
        $month = (int) $now->format('n');
        $startMonth = (int) (floor(($month - 1) / 3) * 3 + 1);
        return new \DateTimeImmutable(sprintf('%d-%02d-01', (int) $now->format('Y'), $startMonth));
    }
}
