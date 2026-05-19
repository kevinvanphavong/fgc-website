/**
 * Appels API du tunnel anniv.
 * - GET `/reservations/anniversaire/availability?date=YYYY-MM-DD`
 * - POST `/reservations/anniversaire`
 */
import { api, ApiError } from '@/lib/api';
import type {
  AvailabilityResponse,
  ReservationConfirmation,
  TunnelDraft,
} from './types';

export { ApiError };

export async function fetchAvailability(
  isoDate: string,
): Promise<AvailabilityResponse> {
  return api<AvailabilityResponse>(
    `/reservations/anniversaire/availability?date=${encodeURIComponent(isoDate)}`,
  );
}

export interface SubmitInput {
  draft: TunnelDraft;
}

export async function submitReservation(
  draft: TunnelDraft,
): Promise<ReservationConfirmation> {
  if (
    !draft.formuleKey
    || !draft.date
    || !draft.timeSlot
    || draft.childAge === null
    || draft.kidsCount === null
  ) {
    throw new Error('Brouillon incomplet — étapes manquantes.');
  }

  return api<ReservationConfirmation>('/reservations/anniversaire', {
    method: 'POST',
    json: {
      formuleKey: draft.formuleKey,
      eventDate: draft.date,
      timeSlot: draft.timeSlot,
      childName: draft.childName.trim(),
      childAge: draft.childAge,
      kidsCount: draft.kidsCount,
      cakeNote: draft.cakeNote.trim() || null,
      allergies: draft.allergies.trim() || null,
      parentFirstName: draft.parentFirstName.trim(),
      parentLastName: draft.parentLastName.trim(),
      parentEmail: draft.parentEmail.trim(),
      parentPhone: draft.parentPhone.trim(),
      source: draft.source || null,
      message: draft.message.trim() || null,
      acceptCGV: draft.acceptCGV,
      acceptNewsletter: draft.acceptNewsletter,
      upsellVR: draft.upsellVR,
    },
  });
}

/**
 * Extrait un message d'erreur lisible d'une ApiError API Platform (JSON-LD).
 * Pratique pour les toasts.
 */
export function formatApiError(err: unknown): string {
  if (err instanceof ApiError) {
    const body = err.body as
      | {
          violations?: { propertyPath: string; message: string }[];
          detail?: string;
          'hydra:description'?: string;
        }
      | null;
    if (body?.violations?.length) {
      return body.violations
        .map((v) => `${v.propertyPath}: ${v.message}`)
        .join(' · ');
    }
    return body?.['hydra:description'] ?? body?.detail ?? `Erreur API ${err.status}`;
  }
  return (err as Error)?.message ?? 'Erreur inconnue';
}
