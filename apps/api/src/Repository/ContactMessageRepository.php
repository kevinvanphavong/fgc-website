<?php

namespace App\Repository;

use App\Entity\ContactMessage;
use App\Enum\ContactMessageStatus;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<ContactMessage>
 */
class ContactMessageRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, ContactMessage::class);
    }

    public function countNew(): int
    {
        return (int) $this->createQueryBuilder('c')
            ->select('COUNT(c.id)')
            ->where('c.status = :s')
            ->setParameter('s', ContactMessageStatus::Nouveau)
            ->getQuery()
            ->getSingleScalarResult();
    }
}
