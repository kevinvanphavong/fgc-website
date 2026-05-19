<?php

namespace App\Enum;

/**
 * Cycle de vie d'un message contact (PR9 finitions). Volume très faible
 * → machine d'état simple (pas de stamp internal*At).
 *
 *   nouveau → traite → archive
 *
 * Tout statut peut revenir à `nouveau` (cas "j'ai cliqué traité par erreur"),
 * `archive` est terminal sauf si on rouvre explicitement.
 */
enum ContactMessageStatus: string
{
    case Nouveau = 'nouveau';
    case Traite = 'traite';
    case Archive = 'archive';

    /**
     * @return list<self>
     */
    public function allowedNextStates(): array
    {
        return match ($this) {
            self::Nouveau => [self::Traite, self::Archive],
            self::Traite => [self::Nouveau, self::Archive],
            self::Archive => [self::Nouveau, self::Traite],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return $target === $this || in_array($target, $this->allowedNextStates(), true);
    }
}
