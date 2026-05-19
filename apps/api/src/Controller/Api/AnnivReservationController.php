<?php

namespace App\Controller\Api;

use App\Repository\DemandeReservationRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;
use Symfony\Component\RateLimiter\RateLimiterFactory;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoints publics du tunnel anniv non exposés via API Platform :
 *   - GET /api/reservations/anniversaire/availability?date=YYYY-MM-DD
 *
 * Le POST de création vit dans DemandeReservation (#[ApiResource] +
 * BirthdayReservationProcessor) — cohérent avec le pattern API Platform.
 */
class AnnivReservationController extends AbstractController
{
    /**
     * Tous les créneaux du tunnel (cf. data.jsx::TIME_SLOTS).
     *
     * @var list<array{value: string, label: string, period: string}>
     */
    private const SLOTS = [
        ['value' => '10:00', 'label' => '10h00 – 12h00', 'period' => 'Matin'],
        ['value' => '14:00', 'label' => '14h00 – 16h00', 'period' => 'Après-midi'],
        ['value' => '14:30', 'label' => '14h30 – 16h30', 'period' => 'Après-midi'],
        ['value' => '16:00', 'label' => '16h00 – 18h00', 'period' => 'Après-midi'],
        ['value' => '16:30', 'label' => '16h30 – 18h30', 'period' => 'Goûter'],
        ['value' => '17:00', 'label' => '17h00 – 19h00', 'period' => 'Goûter'],
    ];

    public function __construct(
        private readonly DemandeReservationRepository $repo,
        #[Autowire(service: 'limiter.anniv_availability')]
        private readonly RateLimiterFactory $availabilityLimiter,
    ) {
    }

    #[Route(
        '/api/reservations/anniversaire/availability',
        name: 'api_anniv_availability',
        methods: ['GET'],
    )]
    public function availability(Request $request): JsonResponse
    {
        $consume = $this->availabilityLimiter
            ->create($request->getClientIp() ?? 'anonymous')
            ->consume();
        if (!$consume->isAccepted()) {
            throw new TooManyRequestsHttpException();
        }

        $dateParam = (string) $request->query->get('date', '');
        if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateParam)) {
            return new JsonResponse(
                ['error' => 'Paramètre `date` au format YYYY-MM-DD requis.'],
                400,
            );
        }
        $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $dateParam);
        if (!$date instanceof \DateTimeImmutable) {
            return new JsonResponse(['error' => 'Date invalide.'], 400);
        }

        $minDate = (new \DateTimeImmutable('today'))->modify('+7 days');
        $dateTooSoon = $date < $minDate;

        $reservedSlots = $dateTooSoon ? [] : $this->repo->findReservedSlots($date);

        $slots = array_map(static function (array $s) use ($reservedSlots, $dateTooSoon) {
            return [
                'value' => $s['value'],
                'label' => $s['label'],
                'period' => $s['period'],
                'available' => !$dateTooSoon && !in_array($s['value'], $reservedSlots, true),
            ];
        }, self::SLOTS);

        return new JsonResponse([
            'date' => $dateParam,
            'minDate' => $minDate->format('Y-m-d'),
            'dateTooSoon' => $dateTooSoon,
            'slots' => $slots,
        ]);
    }
}
