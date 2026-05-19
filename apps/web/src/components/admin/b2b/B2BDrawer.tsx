'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Drawer from '@/components/admin/ui/Drawer';
import B2BStatusPill from './B2BStatusPill';
import { cn } from '@/lib/cn';
import {
  B2B_STAGE_META,
  B2B_TYPE_META,
  formatEUR,
  formatEventDate,
} from '@/lib/admin-hooks/b2b-meta';
import {
  B2B_ALLOWED_TRANSITIONS,
  type B2BRequest,
  type B2BStage,
} from '@/lib/admin-hooks/useB2BRequest';

interface DrawerProps {
  request: B2BRequest | null;
  open: boolean;
  onClose: () => void;
  onTransition: (target: B2BStage) => Promise<void> | void;
  onSaveNote: (note: string) => Promise<void> | void;
  onSaveValue: (cents: number | null) => Promise<void> | void;
  busy?: boolean;
}

export default function B2BDrawer({
  request,
  open,
  onClose,
  onTransition,
  onSaveNote,
  onSaveValue,
  busy,
}: DrawerProps) {
  const [note, setNote] = useState<string>(request?.adminNote ?? '');
  const [savingNote, setSavingNote] = useState(false);
  const [valueEuros, setValueEuros] = useState<string>(
    request?.estimatedValueCents !== null && request?.estimatedValueCents !== undefined
      ? String(request.estimatedValueCents / 100)
      : '',
  );
  const [savingValue, setSavingValue] = useState(false);
  const [confirmLossOpen, setConfirmLossOpen] = useState(false);

  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Re-init quand la demande change.
  useEffect(() => {
    setNote(request?.adminNote ?? '');
    setValueEuros(
      request?.estimatedValueCents !== null && request?.estimatedValueCents !== undefined
        ? String(request.estimatedValueCents / 100)
        : '',
    );
  }, [request?.id, request?.adminNote, request?.estimatedValueCents]);

  // Autosave note 800ms.
  useEffect(() => {
    if (!request) return;
    if (note === (request.adminNote ?? '')) return;
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(async () => {
      setSavingNote(true);
      try {
        await onSaveNote(note);
      } finally {
        setSavingNote(false);
      }
    }, 800);
    return () => {
      if (noteTimer.current) clearTimeout(noteTimer.current);
    };
  }, [note, request, onSaveNote]);

  // Autosave estimated value 800ms.
  useEffect(() => {
    if (!request) return;
    const currentCents = request.estimatedValueCents;
    const parsed = valueEuros.trim() === '' ? null : Math.round(Number(valueEuros) * 100);
    if (parsed !== null && Number.isNaN(parsed)) return;
    if (parsed === currentCents) return;
    if (valueTimer.current) clearTimeout(valueTimer.current);
    valueTimer.current = setTimeout(async () => {
      setSavingValue(true);
      try {
        await onSaveValue(parsed);
      } finally {
        setSavingValue(false);
      }
    }, 800);
    return () => {
      if (valueTimer.current) clearTimeout(valueTimer.current);
    };
  }, [valueEuros, request, onSaveValue]);

  const allowedTransitions = useMemo<B2BStage[]>(() => {
    if (!request) return [];
    return B2B_ALLOWED_TRANSITIONS[request.stage];
  }, [request]);

  if (!request) {
    return (
      <Drawer open={open} onClose={onClose} title="Demande B2B" width={560}>
        <div className="text-sm text-admin-text-muted">Aucune sélection.</div>
      </Drawer>
    );
  }

  const typeMeta = B2B_TYPE_META[request.type];

  // mailto pré-rempli — V1 sans génération PDF.
  const mailtoSubject = encodeURIComponent(`Devis Family Games Center · ${request.companyName} (${request.reference})`);
  const mailtoBody = encodeURIComponent(
    [
      `Bonjour ${request.contactFirstName},`,
      '',
      `Suite à votre demande de devis pour ${typeMeta.label.toLowerCase()} (${request.expectedAttendees} pers.${request.eventDate ? `, ${request.eventDate}` : ''}), veuillez trouver ci-joint notre proposition.`,
      '',
      'Restant à votre disposition,',
      "L'équipe Family Games Center",
      '',
      `Référence : ${request.reference}`,
    ].join('\n'),
  );
  const mailtoHref = `mailto:${request.contactEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={request.reference}
      description={B2B_STAGE_META[request.stage].description}
      width={560}
    >
      <div className="flex flex-col gap-5">
        <div className="-mt-2">
          <B2BStatusPill stage={request.stage} size="md" />
        </div>

        {/* Bloc 1 — récap */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Détails de la demande
          </h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <Detail label="Entreprise" colSpan={2}>{request.companyName}</Detail>
            <Detail label="Type">{typeMeta.emoji} {typeMeta.label}</Detail>
            <Detail label="Participants">{request.expectedAttendees}</Detail>
            <Detail label="Date" colSpan={2}>{formatEventDate(request.eventDate)}</Detail>
            {request.message && (
              <Detail label="Message" colSpan={2}>{request.message}</Detail>
            )}
          </dl>
        </section>

        {/* Bloc 2 — contact */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Contact
          </h3>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <Detail label="Nom" colSpan={2}>
              {request.contactFirstName} {request.contactLastName}
            </Detail>
            <Detail label="Email" colSpan={2}>
              <a
                href={`mailto:${request.contactEmail}`}
                className="text-admin-brand hover:underline"
              >
                {request.contactEmail}
              </a>
            </Detail>
            <Detail label="Téléphone">
              <a
                href={`tel:${request.contactPhone}`}
                className="text-admin-brand hover:underline"
              >
                {request.contactPhone}
              </a>
            </Detail>
          </dl>
        </section>

        {/* Bloc 3 — montant estimé */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Montant estimé du devis
            </h3>
            <span
              className={cn(
                'text-[0.7rem]',
                savingValue ? 'text-admin-amber' : 'text-admin-text-muted',
              )}
              aria-live="polite"
            >
              {savingValue ? '… enregistrement' : 'Auto-enregistré'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              step="1"
              value={valueEuros}
              onChange={(e) => setValueEuros(e.target.value)}
              placeholder="Ex : 1500"
              className="w-40 rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
            />
            <span className="text-sm text-admin-text-muted">€ HT</span>
          </div>
          <p className="mt-1 text-[0.7rem] text-admin-text-muted">
            Alimente la tuile « Pipeline B2B » du dashboard.
          </p>
        </section>

        {/* Bloc 4 — transitions */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Faire évoluer le stage
          </h3>
          {allowedTransitions.length === 0 ? (
            <p className="text-sm text-admin-text-muted">
              Stage terminal — aucune transition possible.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {allowedTransitions.map((target) => (
                <button
                  key={target}
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (target === 'perdu') {
                      setConfirmLossOpen(true);
                    } else {
                      onTransition(target);
                    }
                  }}
                  className={cn(
                    'rounded-md border px-3 py-1.5 text-sm font-medium transition',
                    target === 'perdu'
                      ? 'border-admin-red/40 bg-admin-red-soft text-admin-red hover:bg-admin-red/10'
                      : target === 'gagne'
                        ? 'border-admin-green/40 bg-admin-green-soft text-admin-green hover:bg-admin-green/10'
                        : 'border-admin-brand/40 bg-admin-brand-soft text-admin-brand hover:bg-admin-brand/15',
                    busy && 'opacity-60',
                  )}
                >
                  Passer à <strong>{B2B_STAGE_META[target].label}</strong>
                </button>
              ))}
            </div>
          )}

          {confirmLossOpen && (
            <div className="mt-3 rounded-md border border-admin-red/30 bg-admin-red-soft p-3 text-sm text-admin-red">
              <p className="font-medium">Confirmer la perte de l'opportunité ?</p>
              <p className="mt-1 text-xs">
                Stage terminal. Aucun email automatique n'est envoyé au client
                (V1 manuel).
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    setConfirmLossOpen(false);
                    await onTransition('perdu');
                  }}
                  disabled={busy}
                  className="rounded-md bg-admin-red px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-red/90 disabled:opacity-60"
                >
                  Oui, marquer perdu
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmLossOpen(false)}
                  className="rounded-md border border-admin-border bg-admin-bg-elev px-3 py-1.5 text-sm text-admin-text hover:bg-admin-bg-sunken"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Bloc 5 — note interne */}
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Note interne
            </h3>
            <span
              className={cn(
                'text-[0.7rem]',
                savingNote ? 'text-admin-amber' : 'text-admin-text-muted',
              )}
              aria-live="polite"
            >
              {savingNote ? '… enregistrement' : 'Auto-enregistrée'}
            </span>
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Compte-rendu d'appel, contraintes, négociation…"
            rows={5}
            maxLength={2000}
            className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
          />
        </section>

        {/* Bloc 6 — timeline */}
        <section>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
            Historique
          </h3>
          <ol className="space-y-2 text-sm">
            <TimelineRow label="Demande créée" iso={request.createdAt} />
            <TimelineRow label="Qualifiée" iso={request.internalQualifiedAt} />
            <TimelineRow label="Devis envoyé" iso={request.internalQuotedAt} />
            <TimelineRow label="Négociation" iso={request.internalNegotiatedAt} />
            <TimelineRow
              label={request.stage === 'gagne' ? 'Gagnée' : request.stage === 'perdu' ? 'Perdue' : 'Clôturée'}
              iso={request.internalClosedAt}
              variant={request.stage === 'perdu' ? 'danger' : request.stage === 'gagne' ? 'success' : 'default'}
            />
          </ol>
        </section>

        {/* Footer — envoyer le devis (mailto) */}
        <div className="sticky bottom-0 -mx-4 mt-2 border-t border-admin-border bg-admin-bg-elev px-4 py-3">
          <a
            href={mailtoHref}
            className="inline-flex w-full items-center justify-center rounded-md bg-admin-brand px-4 py-2 text-sm font-medium text-white hover:bg-admin-brand-deep"
          >
            ✉️ Envoyer le devis par email (brouillon)
          </a>
          <p className="mt-1.5 text-[0.7rem] text-admin-text-muted">
            V1 : ouvre votre client mail avec un brouillon pré-rempli. Génération PDF auto en V2.
          </p>
        </div>
      </div>
    </Drawer>
  );
}

function Detail({
  label,
  children,
  colSpan,
}: {
  label: string;
  children: React.ReactNode;
  colSpan?: 1 | 2;
}) {
  return (
    <div className={cn(colSpan === 2 ? 'col-span-2' : 'col-span-1')}>
      <dt className="text-[0.7rem] uppercase tracking-wider text-admin-text-muted">{label}</dt>
      <dd className="mt-0.5 text-admin-text">{children}</dd>
    </div>
  );
}

function TimelineRow({
  label,
  iso,
  variant = 'default',
}: {
  label: string;
  iso: string | null;
  variant?: 'default' | 'success' | 'danger';
}) {
  if (!iso) {
    return (
      <li className="flex items-center gap-2 text-admin-text-muted/70">
        <span className="h-1.5 w-1.5 rounded-full bg-admin-border" aria-hidden />
        <span>{label}</span>
        <span className="text-[0.7rem]">·</span>
        <span className="text-[0.7rem] italic">non passée</span>
      </li>
    );
  }
  const date = new Date(iso);
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          variant === 'danger'
            ? 'bg-admin-red'
            : variant === 'success'
              ? 'bg-admin-green'
              : 'bg-admin-brand',
        )}
        aria-hidden
      />
      <span className="text-admin-text">{label}</span>
      <span className="text-[0.7rem] text-admin-text-muted">·</span>
      <span className="text-[0.7rem] text-admin-text-muted">
        {date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}{' '}
        {date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </li>
  );
}
