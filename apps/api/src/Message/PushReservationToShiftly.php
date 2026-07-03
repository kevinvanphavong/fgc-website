<?php

namespace App\Message;

/**
 * Ordre d'émettre une DemandeReservation vers l'endpoint d'ingestion Shiftly.
 *
 * Dispatché par BirthdayReservationProcessor APRÈS le flush local réussi, puis
 * traité de façon asynchrone (transport `async`, cf. config/packages/messenger.yaml).
 * Ne porte que l'id : le handler recharge l'entité fraîche depuis la BDD, ce qui
 * évite de sérialiser un objet Doctrine et garantit un statut à jour au moment du push.
 */
final class PushReservationToShiftly
{
    public function __construct(
        public readonly int $reservationId,
    ) {
    }
}
