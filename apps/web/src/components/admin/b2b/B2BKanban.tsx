'use client';

import { useMemo, useState } from 'react';
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
import { cn } from '@/lib/cn';
import {
  B2B_ALLOWED_TRANSITIONS,
  type B2BRequest,
  type B2BStage,
} from '@/lib/admin-hooks/useB2BRequest';
import {
  B2B_KANBAN_COLUMNS,
  B2B_STAGE_META,
  B2B_TYPE_META,
  formatEUR,
  formatEventDate,
} from '@/lib/admin-hooks/b2b-meta';

interface KanbanProps {
  requests: B2BRequest[];
  onOpen: (r: B2BRequest) => void;
  onTransition: (r: B2BRequest, target: B2BStage) => void;
  onForbiddenTransition: (r: B2BRequest, target: B2BStage) => void;
}

export default function B2BKanban({
  requests,
  onOpen,
  onTransition,
  onForbiddenTransition,
}: KanbanProps) {
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const grouped = useMemo(() => {
    const out: Record<B2BStage, B2BRequest[]> = {
      nouveau: [],
      qualifie: [],
      devis_envoye: [],
      negociation: [],
      gagne: [],
      perdu: [],
    };
    for (const r of requests) out[r.stage]?.push(r);
    return out;
  }, [requests]);

  const draggingItem = draggingId
    ? requests.find((r) => r.id === draggingId) ?? null
    : null;

  function handleDragStart(event: DragStartEvent) {
    setDraggingId(Number(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setDraggingId(null);
    const r = requests.find((x) => x.id === Number(event.active.id));
    if (!r || !event.over) return;
    const targetStage = event.over.id as B2BStage;
    if (targetStage === r.stage) return;
    if (B2B_ALLOWED_TRANSITIONS[r.stage].includes(targetStage)) {
      onTransition(r, targetStage);
    } else {
      onForbiddenTransition(r, targetStage);
    }
  }

  // Sous 1024px : vue mobile (select de stage + liste verticale) — PR8 responsive.
  return (
    <>
      <div className="lg:hidden">
        <B2BMobileList requests={requests} onOpen={onOpen} />
      </div>
      <div className="hidden lg:block">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-3 overflow-x-auto lg:grid-cols-3 xl:grid-cols-6">
            {B2B_KANBAN_COLUMNS.map((stage) => (
              <B2BKanbanColumn
                key={stage}
                stage={stage}
                items={grouped[stage]}
                onOpen={onOpen}
              />
            ))}
          </div>
          <DragOverlay>
            {draggingItem ? (
              <div className="opacity-90">
                <B2BCard request={draggingItem} onClick={() => undefined} dragging />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  );
}

function B2BMobileList({
  requests,
  onOpen,
}: {
  requests: B2BRequest[];
  onOpen: (r: B2BRequest) => void;
}) {
  const [stage, setStage] = useState<B2BStage>('nouveau');
  const filtered = requests.filter((r) => r.stage === stage);
  return (
    <div className="flex flex-col gap-3">
      <select
        value={stage}
        onChange={(e) => setStage(e.target.value as B2BStage)}
        className="w-full rounded-md border border-admin-border bg-admin-bg-elev px-3 py-2 text-sm text-admin-text focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring"
        aria-label="Filtrer par stage"
      >
        {B2B_KANBAN_COLUMNS.map((s) => (
          <option key={s} value={s}>
            {B2B_STAGE_META[s].label} ({requests.filter((r) => r.stage === s).length})
          </option>
        ))}
      </select>
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-6 text-center text-sm text-admin-text-muted">
            Aucune demande dans ce stage.
          </div>
        ) : (
          filtered.map((r) => <B2BCard key={r.id} request={r} onClick={() => onOpen(r)} />)
        )}
      </div>
    </div>
  );
}

function B2BKanbanColumn({
  stage,
  items,
  onOpen,
}: {
  stage: B2BStage;
  items: B2BRequest[];
  onOpen: (r: B2BRequest) => void;
}) {
  const meta = B2B_STAGE_META[stage];
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const totalValueCents = items.reduce((sum, r) => sum + (r.estimatedValueCents ?? 0), 0);

  return (
    <div className="flex min-h-[220px] flex-col rounded-lg border border-admin-border bg-admin-bg-sunken/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', meta.dotBg)} aria-hidden />
          <span className="text-sm font-semibold text-admin-text">{meta.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[0.7rem] text-admin-text-muted">
          <span className="rounded-full bg-admin-bg-elev px-1.5 font-medium">
            {items.length}
          </span>
          {totalValueCents > 0 && (
            <span className="rounded-full bg-admin-bg-elev px-1.5 font-medium">
              {formatEUR(totalValueCents)}
            </span>
          )}
        </div>
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
            <DraggableCard key={r.id} request={r} onClick={() => onOpen(r)} />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  request,
  onClick,
}: {
  request: B2BRequest;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: request.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn(isDragging && 'opacity-30')}
    >
      <B2BCard request={request} onClick={onClick} />
    </div>
  );
}

function B2BCard({
  request,
  onClick,
  dragging,
}: {
  request: B2BRequest;
  onClick: () => void;
  dragging?: boolean;
}) {
  const typeMeta = B2B_TYPE_META[request.type];
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerUp={(e) => {
        if (dragging) e.preventDefault();
      }}
      className={cn(
        'w-full rounded-md border border-admin-border bg-admin-bg-elev p-3 text-left text-sm shadow-sm transition',
        'hover:border-admin-brand/40 hover:shadow-md focus:outline-none focus-visible:border-admin-brand focus-visible:ring-2 focus-visible:ring-admin-brand-ring',
        dragging && 'shadow-lg',
      )}
    >
      <div className="flex items-center justify-between text-[0.7rem] text-admin-text-muted">
        <span className="font-medium text-admin-brand">{request.reference}</span>
        <span>{typeMeta.emoji}</span>
      </div>
      <div className="mt-1 font-semibold text-admin-text">
        {request.companyName}
      </div>
      <div className="text-xs text-admin-text-muted">
        {request.contactFirstName} {request.contactLastName} · {request.expectedAttendees} pers.
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-admin-text-muted">
        <span>{formatEventDate(request.eventDate)}</span>
        {request.estimatedValueCents !== null && (
          <span className="font-medium text-admin-text">{formatEUR(request.estimatedValueCents)}</span>
        )}
      </div>
    </button>
  );
}
