'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Drawer from '@/components/admin/ui/Drawer';
import { useToast } from '@/components/admin/ui/Toast';
import { cn } from '@/lib/cn';
import {
  useMessagesList,
  useMessagePatch,
  STATUS_ORDER,
  STATUS_META,
  SUBJECT_LABELS,
  AdminClientError,
  type ContactMessage,
  type ContactMessageStatus,
} from '@/lib/admin-hooks/useContactMessages';

export default function MessagesClient() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ContactMessageStatus | 'all'>('all');
  const [drawerId, setDrawerId] = useState<number | null>(null);

  const filters = useMemo(
    () => ({
      status: status === 'all' ? undefined : status,
      search: search.trim() || undefined,
    }),
    [status, search],
  );

  const { data: messages = [], isLoading, isError } = useMessagesList(filters);
  const patch = useMessagePatch();

  const drawerMessage = drawerId ? messages.find((m) => m.id === drawerId) ?? null : null;

  async function transitionStatus(m: ContactMessage, target: ContactMessageStatus) {
    try {
      await patch.mutateAsync({ id: m.id, body: { status: target } });
      toast.success(`${m.reference} → ${STATUS_META[target].label}`);
    } catch (err) {
      const msg = err instanceof AdminClientError ? `Erreur ${err.status}` : 'Erreur';
      toast.error('Transition refusée', msg);
    }
  }

  async function saveNote(m: ContactMessage, note: string) {
    try {
      await patch.mutateAsync({ id: m.id, body: { adminNote: note } });
    } catch (err) {
      const msg = err instanceof AdminClientError ? `Erreur ${err.status}` : 'Erreur';
      toast.error('Note non enregistrée', msg);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <header>
        <h1 className="text-xl font-semibold text-admin-text">Messages contact</h1>
        <p className="mt-0.5 text-sm text-admin-text-muted">
          Messages reçus depuis le formulaire public `/contact`. Volume faible — gestion légère.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2.5 border-b border-admin-border-soft pb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, email…"
          data-admin-search
          className="w-64 rounded-md border border-admin-border bg-admin-bg-elev py-2 pl-3 pr-3 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring max-md:w-full"
          aria-label="Rechercher un message"
        />
        <div className="flex items-center gap-1 rounded-md border border-admin-border bg-admin-bg-elev p-0.5">
          <button
            type="button"
            onClick={() => setStatus('all')}
            className={cn(
              'rounded px-2.5 py-1 text-xs font-medium transition',
              status === 'all'
                ? 'bg-admin-brand-soft text-admin-brand'
                : 'text-admin-text-muted hover:bg-admin-bg-sunken',
            )}
            aria-pressed={status === 'all'}
          >
            Tous
          </button>
          {STATUS_ORDER.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              aria-pressed={status === s}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium transition',
                status === s
                  ? `${STATUS_META[s].pillBg} ${STATUS_META[s].pillText}`
                  : 'text-admin-text-muted hover:bg-admin-bg-sunken',
              )}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
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
      ) : messages.length === 0 ? (
        <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-12 text-center text-sm text-admin-text-muted">
          Aucun message correspondant.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-bg-elev">
          <table className="min-w-full divide-y divide-admin-border-soft text-sm">
            <thead className="bg-admin-bg-sunken/50 text-admin-text-muted">
              <tr>
                <Th>Date</Th>
                <Th>Nom</Th>
                <Th>Sujet</Th>
                <Th>Statut</Th>
                <Th>Aperçu</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-soft">
              {messages.map((m) => {
                const meta = STATUS_META[m.status];
                return (
                  <tr
                    key={m.id}
                    onClick={() => setDrawerId(m.id)}
                    className="cursor-pointer hover:bg-admin-bg-sunken/40"
                  >
                    <td className="px-3 py-2 text-admin-text-muted">
                      {new Date(m.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-admin-text">{m.name}</div>
                      <div className="text-[0.7rem] text-admin-text-muted">{m.email}</div>
                    </td>
                    <td className="px-3 py-2 text-admin-text-muted">
                      {SUBJECT_LABELS[m.subject]}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${meta.pillBg} ${meta.pillText}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${meta.dotBg}`} aria-hidden />
                        {meta.label}
                      </span>
                    </td>
                    <td className="max-w-[320px] truncate px-3 py-2 text-admin-text-muted">
                      {m.message}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <MessageDrawer
        message={drawerMessage}
        open={drawerId !== null}
        onClose={() => setDrawerId(null)}
        onTransition={(target) => drawerMessage && transitionStatus(drawerMessage, target)}
        onSaveNote={(note) => drawerMessage && saveNote(drawerMessage, note)}
        busy={patch.isPending}
      />
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2 text-left text-[0.7rem] font-medium uppercase tracking-wider">
      {children}
    </th>
  );
}

function MessageDrawer({
  message,
  open,
  onClose,
  onTransition,
  onSaveNote,
  busy,
}: {
  message: ContactMessage | null;
  open: boolean;
  onClose: () => void;
  onTransition: (target: ContactMessageStatus) => void;
  onSaveNote: (note: string) => void;
  busy: boolean;
}) {
  const [note, setNote] = useState<string>(message?.adminNote ?? '');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(message?.adminNote ?? '');
  }, [message?.id, message?.adminNote]);

  useEffect(() => {
    if (!message) return;
    if (note === (message.adminNote ?? '')) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onSaveNote(note), 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note, message]);

  if (!message) {
    return (
      <Drawer open={open} onClose={onClose} title="Message" width={520}>
        <p className="text-sm text-admin-text-muted">Aucune sélection.</p>
      </Drawer>
    );
  }

  const transitions: ContactMessageStatus[] = STATUS_ORDER.filter((s) => s !== message.status);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={message.reference}
      description={`${message.name} · ${SUBJECT_LABELS[message.subject]}`}
      width={520}
    >
      <div className="flex flex-col gap-5">
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Coordonnées
          </h3>
          <dl className="grid grid-cols-1 gap-y-2 text-sm">
            <Detail label="Email">
              <a href={`mailto:${message.email}`} className="text-admin-brand hover:underline">
                {message.email}
              </a>
            </Detail>
            {message.phone && (
              <Detail label="Téléphone">
                <a href={`tel:${message.phone}`} className="text-admin-brand hover:underline">
                  {message.phone}
                </a>
              </Detail>
            )}
            <Detail label="Reçu le">
              {new Date(message.createdAt).toLocaleString('fr-FR')}
            </Detail>
          </dl>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Message
          </h3>
          <p className="whitespace-pre-line rounded-md border border-admin-border-soft bg-admin-bg-sunken/40 p-3 text-sm text-admin-text">
            {message.message}
          </p>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Changer le statut
          </h3>
          <div className="flex flex-wrap gap-2">
            {transitions.map((target) => (
              <button
                key={target}
                type="button"
                disabled={busy}
                onClick={() => onTransition(target)}
                className="rounded-md border border-admin-brand/40 bg-admin-brand-soft px-3 py-1.5 text-sm font-medium text-admin-brand hover:bg-admin-brand/15 disabled:opacity-60"
              >
                Marquer <strong>{STATUS_META[target].label}</strong>
              </button>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Note interne
          </h3>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Notes pour suivi interne…"
            rows={4}
            maxLength={2000}
            className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
          />
        </section>
      </div>
    </Drawer>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[0.7rem] uppercase tracking-wider text-admin-text-muted">{label}</dt>
      <dd className="mt-0.5 text-admin-text">{children}</dd>
    </div>
  );
}
