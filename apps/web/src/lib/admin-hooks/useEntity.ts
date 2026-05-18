'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall, unwrapCollection, AdminClientError } from '@/lib/admin-client';

/** Génère un set de hooks CRUD pour une ressource API Platform donnée. */
export function makeEntityHooks<T extends { id?: number; '@id'?: string }>(
  collection: string // ex: "hebdo_cards"
) {
  const baseKey = ['admin', collection] as const;

  function useList() {
    return useQuery({
      queryKey: baseKey,
      queryFn: async () => {
        const payload = await apiCall<unknown>(`/${collection}`);
        return unwrapCollection<T>(payload);
      },
    });
  }

  function useCreate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (body: Partial<T>) =>
        apiCall<T>(`/${collection}`, { method: 'POST', body }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: baseKey });
      },
    });
  }

  function useUpdate() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, body }: { id: number; body: Partial<T> }) =>
        apiCall<T>(`/${collection}/${id}`, { method: 'PUT', body }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: baseKey });
      },
    });
  }

  function useRemove() {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: (id: number) =>
        apiCall<void>(`/${collection}/${id}`, { method: 'DELETE' }),
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: baseKey });
      },
    });
  }

  return { useList, useCreate, useUpdate, useRemove, baseKey };
}

/**
 * Extrait un message lisible depuis une erreur API Platform (JSON-LD).
 * Utile pour les toasts.
 */
export function extractErrorMessage(err: unknown): string {
  if (err instanceof AdminClientError) {
    const body = err.body as
      | {
          violations?: { propertyPath: string; message: string }[];
          'hydra:description'?: string;
          detail?: string;
        }
      | null;
    if (body?.violations?.length) {
      return body.violations.map((v) => `${v.propertyPath}: ${v.message}`).join(' · ');
    }
    return body?.['hydra:description'] ?? body?.detail ?? `Erreur API ${err.status}`;
  }
  return (err as Error)?.message ?? 'Erreur inconnue';
}
