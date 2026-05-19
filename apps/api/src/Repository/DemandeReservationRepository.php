<?php

namespace App\Repository;

use App\Entity\DemandeReservation;
use App\Enum\DemandeReservationStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<DemandeReservation>
 */
class DemandeReservationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, DemandeReservation::class);
    }

    /**
     * Renvoie les créneaux déjà bloqués (status ∈ reservingSlot) pour une date.
     *
     * @return list<string> liste de timeSlot (ex. ['10:00', '14:30'])
     */
    public function findReservedSlots(\DateTimeInterface $date): array
    {
        $rows = $this->createQueryBuilder('d')
            ->select('d.timeSlot')
            ->where('d.eventDate = :date')
            ->andWhere('d.status IN (:statuses)')
            ->setParameter('date', $date->format('Y-m-d'))
            ->setParameter('statuses', DemandeReservationStatus::reservingSlot())
            ->getQuery()
            ->getArrayResult();

        return array_map(static fn(array $r) => $r['timeSlot'], $rows);
    }

    public function isSlotTaken(\DateTimeInterface $date, string $timeSlot): bool
    {
        $count = (int) $this->createQueryBuilder('d')
            ->select('COUNT(d.id)')
            ->where('d.eventDate = :date')
            ->andWhere('d.timeSlot = :slot')
            ->andWhere('d.status IN (:statuses)')
            ->setParameter('date', $date->format('Y-m-d'))
            ->setParameter('slot', $timeSlot)
            ->setParameter('statuses', DemandeReservationStatus::reservingSlot())
            ->getQuery()
            ->getSingleScalarResult();

        return $count > 0;
    }

    /**
     * Counts par statut + count `nouveau` du jour.
     * Utilisé par le badge sidebar admin + dashboard KPI.
     *
     * @return array{
     *     byStatus: array<string, int>,
     *     newToday: int,
     *     total: int,
     * }
     */
    public function getAdminStats(): array
    {
        $rows = $this->createQueryBuilder('d')
            ->select('d.status, COUNT(d.id) AS cnt')
            ->groupBy('d.status')
            ->getQuery()
            ->getArrayResult();

        $byStatus = [];
        foreach (DemandeReservationStatus::cases() as $case) {
            $byStatus[$case->value] = 0;
        }
        $total = 0;
        foreach ($rows as $row) {
            $statusValue = $row['status'] instanceof DemandeReservationStatus
                ? $row['status']->value
                : (string) $row['status'];
            $count = (int) $row['cnt'];
            $byStatus[$statusValue] = $count;
            $total += $count;
        }

        $today = new \DateTimeImmutable('today');
        $newToday = (int) $this->createQueryBuilder('d')
            ->select('COUNT(d.id)')
            ->where('d.status = :status')
            ->andWhere('d.createdAt >= :startOfDay')
            ->setParameter('status', DemandeReservationStatus::Nouveau)
            ->setParameter('startOfDay', $today)
            ->getQuery()
            ->getSingleScalarResult();

        return [
            'byStatus' => $byStatus,
            'newToday' => $newToday,
            'total' => $total,
        ];
    }
}
