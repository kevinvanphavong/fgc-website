'use client';

import { useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import {
  ALLOWED_TRANSITIONS,
  type DemandeReservation,
  type ReservationStatus,
} from '@/lib/admin-hooks/useDemandeReservation';
import {
  FORMULE_META,
  KANBAN_COLUMNS,
  STATUS_META,
  formatEventDate,
  formatSlot,
} from '@/lib/admin-hooks/reservation-meta';

interface KanbanProps {
  reservations: DemandeReservation[];
  onOpen: (r: DemandeReservation) => void;
  onTransition: (r: DemandeReservation, target: ReservationStatus) => void;
  onForbiddenTransition: (r: DemandeReservation, target: ReservationStatus) => void;
}

export default function ReservationsKanban({
  reservations,
  onOpen,
  onTransition,
  onForbiddenTransition,
}: KanbanProps) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const out: Record<ReservationStatus, DemandeReservation[]> = {
      nouveau: [],
      contacte: [],
      confirme: [],
      passe: [],
      refuse: [],
    };
    for (const r of reservations) out[r.status]?.push(r);
    return out;
  }, [reservations]);

  const draggingItem = draggingId
    ? reservations.find((r) => r.id === draggingId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const r = reservations.find((x) => x.id === Number(event.active.id));
    if (!r || !event.over) return;
    const targetStatus = event.over.id as ReservationStatus;
    if (targetStatus === r.status) return;
    if (ALLOWED_TRANSITIONS[r.status].includes(targetStatus)) {
      onTransition(r, targetStatus);
    } else {
      onForbiddenTransition(r, targetStatus);
    }
  }

  // Sous 1024px : vue mobile (select de statut + liste verticale).
  return (
    <>
      <div className="lg:hidden">
        <ReservationsMobileList reservations={reservations} onOpen={onOpen} />
      </div>
      <div className="hidden lg:block">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-3 overflow-x-auto lg:grid-cols-3 xl:grid-cols-5">
            {KANBAN_COLUMNS.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                items={grouped[status]}
                onOpen={onOpen}
              />
            ))}
          </div>
          <DragOverlay>
            {draggingItem ? (
              <div className="opacity-90">
                <ReservationCard reservation={draggingItem} onClick={() => undefined} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
}

function ReservationsMobileList({
  reservations,
  onOpen,
}: {
  reservations: DemandeReservation[];
  onOpen: (r: DemandeReservation) => void;
}) {
  const [status, setStatus] = useState<ReservationStatus>('nouveau');
  const filtered = reservations.filter((r) => r.status === status);
  return (
    <div className="flex flex-col gap-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as ReservationStatus)}
        className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
        aria-label="Filtrer par statut"
      >
        {KANBAN_COLUMNS.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label} ({reservations.filter((r) => r.status === s).length})
          </option>
        ))}
      </select>
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-6 text-center text-sm text-admin-text-muted">
            Aucune demande dans ce statut.
          </div>
        ) : (
          filtered.map((r) => <ReservationCard key={r.id} reservation={r} onClick={() => onOpen(r)} />)
        )}
      </div>
    </div>
  );
}

function KanbanColumn({
  status,
  items,
  onOpen,
}: {
  status: ReservationStatus;
  items: DemandeReservation[];
  onOpen: (r: DemandeReservation) => void;
}) {
  const meta = STATUS_META[status];
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex min-h-[220px] flex-col rounded-lg border border-admin-border bg-admin-bg-sunken/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', meta.dotBg)} aria-hidden />
          <span className="text-sm font-semibold text-admin-text">{meta.label}</span>
        </div>
        <span className="rounded-full bg-admin-bg-elev px-1.5 text-xs font-medium text-admin-text-muted">
          {items.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-1 flex-col gap-2 rounded-md border-2 border-dashed transition-colors',
          isOver
            ? 'border-admin-brand bg-admin-brand-soft/40'
            : 'border-transparent',
        )}
      >
        {items.length === 0 ? (
          <div className="grid h-full place-items-center p-4 text-xs text-admin-text-muted">
            Aucune demande
          </div>
        ) : (
          items.map((r) => (
            <DraggableCard key={r.id} reservation={r} onClick={() => onOpen(r)} />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  reservation,
  onClick,
}: {
  reservation: DemandeReservation;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: reservation.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(isDragging && 'opacity-30')}
    >
      <ReservationCard reservation={reservation} onClick={onClick} />
    </div>
  );
}

function ReservationCard({
  reservation,
  onClick,
  dragging,
}: {
  reservation: DemandeReservation;
  onClick: () => void;
  dragging?: boolean;
}) {
  const formule = FORMULE_META[reservation.formuleKey];
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerUp={(e) => {
        // Si pointerup vient d'un drag → @dnd-kit a déjà géré, on évite
        // le click pour ne pas ouvrir le drawer après un drop.
        if (dragging) e.preventDefault();
      }}
      className={cn(
        'w-full rounded-md border border-admin-border bg-admin-bg-elev p-3 text-left text-sm shadow-sm transition',
        'hover:border-admin-brand/40 hover:shadow-md focus:outline-none focus-visible:border-admin-brand focus-visible:ring-2 focus-visible:ring-admin-brand-ring',
        dragging && 'shadow-lg',
      )}
    >
      <div className="flex items-center justify-between text-[0.7rem] text-admin-text-muted">
        <span className="font-medium text-admin-brand">{reservation.reference}</span>
        <span>{formule?.icon}</span>
      </div>
      <div className="mt-1 font-semibold text-admin-text">
        {reservation.childName} · {reservation.childAge} ans
      </div>
      <div className="text-xs text-admin-text-muted">
        {formule?.label ?? reservation.formuleKey} · {reservation.kidsCount} enfants
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-admin-text-muted">
        <span>{formatEventDate(reservation.eventDate)}</span>
        <span>{formatSlot(reservation.timeSlot)}</span>
      </div>
    </button>
  );
}
