'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall, unwrapCollection, AdminClientError } from '@/lib/admin-client';

/**
 * Stage d'une demande B2B — miroir TS de `App\Enum\B2BStage`.
 * Snake_case côté PHP & JSON (cohérent PR5).
 */
export type B2BStage =
  | 'nouveau'
  | 'qualifie'
  | 'devis_envoye'
  | 'negociation'
  | 'gagne'
  | 'perdu';

export const B2B_STAGE_ORDER: B2BStage[] = [
  'nouveau',
  'qualifie',
  'devis_envoye',
  'negociation',
  'gagne',
  'perdu',
];

export type B2BType =
  | 'seminaire'
  | 'team_building'
  | 'soiree'
  | 'arbre_noel'
  | 'autre';

/** Transitions autorisées — miroir de `B2BStage::allowedNextStates`. */
export const B2B_ALLOWED_TRANSITIONS: Record<B2BStage, B2BStage[]> = {
  nouveau: ['qualifie', 'perdu'],
  qualifie: ['devis_envoye', 'perdu'],
  devis_envoye: ['negociation', 'gagne', 'perdu'],
  negociation: ['gagne', 'perdu'],
  gagne: [],
  perdu: [],
};

export interface B2BRequest {
  '@id'?: string;
  id: number;
  reference: string;
  stage: B2BStage;
  type: B2BType;
  companyName: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  eventDate: string | null;
  expectedAttendees: number;
  message: string | null;
  estimatedValueCents: number | null;
  adminNote: string | null;
  acceptRgpd: boolean;
  internalQualifiedAt: string | null;
  internalQuotedAt: string | null;
  internalNegotiatedAt: string | null;
  internalClosedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface B2BAdminStats {
  byStage: Record<B2BStage, number>;
  openCount: number;
  openValueCents: number;
  wonValueCentsThisQuarter: number;
  conversionRate: number;
  avgResponseTimeMinutes: number | null;
}

export interface B2BListFilters {
  type?: B2BType;
  stage?: B2BStage | B2BStage[];
  search?: string;
  page?: number;
  itemsPerPage?: number;
}

function buildListUrl(filters: B2BListFilters): string {
  const params = new URLSearchParams();
  if (filters.stage) {
    const arr = Array.isArray(filters.stage) ? filters.stage : [filters.stage];
    arr.forEach((s) => params.append('stage[]', s));
  }
  if (filters.type) params.set('type', filters.type);
  if (filters.search) params.set('companyName', filters.search);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.itemsPerPage) params.set('itemsPerPage', String(filters.itemsPerPage));
  const qs = params.toString();
  return `/admin/b2b-requests${qs ? `?${qs}` : ''}`;
}

const BASE_KEY = ['admin', 'b2b-requests'] as const;

export function useB2BList(filters: B2BListFilters = {}) {
  return useQuery({
    queryKey: [...BASE_KEY, 'list', filters] as const,
    queryFn: async () => {
      const payload = await apiCall<unknown>(buildListUrl(filters));
      return unwrapCollection<B2BRequest>(payload);
    },
  });
}

export function useB2BStats() {
  return useQuery({
    queryKey: [...BASE_KEY, 'stats'] as const,
    queryFn: () => apiCall<B2BAdminStats>('/admin/b2b-requests/stats'),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

async function patchB2BRequest(
  id: number,
  body: Partial<Pick<B2BRequest, 'stage' | 'adminNote' | 'estimatedValueCents'>>,
): Promise<B2BRequest> {
  const res = await fetch(`/api/admin/proxy/admin/b2b-requests/${id}`, {
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
  return (await res.json()) as B2BRequest;
}

export function useB2BPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof patchB2BRequest>[1] }) =>
      patchB2BRequest(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: BASE_KEY });
    },
  });
}

export { AdminClientError };
