'use client';

import { useQuery } from '@tanstack/react-query';
import { apiCall } from '@/lib/admin-client';

export type ClientTag = 'fidele' | 'vip' | 'b2b';
export type ClientSource = 'anniv' | 'b2b';

export interface ClientAggregate {
  email: string;
  displayName: string;
  phone: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
  totalReservations: number;
  totalAnniv: number;
  totalB2B: number;
  sources: ClientSource[];
  tags: ClientTag[];
}

export interface ClientHistoryEntry {
  kind: 'anniv' | 'b2b';
  id: number;
  reference: string;
  status: string;
  eventDate: string | null;
  value: number | null;
  createdAt: string;
  summary: string;
}

export interface ClientDetail extends ClientAggregate {
  history: ClientHistoryEntry[];
}

export interface ClientStats {
  total: number;
  fideles: number;
  vip: number;
  newRecent: number;
}

export interface ClientListResponse {
  items: ClientAggregate[];
  total: number;
  page: number;
  perPage: number;
}

export interface ClientFilters {
  search?: string;
  tag?: ClientTag;
  from?: string;
  to?: string;
  page?: number;
}

function buildListUrl(filters: ClientFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.tag) params.set('tag', filters.tag);
  if (filters.from) params.set('from', filters.from);
  if (filters.to) params.set('to', filters.to);
  if (filters.page) params.set('page', String(filters.page));
  const qs = params.toString();
  return `/admin/clients${qs ? `?${qs}` : ''}`;
}

const BASE_KEY = ['admin', 'clients'] as const;

export function useClientsList(filters: ClientFilters = {}) {
  return useQuery({
    queryKey: [...BASE_KEY, 'list', filters] as const,
    queryFn: () => apiCall<ClientListResponse>(buildListUrl(filters)),
  });
}

export function useClientsStats() {
  return useQuery({
    queryKey: [...BASE_KEY, 'stats'] as const,
    queryFn: () => apiCall<ClientStats>('/admin/clients/stats'),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useClientDetail(email: string | null) {
  return useQuery({
    queryKey: [...BASE_KEY, 'detail', email] as const,
    queryFn: () => apiCall<ClientDetail>(`/admin/clients/${encodeURIComponent(email as string)}`),
    enabled: email !== null,
  });
}
