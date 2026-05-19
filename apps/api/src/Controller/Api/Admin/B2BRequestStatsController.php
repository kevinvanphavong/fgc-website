<?php

namespace App\Controller\Api\Admin;

use App\Repository\B2BRequestRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Stats du pipeline B2B (PR6) :
 *   - counts par stage,
 *   - openCount, openValueCents,
 *   - wonValueCentsThisQuarter,
 *   - conversionRate,
 *   - avgResponseTimeMinutes.
 */
class B2BRequestStatsController extends AbstractController
{
    #[Route(
        '/api/admin/b2b-requests/stats',
        name: 'api_admin_b2b_requests_stats',
        methods: ['GET'],
    )]
    #[IsGranted('ROLE_STAFF')]
    public function __invoke(B2BRequestRepository $repo): JsonResponse
    {
        return new JsonResponse($repo->getAdminStats());
    }
}
