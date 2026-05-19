'use client';

import { useMemo, useState } from 'react';
import B2BToolbar, { type B2BTypeFilter } from './B2BToolbar';
import B2BKanban from './B2BKanban';
import B2BDrawer from './B2BDrawer';
import B2BKpiCards from './B2BKpiCards';
import { useToast } from '@/components/admin/ui/Toast';
import {
  useB2BList,
  useB2BPatch,
  useB2BStats,
  AdminClientError,
  type B2BListFilters,
  type B2BRequest,
  type B2BStage,
} from '@/lib/admin-hooks/useB2BRequest';
import { B2B_STAGE_META } from '@/lib/admin-hooks/b2b-meta';

export default function B2BClient() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<B2BTypeFilter>('all');
  const [drawerId, setDrawerId] = useState<number | null>(null);

  const filters = useMemo<B2BListFilters>(() => {
    return {
      type: typeFilter === 'all' ? undefined : typeFilter,
      search: search.trim() || undefined,
      itemsPerPage: 100,
    };
  }, [typeFilter, search]);

  const { data: requests = [], isLoading, isError } = useB2BList(filters);
  const { data: stats, isLoading: statsLoading } = useB2BStats();
  const patch = useB2BPatch();

  const sorted = useMemo(() => {
    return [...requests].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [requests]);

  const drawerRequest = drawerId
    ? sorted.find((r) => r.id === drawerId) ?? null
    : null;

  async function transitionStage(r: B2BRequest, target: B2BStage) {
    try {
      await patch.mutateAsync({ id: r.id, body: { stage: target } });
      toast.success(
        `Demande ${r.reference} → ${B2B_STAGE_META[target].label}`,
        target === 'perdu'
          ? 'Pensez à informer le client par téléphone (V1 sans email auto).'
          : undefined,
      );
    } catch (err) {
      const msg = err instanceof AdminClientError ? extractErrorMessage(err) : 'Échec.';
      toast.error('Transition refusée', msg);
    }
  }

  function onForbiddenTransition(r: B2BRequest, target: B2BStage) {
    toast.error(
      'Transition non autorisée',
      `${B2B_STAGE_META[r.stage].label} → ${B2B_STAGE_META[target].label} n'est pas un mouvement valide.`,
    );
  }

  async function saveNote(note: string) {
    if (!drawerRequest) return;
    try {
      await patch.mutateAsync({ id: drawerRequest.id, body: { adminNote: note } });
    } catch (err) {
      const msg = err instanceof AdminClientError ? extractErrorMessage(err) : 'Échec.';
      toast.error("L'enregistrement de la note a échoué", msg);
    }
  }

  async function saveValue(cents: number | null) {
    if (!drawerRequest) return;
    try {
      await patch.mutateAsync({ id: drawerRequest.id, body: { estimatedValueCents: cents } });
    } catch (err) {
      const msg = err instanceof AdminClientError ? extractErrorMessage(err) : 'Échec.';
      toast.error("L'enregistrement du montant a échoué", msg);
    }
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-admin-text">Demandes B2B</h1>
          <p className="mt-0.5 text-sm text-admin-text-muted">
            Pipeline commercial des demandes entreprises. Drag&drop pour faire évoluer le stage,
            clic pour ouvrir le détail.
          </p>
        </div>
      </header>

      <B2BKpiCards stats={stats} loading={statsLoading} />

      <B2BToolbar
        search={search}
        onSearchChange={setSearch}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
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
      ) : (
        <B2BKanban
          requests={sorted}
          onOpen={(r) => setDrawerId(r.id)}
          onTransition={transitionStage}
          onForbiddenTransition={onForbiddenTransition}
        />
      )}

      <B2BDrawer
        request={drawerRequest}
        open={drawerId !== null}
        onClose={() => setDrawerId(null)}
        onTransition={async (target) => {
          if (!drawerRequest) return;
          await transitionStage(drawerRequest, target);
        }}
        onSaveNote={saveNote}
        onSaveValue={saveValue}
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
