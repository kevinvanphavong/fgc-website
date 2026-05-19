'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall, unwrapCollection, AdminClientError } from '@/lib/admin-client';

/**
 * Status d'une demande de réservation anniv — miroir TS de
 * `App\Enum\DemandeReservationStatus` côté Symfony.
 */
export type ReservationStatus =
  | 'nouveau'
  | 'contacte'
  | 'confirme'
  | 'refuse'
  | 'passe';

export const STATUS_ORDER: ReservationStatus[] = [
  'nouveau',
  'contacte',
  'confirme',
  'passe',
  'refuse',
];

/** Mêmes transitions que côté serveur (Enum::allowedNextStates) — rejouées
 *  côté front pour pré-désactiver les boutons. Le serveur reste source de
 *  vérité (422 en cas de drift). */
export const ALLOWED_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  nouveau: ['contacte', 'refuse'],
  contacte: ['confirme', 'refuse'],
  confirme: ['passe', 'refuse'],
  refuse: [],
  passe: [],
};

export interface DemandeReservation {
  '@id'?: string;
  id: number;
  reference: string;
  status: ReservationStatus;
  formuleKey: 'newbowler' | 'superbowler' | 'probowler';
  eventDate: string;
  timeSlot: string;
  childName: string;
  childAge: number;
  kidsCount: number;
  cakeNote: string | null;
  allergies: string | null;
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  source: string | null;
  message: string | null;
  acceptCGV: boolean;
  acceptNewsletter: boolean;
  upsellVR: boolean;
  unitPriceCentsSnapshot: number;
  adminNote: string | null;
  internalContactedAt: string | null;
  internalConfirmedAt: string | null;
  internalRefusedAt: string | null;
  internalPassedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  byStatus: Record<ReservationStatus, number>;
  newToday: number;
  total: number;
}

export interface DemandeListFilters {
  status?: ReservationStatus | ReservationStatus[];
  search?: string;
  from?: string; // ISO date YYYY-MM-DD pour createdAt[after]
  to?: string;   // ISO date YYYY-MM-DD pour createdAt[before]
  page?: number;
  itemsPerPage?: number;
}

function buildListUrl(filters: DemandeListFilters): string {
  const params = new URLSearchParams();
  if (filters.status) {
    const arr = Array.isArray(filters.status) ? filters.status : [filters.status];
    arr.forEach((s) => params.append('status[]', s));
  }
  if (filters.search) {
    // API Platform SearchFilter accepte un seul champ à la fois — on tire
    // sur `reference`, `parentLastName`, `childName` côté serveur via
    // 3 paramètres. Le serveur OR-combine via Doctrine (chacun = AND par
    // défaut). On envoie sur reference uniquement ici en V1 (le plus utile),
    // les autres champs sont disponibles directement par filtre dédié.
    params.set('reference', filters.search);
  }
  if (filters.from) params.set('createdAt[after]', filters.from);
  if (filters.to) params.set('createdAt[before]', filters.to);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.itemsPerPage) params.set('itemsPerPage', String(filters.itemsPerPage));
  const qs = params.toString();
  return `/admin/demandes-reservation${qs ? `?${qs}` : ''}`;
}

const BASE_KEY = ['admin', 'demandes-reservation'] as const;

export function useReservationsList(filters: DemandeListFilters = {}) {
  return useQuery({
    queryKey: [...BASE_KEY, 'list', filters] as const,
    queryFn: async () => {
      const payload = await apiCall<unknown>(buildListUrl(filters));
      return unwrapCollection<DemandeReservation>(payload);
    },
  });
}

export function useReservationsStats() {
  return useQuery({
    queryKey: [...BASE_KEY, 'stats'] as const,
    queryFn: () => apiCall<AdminStats>('/admin/demandes-reservation/stats'),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

/**
 * PATCH custom — API Platform 4 attend Content-Type `application/merge-patch+json`
 * (`apiCall` standard envoie `application/ld+json` qui marche pour POST/PUT/DELETE
 * mais pas pour PATCH).
 */
async function patchReservation(
  id: number,
  body: Partial<Pick<DemandeReservation, 'status' | 'adminNote'>>,
): Promise<DemandeReservation> {
  const res = await fetch(`/api/admin/proxy/admin/demandes-reservation/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/merge-patch+json',
      Accept: 'application/ld+json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let parsed: unknown = null;
    try {
      parsed = await res.json();
    } catch {
      /* no body */
    }
    throw new AdminClientError(res.status, parsed);
  }
  return (await res.json()) as DemandeReservation;
}

export function useReservationPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof patchReservation>[1] }) =>
      patchReservation(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BASE_KEY });
    },
  });
}

export { AdminClientError };
