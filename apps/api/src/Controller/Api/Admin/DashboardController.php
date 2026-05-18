<?php

namespace App\Controller\Api\Admin;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Dashboard back-office. Toutes les valeurs sont MOCKÉES en PR3 (cf. flag
 * meta.demo dans la réponse). Aligné sur back-office-mockup/data.jsx pour
 * que le rendu corresponde à la prévis Claude Design.
 *
 * TODO PR5 : remplacer chaque bloc par les vraies queries Doctrine
 *            (Reservation/Payment/B2BRequest).
 */
#[Route('/api/admin')]
class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'api_admin_dashboard', methods: ['GET'])]
    #[IsGranted('ROLE_STAFF')]
    public function dashboard(): JsonResponse
    {
        return new JsonResponse([
            'meta' => [
                'demo' => true,
                'generatedAt' => (new \DateTimeImmutable())->format(\DateTimeInterface::ATOM),
            ],
            'kpis' => $this->kpis(),
            'recentActivity' => $this->recentActivity(),
            'notifications' => $this->notifications(),
        ]);
    }

    /**
     * Mock no-op : le front affiche le popover avec unread:false côté UI
     * sans persister. PR3 = pas de table notifications.
     *
     * TODO PR5 : marquer comme lues en BDD (table notification ou flag user).
     */
    #[Route('/notifications/mark-read', name: 'api_admin_notifications_mark_read', methods: ['POST'])]
    #[IsGranted('ROLE_STAFF')]
    public function markNotificationsRead(): JsonResponse
    {
        return new JsonResponse(null, 204);
    }

    /**
     * @return array<string, array{value: float|int, delta: int, spark: list<int|float>}>
     */
    private function kpis(): array
    {
        // TODO PR5 : remplacer par vraies queries Reservation/Payment.
        // Valeurs alignées sur back-office-mockup/dashboard.jsx + data.jsx
        // (RESERVATIONS today : R-2406, R-2418, R-2419, R-2421 = 270+189+282+80 = 821€,
        //  RESERVATIONS week ≈ 2751€ avec confirmations, etc.).
        return [
            'revenueToday' => [
                'value' => 2751,
                'delta' => 12,
                'spark' => [1280, 1320, 1450, 1610, 1580, 1820, 2100],
            ],
            'reservationsToday' => [
                'value' => 12,
                'delta' => 3,
                'spark' => [5, 4, 6, 8, 7, 9, 12],
            ],
            'occupancyRate' => [
                'value' => 0.74,
                'delta' => -2,
                'spark' => [68, 72, 78, 81, 76, 72, 74],
            ],
            'revenueMonth' => [
                'value' => 11455,
                'delta' => 18,
                'spark' => [8200, 9100, 8900, 10200, 11400, 11455],
            ],
        ];
    }

    /**
     * @return list<array{id: string, type: string, label: string, meta: string, at: string}>
     */
    private function recentActivity(): array
    {
        // TODO PR5 : remplir depuis un event store / audit log.
        // Aligné sur RECENT_ACTIVITY de data.jsx (timestamps recalculés relatifs à now).
        $now = new \DateTimeImmutable();
        $items = [
            ['payment', 'Acompte reçu — R-2436 (Tom Mercier, anniv 6 ans)', 'Système', 6],
            ['system', 'Appel client noté — R-2424 Karim Hassan', 'Maeva Lopes', 22],
            ['system', '⚠ Conflit détecté — R-2430 et R-2431 sur pistes 7-8 le 20/05', 'Système', 60],
            ['reservation', 'Devis D-115 envoyé à Decathlon Blois', 'Romain Saulnier', 120],
            ['system', 'Tarif Bowling adulte modifié (8,50€ → 8,90€)', 'Élise Caron', 240],
            ['user', 'Nouveau client créé — Sophie Lefèvre', 'Maeva Lopes', 300],
            ['system', 'Affiche "Cocktails été 2026" remplacée', 'Élise Caron', 60 * 24],
        ];

        $out = [];
        foreach ($items as $i => [$type, $label, $meta, $minutesAgo]) {
            $out[] = [
                'id' => 'A-' . str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                'type' => $type,
                'label' => $label,
                'meta' => $meta,
                'at' => $now->modify("-{$minutesAgo} minutes")->format(\DateTimeInterface::ATOM),
            ];
        }
        return $out;
    }

    /**
     * @return list<array{id: string, title: string, body: string, at: string, unread: bool}>
     */
    private function notifications(): array
    {
        // TODO PR5 : remplir depuis une table notification.
        // Aligné sur NOTIFS de data.jsx.
        $now = new \DateTimeImmutable();
        $items = [
            ['Nouvelle réservation — Léa Vidal', 'PLATINIUM, ce soir 21h, piste 10', 3, true],
            ['Acompte reçu — R-2436', '50€ via CB · Tom Mercier 6 ans', 6, true],
            ['⚠ Conflit pistes 7-8 le 20/05', 'R-2430 (GOLD) vs R-2431 (anniversaire)', 60, true],
            ['Devis D-115 ouvert par Decathlon', 'Le client a consulté le devis 3 fois', 240, false],
        ];

        $out = [];
        foreach ($items as $i => [$title, $body, $minutesAgo, $unread]) {
            $out[] = [
                'id' => 'N-' . str_pad((string) ($i + 1), 3, '0', STR_PAD_LEFT),
                'title' => $title,
                'body' => $body,
                'at' => $now->modify("-{$minutesAgo} minutes")->format(\DateTimeInterface::ATOM),
                'unread' => $unread,
            ];
        }
        return $out;
    }
}
