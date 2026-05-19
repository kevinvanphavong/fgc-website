'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall, unwrapCollection, AdminClientError } from '@/lib/admin-client';

export type ContactMessageStatus = 'nouveau' | 'traite' | 'archive';
export type ContactSubject = 'anniv' | 'b2b' | 'tarifs' | 'partenariat' | 'autre';

export const STATUS_ORDER: ContactMessageStatus[] = ['nouveau', 'traite', 'archive'];

export const STATUS_META: Record<
  ContactMessageStatus,
  { label: string; pillBg: string; pillText: string; dotBg: string }
> = {
  nouveau: {
    label: 'Nouveau',
    pillBg: 'bg-admin-amber-soft',
    pillText: 'text-admin-amber',
    dotBg: 'bg-admin-amber',
  },
  traite: {
    label: 'Traité',
    pillBg: 'bg-admin-green-soft',
    pillText: 'text-admin-green',
    dotBg: 'bg-admin-green',
  },
  archive: {
    label: 'Archivé',
    pillBg: 'bg-admin-bg-sunken',
    pillText: 'text-admin-slate',
    dotBg: 'bg-admin-slate',
  },
};

export const SUBJECT_LABELS: Record<ContactSubject, string> = {
  anniv: 'Anniversaire',
  b2b: 'B2B',
  tarifs: 'Tarifs',
  partenariat: 'Partenariat',
  autre: 'Autre',
};

export interface ContactMessage {
  '@id'?: string;
  id: number;
  reference: string;
  status: ContactMessageStatus;
  name: string;
  email: string;
  phone: string | null;
  subject: ContactSubject;
  message: string;
  acceptRgpd: boolean;
  adminNote: string | null;
  createdAt: string;
}

export interface MessageFilters {
  status?: ContactMessageStatus;
  search?: string;
}

function buildListUrl(filters: MessageFilters): string {
  const params = new URLSearchParams();
  if (filters.status) params.set('status', filters.status);
  if (filters.search) params.set('name', filters.search);
  params.set('itemsPerPage', '50');
  return `/admin/contact-messages?${params.toString()}`;
}

const BASE_KEY = ['admin', 'contact-messages'] as const;

export function useMessagesList(filters: MessageFilters = {}) {
  return useQuery({
    queryKey: [...BASE_KEY, 'list', filters] as const,
    queryFn: async () => {
      const payload = await apiCall<unknown>(buildListUrl(filters));
      return unwrapCollection<ContactMessage>(payload);
    },
  });
}

/**
 * Count des messages `nouveau` pour le badge sidebar (PR9 finitions).
 * Pas d'endpoint stats dédié — on lit `totalItems` ou la longueur du listing.
 */
export function useMessagesNewCount() {
  return useQuery({
    queryKey: [...BASE_KEY, 'count-new'] as const,
    queryFn: async () => {
      const payload = await apiCall<unknown>('/admin/contact-messages?status=nouveau&itemsPerPage=1');
      if (payload && typeof payload === 'object') {
        const obj = payload as Record<string, unknown>;
        const total = obj['totalItems'] ?? obj['hydra:totalItems'];
        if (typeof total === 'number') return total;
      }
      return unwrapCollection<ContactMessage>(payload).length;
    },
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

async function patchMessage(
  id: number,
  body: Partial<Pick<ContactMessage, 'status' | 'adminNote'>>,
): Promise<ContactMessage> {
  const res = await fetch(`/api/admin/proxy/admin/contact-messages/${id}`, {
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
  return (await res.json()) as ContactMessage;
}

export function useMessagePatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof patchMessage>[1] }) =>
      patchMessage(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: BASE_KEY }),
  });
}

export { AdminClientError };
