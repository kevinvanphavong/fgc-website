<?php

namespace App\MessageHandler;

use App\Entity\DemandeReservation;
use App\Message\PushReservationToShiftly;
use App\Repository\DemandeReservationRepository;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Messenger\Attribute\AsMessageHandler;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Émet une DemandeReservation vers l'endpoint d'ingestion Shiftly.
 *
 * Idempotent côté Shiftly via `sourceRef` = référence FGC : rejouer le même
 * message (retry Messenger, redémarrage worker) ne crée jamais de doublon.
 * Toute réponse ≠ 200/201 lève une exception → Messenger retente (backoff, cf.
 * messenger.yaml). Contrat figé par Shiftly (cf. PROMPT_..._PUSH_RESERVATIONS_FGC.md).
 */
#[AsMessageHandler]
final class PushReservationToShiftlyHandler
{
    public function __construct(
        private readonly DemandeReservationRepository $repo,
        private readonly HttpClientInterface $http,
        private readonly LoggerInterface $logger,
        #[Autowire('%env(SHIFTLY_INGEST_URL)%')]
        private readonly string $ingestUrl,
        #[Autowire('%env(SHIFTLY_INGEST_KEY)%')]
        private readonly string $ingestKey,
    ) {
    }

    public function __invoke(PushReservationToShiftly $message): void
    {
        // Non configuré (ex. env sans Shiftly) : no-op silencieux, on ne veut pas
        // boucler en retry sur une intégration volontairement désactivée.
        if ($this->ingestUrl === '') {
            $this->logger->info('Push Shiftly ignoré (SHIFTLY_INGEST_URL vide).', [
                'reservationId' => $message->reservationId,
            ]);

            return;
        }

        $reservation = $this->repo->find($message->reservationId);
        if (!$reservation instanceof DemandeReservation) {
            // Résa supprimée entre le dispatch et la consommation : rien à rejouer.
            $this->logger->warning('Push Shiftly : DemandeReservation introuvable.', [
                'reservationId' => $message->reservationId,
            ]);

            return;
        }

        $endpoint = rtrim($this->ingestUrl, '/').'/api/ingest/reservations';

        try {
            $response = $this->http->request('POST', $endpoint, [
                'headers' => [
                    'X-Shiftly-Ingest-Key' => $this->ingestKey,
                    'Accept' => 'application/json',
                ],
                'json' => $this->buildPayload($reservation),
                'timeout' => 10,
            ]);

            // getStatusCode() déclenche le transport : une panne réseau (Shiftly
            // coupé) lève ici une TransportExceptionInterface qu'on convertit en
            // échec Messenger (donc retry), sans jamais toucher la création web.
            $status = $response->getStatusCode();
        } catch (TransportExceptionInterface $e) {
            throw new \RuntimeException(sprintf(
                'Push Shiftly injoignable pour %s : %s',
                $reservation->getReference(),
                $e->getMessage(),
            ), previous: $e);
        }

        // 201 = créée, 200 = déjà ingérée (idempotence) → succès dans les deux cas.
        if (200 === $status || 201 === $status) {
            $this->logger->info('Push Shiftly OK.', [
                'ref' => $reservation->getReference(),
                'status' => $status,
            ]);

            return;
        }

        // Toute autre réponse → exception → Messenger retente selon le backoff.
        throw new \RuntimeException(sprintf(
            'Push Shiftly rejeté pour %s : HTTP %d',
            $reservation->getReference(),
            $status,
        ));
    }

    /**
     * Construit le body exact attendu par l'ingestion Shiftly.
     *
     * @return array<string, mixed>
     */
    private function buildPayload(DemandeReservation $r): array
    {
        // dateCreneau = date de l'événement + créneau horaire (HH:mm) en ISO 8601.
        $dateCreneau = $r->getEventDate()?->modify($r->getTimeSlot());

        return [
            'sourceRef' => $r->getReference(),
            'source' => 'fgc-web',
            'type' => 'anniversaire',
            'dateCreneau' => $dateCreneau?->format(\DateTimeInterface::ATOM),
            'nbPersonnes' => $r->getKidsCount(),
            'client' => [
                'nom' => $r->getParentFullName(),
                'email' => $r->getParentEmail(),
                'telephone' => $r->getParentPhone(),
            ],
            'formule' => $r->getFormuleKey(),
            'montantTotalCents' => $r->getTotalCents(),
            // Statut BRUT (v1.1) : le mapping vers le vocabulaire Shiftly
            // (EN_ATTENTE_ACOMPTE, CONFIRMEE…) est fait côté Shiftly.
            'statut' => $r->getStatus()->value,
        ];
    }
}
