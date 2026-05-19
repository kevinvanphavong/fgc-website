'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiCall, unwrapCollection, AdminClientError } from '@/lib/admin-client';

export type MediaTag = 'hebdo' | 'anniversaires' | 'evenement' | 'bar' | 'salle' | 'global';

export const MEDIA_TAGS: MediaTag[] = ['hebdo', 'anniversaires', 'evenement', 'bar', 'salle', 'global'];

export const MEDIA_TAG_LABELS: Record<MediaTag, string> = {
  hebdo: 'Hebdo',
  anniversaires: 'Anniversaires',
  evenement: 'Événement',
  bar: 'Bar',
  salle: 'Salle',
  global: 'Global',
};

export interface Media {
  '@id'?: string;
  id: number;
  filename: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  tag: MediaTag;
  url: string;
  createdAt: string;
}

const BASE_KEY = ['admin', 'medias'] as const;

export function useMediasList(tag?: MediaTag | 'all') {
  return useQuery({
    queryKey: [...BASE_KEY, 'list', tag ?? 'all'] as const,
    queryFn: async () => {
      const qs = tag && tag !== 'all' ? `?tag=${tag}` : '';
      const payload = await apiCall<unknown>(`/admin/medias${qs}`);
      return unwrapCollection<Media>(payload);
    },
  });
}

export interface UploadInput {
  file: File;
  tag: MediaTag;
}

async function uploadMedia({ file, tag }: UploadInput): Promise<Media> {
  const fd = new FormData();
  fd.set('file', file);
  fd.set('tag', tag);

  const res = await fetch('/api/admin/proxy/admin/medias', {
    method: 'POST',
    body: fd,
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
  return (await res.json()) as Media;
}

export function useMediaUpload() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadMedia,
    onSuccess: () => qc.invalidateQueries({ queryKey: BASE_KEY }),
  });
}

async function patchMedia(id: number, body: { tag: MediaTag }): Promise<Media> {
  const res = await fetch(`/api/admin/proxy/admin/medias/${id}`, {
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
  return (await res.json()) as Media;
}

export function useMediaPatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, tag }: { id: number; tag: MediaTag }) => patchMedia(id, { tag }),
    onSuccess: () => qc.invalidateQueries({ queryKey: BASE_KEY }),
  });
}

async function deleteMedia(id: number): Promise<void> {
  const res = await apiCall<void>(`/admin/medias/${id}`, { method: 'DELETE' });
  return res;
}

export function useMediaDelete() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteMedia(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: BASE_KEY }),
  });
}

export { AdminClientError };
