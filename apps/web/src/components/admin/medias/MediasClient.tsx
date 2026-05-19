'use client';

import { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { useToast } from '@/components/admin/ui/Toast';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import MediaUploadModal from './MediaUploadModal';
import { cn } from '@/lib/cn';
import {
  useMediasList,
  useMediaDelete,
  useMediaPatch,
  MEDIA_TAGS,
  MEDIA_TAG_LABELS,
  AdminClientError,
  type Media,
  type MediaTag,
} from '@/lib/admin-hooks/useMedia';

export default function MediasClient() {
  const toast = useToast();
  const [tagFilter, setTagFilter] = useState<MediaTag | 'all'>('all');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Media | null>(null);

  const { data: medias = [], isLoading, isError } = useMediasList(tagFilter);
  const deleteMutation = useMediaDelete();
  const patchMutation = useMediaPatch();

  async function confirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteMutation.mutateAsync(pendingDelete.id);
      toast.success('Média supprimé', pendingDelete.originalName);
    } catch (err) {
      const msg = err instanceof AdminClientError ? `Erreur ${err.status}` : 'Erreur';
      toast.error('Suppression refusée', msg);
    } finally {
      setPendingDelete(null);
    }
  }

  async function changeTag(media: Media, tag: MediaTag) {
    if (tag === media.tag) return;
    try {
      await patchMutation.mutateAsync({ id: media.id, tag });
      toast.success('Tag mis à jour');
    } catch (err) {
      const msg = err instanceof AdminClientError ? `Erreur ${err.status}` : 'Erreur';
      toast.error('Échec de la mise à jour', msg);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-admin-text">Médias & affiches</h1>
          <p className="mt-0.5 text-sm text-admin-text-muted">
            Bibliothèque d'images uploadées (5 Mo max, JPG/PNG/WebP/GIF/AVIF).
          </p>
        </div>
        <button
          type="button"
          onClick={() => setUploadOpen(true)}
          className="inline-flex items-center gap-2 rounded-md bg-admin-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-brand-deep"
        >
          <Icon icon={Upload} size={14} />
          Importer
        </button>
      </header>

      <div className="flex flex-wrap items-center gap-1 rounded-md border border-admin-border bg-admin-bg-elev p-0.5">
        {(['all' as const, ...MEDIA_TAGS]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTagFilter(t)}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition',
              tagFilter === t
                ? 'bg-admin-brand-soft text-admin-brand'
                : 'text-admin-text-muted hover:bg-admin-bg-sunken',
            )}
            aria-pressed={tagFilter === t}
          >
            {t === 'all' ? 'Tout' : MEDIA_TAG_LABELS[t]}
          </button>
        ))}
      </div>

      {isError && (
        <div className="rounded-md border border-admin-red/40 bg-admin-red-soft p-3 text-sm text-admin-red">
          Échec du chargement.
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-12 text-center text-sm text-admin-text-muted">
          Chargement…
        </div>
      ) : medias.length === 0 ? (
        <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-12 text-center text-sm text-admin-text-muted">
          Aucun média {tagFilter !== 'all' ? `avec le tag "${MEDIA_TAG_LABELS[tagFilter]}"` : ''}.
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}
        >
          {medias.map((m) => (
            <MediaCard
              key={m.id}
              media={m}
              onDelete={() => setPendingDelete(m)}
              onChangeTag={(tag) => changeTag(m, tag)}
            />
          ))}
        </div>
      )}

      <MediaUploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer ce média ?"
        description={
          pendingDelete
            ? `${pendingDelete.originalName} sera supprimé du serveur. Action irréversible.`
            : ''
        }
        confirmLabel="Supprimer"
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
        pending={deleteMutation.isPending}
      />
    </div>
  );
}

function MediaCard({
  media,
  onDelete,
  onChangeTag,
}: {
  media: Media;
  onDelete: () => void;
  onChangeTag: (tag: MediaTag) => void;
}) {
  const apiOrigin =
    process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api$/, '') ?? 'http://127.0.0.1:8000';
  const fullUrl = `${apiOrigin}${media.url}`;
  const sizeKb = Math.round(media.sizeBytes / 1024);

  return (
    <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-bg-elev">
      <div className="relative aspect-square bg-admin-bg-sunken">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={fullUrl}
          alt={media.originalName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="space-y-1.5 p-2.5">
        <div className="truncate text-xs font-medium text-admin-text" title={media.originalName}>
          {media.originalName}
        </div>
        <div className="flex items-center justify-between gap-2 text-[0.7rem] text-admin-text-muted">
          <span>
            {media.width && media.height ? `${media.width}×${media.height}` : '—'}
          </span>
          <span>{sizeKb} Ko</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <select
            value={media.tag}
            onChange={(e) => onChangeTag(e.target.value as MediaTag)}
            className="flex-1 rounded border border-admin-border bg-admin-bg-elev px-1.5 py-1 text-[0.7rem] text-admin-text focus:border-admin-brand focus:outline-none"
            aria-label="Tag du média"
          >
            {MEDIA_TAGS.map((t) => (
              <option key={t} value={t}>
                {MEDIA_TAG_LABELS[t]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={onDelete}
            className="rounded p-1 text-admin-text-muted hover:bg-admin-red-soft hover:text-admin-red"
            aria-label="Supprimer"
            title="Supprimer"
          >
            <Icon icon={Trash2} size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
