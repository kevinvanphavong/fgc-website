'use client';

import { useEffect, useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { useToast } from '@/components/admin/ui/Toast';
import {
  useMediaUpload,
  MEDIA_TAGS,
  MEDIA_TAG_LABELS,
  AdminClientError,
  type MediaTag,
} from '@/lib/admin-hooks/useMedia';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

interface ModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MediaUploadModal({ open, onClose }: ModalProps) {
  const toast = useToast();
  const upload = useMediaUpload();
  const [file, setFile] = useState<File | null>(null);
  const [tag, setTag] = useState<MediaTag>('global');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      setFile(null);
      setTag('global');
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  function selectFile(f: File | null) {
    if (!f) return;
    if (!ALLOWED_MIMES.includes(f.type)) {
      toast.error('Type non supporté', `${f.type || 'inconnu'} — formats acceptés : JPG, PNG, WebP, GIF, AVIF.`);
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error('Fichier trop volumineux', `${Math.round(f.size / 1024 / 1024)} Mo > 5 Mo max.`);
      return;
    }
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(f));
  }

  async function submit() {
    if (!file) return;
    try {
      await upload.mutateAsync({ file, tag });
      toast.success('Upload réussi', file.name);
      onClose();
    } catch (err) {
      if (err instanceof AdminClientError) {
        const body = err.body as { error?: string } | null;
        toast.error('Upload refusé', body?.error ?? `Erreur ${err.status}`);
      } else {
        toast.error('Upload refusé', (err as Error)?.message ?? 'Erreur inconnue');
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-admin-bg-elev p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-admin-border pb-3">
          <h2 className="text-lg font-semibold text-admin-text">Importer un média</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-admin-text-muted hover:bg-admin-bg-sunken"
            aria-label="Fermer"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) selectFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={`mt-4 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition ${
            dragging
              ? 'border-admin-brand bg-admin-brand-soft/40'
              : 'border-admin-border bg-admin-bg-sunken/30 hover:border-admin-brand/40'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED_MIMES.join(',')}
            onChange={(e) => selectFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={file?.name ?? ''}
              className="mx-auto max-h-40 rounded shadow"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-admin-text-muted">
              <Icon icon={Upload} size={32} className="text-admin-text-muted" />
              <p className="text-sm">Glisse-dépose un fichier, ou clique pour parcourir.</p>
              <p className="text-[0.7rem]">JPG, PNG, WebP, GIF, AVIF · 5 Mo max · 4000×4000 max</p>
            </div>
          )}
        </div>

        {file && (
          <p className="mt-2 truncate text-xs text-admin-text-muted">
            {file.name} · {Math.round(file.size / 1024)} Ko
          </p>
        )}

        <div className="mt-4">
          <label className="mb-1 block text-xs font-medium uppercase tracking-wider text-admin-text-muted">
            Tag
          </label>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as MediaTag)}
            className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
          >
            {MEDIA_TAGS.map((t) => (
              <option key={t} value={t}>
                {MEDIA_TAG_LABELS[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-admin-border bg-admin-bg-elev px-3 py-1.5 text-sm text-admin-text hover:bg-admin-bg-sunken"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!file || upload.isPending}
            className="inline-flex items-center gap-1.5 rounded-md bg-admin-brand px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-brand-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {upload.isPending ? 'Upload…' : 'Importer'}
          </button>
        </div>
      </div>
    </div>
  );
}
