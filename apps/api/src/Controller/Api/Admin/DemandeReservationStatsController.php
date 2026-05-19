<?php

namespace App\Controller\Api\Admin;

use App\Repository\DemandeReservationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Stats des demandes de réservation anniv pour le back-office :
 *   - counts par status,
 *   - count `nouveau` du jour (alimente le badge sidebar + KPI dashboard).
 */
class DemandeReservationStatsController extends AbstractController
{
    #[Route(
        '/api/admin/demandes-reservation/stats',
        name: 'api_admin_demandes_reservation_stats',
        methods: ['GET'],
    )]
    #[IsGranted('ROLE_STAFF')]
    public function __invoke(DemandeReservationRepository $repo): JsonResponse
    {
        return new JsonResponse($repo->getAdminStats());
    }
}
