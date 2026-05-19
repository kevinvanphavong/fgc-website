'use client';

import { useEffect, useMemo, useState } from 'react';
import ReservationsToolbar, {
  type PeriodPreset,
  type ViewMode,
} from './ReservationsToolbar';
import ReservationsKanban from './ReservationsKanban';
import ReservationsTable from './ReservationsTable';
import ReservationDrawer from './ReservationDrawer';
import { useToast } from '@/components/admin/ui/Toast';
import {
  useReservationsList,
  useReservationPatch,
  STATUS_ORDER,
  AdminClientError,
  type DemandeListFilters,
  type DemandeReservation,
  type ReservationStatus,
} from '@/lib/admin-hooks/useDemandeReservation';
import { STATUS_META } from '@/lib/admin-hooks/reservation-meta';

const VIEW_STORAGE_KEY = 'fgc.admin.resa.view';

function periodToDates(p: PeriodPreset): { from?: string } {
  if (p === 'all') return {};
  const days = p === '7j' ? 7 : 30;
  const d = new Date();
  d.setDate(d.getDate() - days);
  return { from: d.toISOString().slice(0, 10) };
}

export default function ReservationsClient() {
  const toast = useToast();
  const [view, setView] = useState<ViewMode>('kanban');
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<Set<ReservationStatus>>(new Set());
  const [period, setPeriod] = useState<PeriodPreset>('all');
  const [drawerId, setDrawerId] = useState<number | null>(null);

  // Restore view préf depuis localStorage.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === 'kanban' || stored === 'table') setView(stored);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  const filters = useMemo<DemandeListFilters>(() => {
    const statusArr = Array.from(statuses);
    return {
      status: statusArr.length > 0 ? statusArr : undefined,
      search: search.trim() || undefined,
      ...periodToDates(period),
      itemsPerPage: 100,
    };
  }, [statuses, search, period]);

  const { data: reservations = [], isLoading, isError } = useReservationsList(filters);
  const patch = useReservationPatch();

  const sorted = useMemo(() => {
    return [...reservations].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [reservations]);

  const drawerReservation = drawerId
    ? sorted.find((r) => r.id === drawerId) ?? null
    : null;

  async function transitionStatus(r: DemandeReservation, target: ReservationStatus) {
    try {
      await patch.mutateAsync({ id: r.id, body: { status: target } });
      toast.success(
        `Demande ${r.reference} → ${STATUS_META[target].label}`,
        target === 'refuse'
          ? "Pensez à prévenir le client par téléphone (V1 sans email auto)."
          : undefined,
      );
    } catch (err) {
      const msg = err instanceof AdminClientError
        ? extractErrorMessage(err)
        : 'Échec de la transition.';
      toast.error('Transition refusée', msg);
    }
  }

  function onForbiddenTransition(r: DemandeReservation, target: ReservationStatus) {
    toast.error(
      'Transition non autorisée',
      `${STATUS_META[r.status].label} → ${STATUS_META[target].label} n'est pas un mouvement valide.`,
    );
  }

  async function saveNote(note: string) {
    if (!drawerReservation) return;
    try {
      await patch.mutateAsync({ id: drawerReservation.id, body: { adminNote: note } });
      toast.success('Note enregistrée');
    } catch (err) {
      const msg = err instanceof AdminClientError ? extractErrorMessage(err) : 'Échec.';
      toast.error("L'enregistrement de la note a échoué", msg);
    }
  }

  function toggleStatus(s: ReservationStatus) {
    setStatuses((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-admin-text">Réservations anniversaire</h1>
          <p className="mt-0.5 text-sm text-admin-text-muted">
            Suivi des demandes du tunnel public. Drag&drop pour faire évoluer le statut, clic pour ouvrir le détail.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-admin-text-muted">
          {STATUS_ORDER.map((s) => {
            const count = sorted.filter((r) => r.status === s).length;
            return (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-full border border-admin-border bg-admin-bg-elev px-2 py-0.5"
              >
                <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[s].dotBg}`} aria-hidden />
                {STATUS_META[s].label} · <strong className="text-admin-text">{count}</strong>
              </span>
            );
          })}
        </div>
      </header>

      <ReservationsToolbar
        search={search}
        onSearchChange={setSearch}
        statuses={statuses}
        onToggleStatus={toggleStatus}
        period={period}
        onPeriodChange={setPeriod}
        view={view}
        onViewChange={setView}
      />

      {isError && (
        <div className="rounded-md border border-admin-red/40 bg-admin-red-soft p-3 text-sm text-admin-red">
          Échec du chargement — vérifier que l'API tourne sur le port 8000.
        </div>
      )}

      {isLoading ? (
        <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-12 text-center text-sm text-admin-text-muted">
          Chargement…
        </div>
      ) : view === 'kanban' ? (
        <ReservationsKanban
          reservations={sorted}
          onOpen={(r) => setDrawerId(r.id)}
          onTransition={transitionStatus}
          onForbiddenTransition={onForbiddenTransition}
        />
      ) : (
        <ReservationsTable
          reservations={sorted}
          onOpen={(r) => setDrawerId(r.id)}
        />
      )}

      <ReservationDrawer
        reservation={drawerReservation}
        open={drawerId !== null}
        onClose={() => setDrawerId(null)}
        onTransition={async (target) => {
          if (!drawerReservation) return;
          await transitionStatus(drawerReservation, target);
        }}
        onSaveNote={saveNote}
        busy={patch.isPending}
      />
    </div>
  );
}

function extractErrorMessage(err: AdminClientError): string {
  const body = err.body as
    | { violations?: { propertyPath: string; message: string }[]; detail?: string; 'hydra:description'?: string }
    | null;
  if (body?.violations?.length) {
    return body.violations.map((v) => `${v.propertyPath}: ${v.message}`).join(' · ');
  }
  return body?.['hydra:description'] ?? body?.detail ?? `Erreur ${err.status}`;
}
