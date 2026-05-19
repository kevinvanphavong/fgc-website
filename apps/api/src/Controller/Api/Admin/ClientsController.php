<?php

namespace App\Controller\Api\Admin;

use App\Entity\B2BRequest;
use App\Entity\DemandeReservation;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

/**
 * Clients agrégés (PR7) — lecture-seule, pas d'entité Client en BDD.
 *
 * Union de `DemandeReservation` (anniv) + `B2BRequest`, groupée par email,
 * normalisée en payload `{ email, displayName, phone, firstSeenAt, lastSeenAt,
 * totalReservations, totalAnniv, totalB2B, sources, tags }`.
 *
 * Tags calculés à la volée :
 *   - `fidele` si totalReservations ≥ 5
 *   - `vip` si totalAnniv ≥ 3
 *   - `b2b` si totalB2B ≥ 1
 *
 * Performance V1 : pas de cache. Volume FGC actuel <100 résa/an → OK.
 * V2 (>1000) : vue matérialisée Postgres ou cache Redis (cf. GOTCHAS).
 */
#[Route('/api/admin/clients')]
class ClientsController extends AbstractController
{
    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    #[Route('', name: 'api_admin_clients_list', methods: ['GET'])]
    #[IsGranted('ROLE_STAFF')]
    public function list(Request $request): JsonResponse
    {
        $search = trim((string) $request->query->get('search', ''));
        $tag = (string) $request->query->get('tag', '');
        $from = (string) $request->query->get('from', '');
        $to = (string) $request->query->get('to', '');
        $page = max(1, (int) $request->query->get('page', 1));
        $perPage = 25;

        $aggregated = $this->buildAggregate();

        // Filtres applicatifs (volume V1 faible, OK).
        $filtered = array_values(array_filter($aggregated, function (array $c) use ($search, $tag, $from, $to) {
            if ($search !== '') {
                $needle = mb_strtolower($search);
                $hay = mb_strtolower($c['email'].' '.$c['displayName'].' '.($c['phone'] ?? ''));
                if (!str_contains($hay, $needle)) {
                    return false;
                }
            }
            if ($tag !== '' && !in_array($tag, $c['tags'], true)) {
                return false;
            }
            if ($from !== '' && $c['lastSeenAt'] < $from) {
                return false;
            }
            if ($to !== '' && $c['lastSeenAt'] > $to.'T23:59:59+00:00') {
                return false;
            }
            return true;
        }));

        // Tri lastSeenAt DESC.
        usort($filtered, static fn(array $a, array $b) => strcmp($b['lastSeenAt'], $a['lastSeenAt']));

        $total = count($filtered);
        $items = array_slice($filtered, ($page - 1) * $perPage, $perPage);

        return new JsonResponse([
            'items' => $items,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
        ]);
    }

    #[Route('/stats', name: 'api_admin_clients_stats', methods: ['GET'])]
    #[IsGranted('ROLE_STAFF')]
    public function stats(): JsonResponse
    {
        $aggregated = $this->buildAggregate();
        $now = new \DateTimeImmutable();
        $thirtyDaysAgo = $now->modify('-30 days')->format(\DateTimeInterface::ATOM);

        $totals = count($aggregated);
        $fideles = 0;
        $vip = 0;
        $newRecent = 0;
        foreach ($aggregated as $c) {
            if (in_array('fidele', $c['tags'], true)) $fideles++;
            if (in_array('vip', $c['tags'], true)) $vip++;
            if ($c['firstSeenAt'] >= $thirtyDaysAgo) $newRecent++;
        }

        return new JsonResponse([
            'total' => $totals,
            'fideles' => $fideles,
            'vip' => $vip,
            'newRecent' => $newRecent,
        ]);
    }

    #[Route('/{email}', name: 'api_admin_clients_detail', methods: ['GET'], requirements: ['email' => '.+'])]
    #[IsGranted('ROLE_STAFF')]
    public function detail(string $email): JsonResponse
    {
        $email = urldecode($email);
        $aggregated = $this->buildAggregate();
        $client = null;
        foreach ($aggregated as $c) {
            if ($c['email'] === $email) {
                $client = $c;
                break;
            }
        }
        if ($client === null) {
            return new JsonResponse(['error' => 'Client introuvable.'], 404);
        }

        // Historique : 50 dernières interactions, anniv + B2B mélangées.
        $history = [];

        $anniv = $this->em->getRepository(DemandeReservation::class)
            ->createQueryBuilder('d')
            ->where('d.parentEmail = :email')
            ->setParameter('email', $email)
            ->orderBy('d.createdAt', 'DESC')
            ->setMaxResults(50)
            ->getQuery()
            ->getResult();
        foreach ($anniv as $d) {
            /** @var DemandeReservation $d */
            $history[] = [
                'kind' => 'anniv',
                'id' => $d->getId(),
                'reference' => $d->getReference(),
                'status' => $d->getStatus()->value,
                'eventDate' => $d->getEventDate()?->format('Y-m-d'),
                'value' => $d->getTotalCents(),
                'createdAt' => $d->getCreatedAt()?->format(\DateTimeInterface::ATOM),
                'summary' => sprintf(
                    '%s · %d enfants · %s',
                    $d->getChildName(),
                    $d->getKidsCount(),
                    $d->getFormuleKey(),
                ),
            ];
        }

        $b2b = $this->em->getRepository(B2BRequest::class)
            ->createQueryBuilder('b')
            ->where('b.contactEmail = :email')
            ->setParameter('email', $email)
            ->orderBy('b.createdAt', 'DESC')
            ->setMaxResults(50)
            ->getQuery()
            ->getResult();
        foreach ($b2b as $r) {
            /** @var B2BRequest $r */
            $history[] = [
                'kind' => 'b2b',
                'id' => $r->getId(),
                'reference' => $r->getReference(),
                'status' => $r->getStage()->value,
                'eventDate' => $r->getEventDate()?->format('Y-m-d'),
                'value' => $r->getEstimatedValueCents(),
                'createdAt' => $r->getCreatedAt()?->format(\DateTimeInterface::ATOM),
                'summary' => sprintf(
                    '%s · %s · %d pers.',
                    $r->getCompanyName(),
                    $r->getType()->value,
                    $r->getExpectedAttendees(),
                ),
            ];
        }

        usort($history, static fn(array $a, array $b) => strcmp((string) $b['createdAt'], (string) $a['createdAt']));
        $history = array_slice($history, 0, 50);

        return new JsonResponse([
            ...$client,
            'history' => $history,
        ]);
    }

    /**
     * Construit l'agrégat clients : un index email → totaux + tags.
     *
     * @return list<array{
     *     email: string,
     *     displayName: string,
     *     phone: ?string,
     *     firstSeenAt: string,
     *     lastSeenAt: string,
     *     totalReservations: int,
     *     totalAnniv: int,
     *     totalB2B: int,
     *     sources: list<string>,
     *     tags: list<string>,
     * }>
     */
    private function buildAggregate(): array
    {
        $clients = [];

        // 1. Anniv reservations.
        $anniv = $this->em->getRepository(DemandeReservation::class)
            ->createQueryBuilder('d')
            ->orderBy('d.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
        foreach ($anniv as $d) {
            /** @var DemandeReservation $d */
            $email = strtolower(trim($d->getParentEmail()));
            if ($email === '') continue;
            $created = $d->getCreatedAt()?->format(\DateTimeInterface::ATOM) ?? '';
            $clients[$email] ??= [
                'email' => $email,
                'displayName' => $d->getParentFullName(),
                'phone' => $d->getParentPhone() ?: null,
                'firstSeenAt' => $created,
                'lastSeenAt' => $created,
                'totalAnniv' => 0,
                'totalB2B' => 0,
                'sources' => [],
            ];
            $clients[$email]['totalAnniv']++;
            $clients[$email]['firstSeenAt'] = min($clients[$email]['firstSeenAt'], $created);
            $clients[$email]['lastSeenAt'] = max($clients[$email]['lastSeenAt'], $created);
            if (!in_array('anniv', $clients[$email]['sources'], true)) {
                $clients[$email]['sources'][] = 'anniv';
            }
        }

        // 2. B2B requests.
        $b2b = $this->em->getRepository(B2BRequest::class)
            ->createQueryBuilder('b')
            ->orderBy('b.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
        foreach ($b2b as $r) {
            /** @var B2BRequest $r */
            $email = strtolower(trim($r->getContactEmail()));
            if ($email === '') continue;
            $created = $r->getCreatedAt()?->format(\DateTimeInterface::ATOM) ?? '';
            $clients[$email] ??= [
                'email' => $email,
                'displayName' => $r->getContactFullName(),
                'phone' => $r->getContactPhone() ?: null,
                'firstSeenAt' => $created,
                'lastSeenAt' => $created,
                'totalAnniv' => 0,
                'totalB2B' => 0,
                'sources' => [],
            ];
            $clients[$email]['totalB2B']++;
            $clients[$email]['firstSeenAt'] = min($clients[$email]['firstSeenAt'], $created);
            $clients[$email]['lastSeenAt'] = max($clients[$email]['lastSeenAt'], $created);
            if (!in_array('b2b', $clients[$email]['sources'], true)) {
                $clients[$email]['sources'][] = 'b2b';
            }
            // Si le client n'avait pas de nom (cas où on n'a vu que B2B), garde celui-ci.
            if ($clients[$email]['displayName'] === '') {
                $clients[$email]['displayName'] = $r->getContactFullName();
            }
        }

        // 3. Calcul des totaux + tags.
        $out = [];
        foreach ($clients as $c) {
            $totalReservations = $c['totalAnniv'] + $c['totalB2B'];
            $tags = [];
            if ($totalReservations >= 5) $tags[] = 'fidele';
            if ($c['totalAnniv'] >= 3) $tags[] = 'vip';
            if ($c['totalB2B'] >= 1) $tags[] = 'b2b';

            $out[] = [
                ...$c,
                'totalReservations' => $totalReservations,
                'tags' => $tags,
            ];
        }

        return $out;
    }
}
