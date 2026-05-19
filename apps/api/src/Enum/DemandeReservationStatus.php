<?php

namespace App\Enum;

/**
 * Cycle de vie d'une demande de réservation anniversaire (CLAUDE.md §11).
 *
 *   nouveau → contacte → confirme | refuse → passe
 *
 * - `nouveau` : demande créée via le tunnel, mail envoyé au gérant.
 * - `contacte` : le gérant a rappelé le parent (back-office PR5).
 * - `confirme` : date validée, acompte reçu (back-office PR5).
 * - `refuse` : demande déclinée (créneau impossible, double-booking…).
 * - `passe` : la fête a eu lieu (archivage).
 */
enum DemandeReservationStatus: string
{
    case Nouveau = 'nouveau';
    case Contacte = 'contacte';
    case Confirme = 'confirme';
    case Refuse = 'refuse';
    case Passe = 'passe';

    /**
     * Statuts qui réservent un créneau (pour le calcul des dispos +
     * la détection 409 dans le POST).
     */
    public static function reservingSlot(): array
    {
        return [self::Nouveau, self::Contacte, self::Confirme];
    }

    /**
     * Transitions autorisées depuis ce statut (machine d'état admin).
     * Source de vérité côté serveur : si on essaie une transition
     * non listée via PATCH /api/admin/demandes-reservation/{id}, on rejette en 422.
     *
     *   nouveau    → contacte | refuse
     *   contacte   → confirme | refuse
     *   confirme   → passe    | refuse
     *   refuse     → (terminal)
     *   passe      → (terminal)
     *
     * @return list<self>
     */
    public function allowedNextStates(): array
    {
        return match ($this) {
            self::Nouveau => [self::Contacte, self::Refuse],
            self::Contacte => [self::Confirme, self::Refuse],
            self::Confirme => [self::Passe, self::Refuse],
            self::Refuse, self::Passe => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return $target === $this || in_array($target, $this->allowedNextStates(), true);
    }
}
