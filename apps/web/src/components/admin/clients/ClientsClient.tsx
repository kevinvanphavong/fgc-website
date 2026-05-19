'use client';

import { useMemo, useState } from 'react';
import { Users, Star, Crown, UserPlus, type LucideIcon } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import Drawer from '@/components/admin/ui/Drawer';
import { cn } from '@/lib/cn';
import {
  useClientsList,
  useClientsStats,
  useClientDetail,
  type ClientAggregate,
  type ClientTag,
} from '@/lib/admin-hooks/useClients';

const TAG_OPTIONS: { value: ClientTag | 'all'; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 'fidele', label: 'Fidèles' },
  { value: 'vip', label: 'VIP' },
  { value: 'b2b', label: 'B2B' },
];

const TAG_META: Record<ClientTag, { label: string; bg: string; text: string }> = {
  fidele: { label: 'Fidèle', bg: 'bg-admin-amber-soft', text: 'text-admin-amber' },
  vip: { label: 'VIP', bg: 'bg-admin-pink-soft', text: 'text-admin-pink' },
  b2b: { label: 'B2B', bg: 'bg-admin-blue-soft', text: 'text-admin-blue' },
};

export default function ClientsClient() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<ClientTag | 'all'>('all');
  const [drawerEmail, setDrawerEmail] = useState<string | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      tag: tag === 'all' ? undefined : tag,
    }),
    [search, tag],
  );

  const { data, isLoading, isError } = useClientsList(filters);
  const { data: stats } = useClientsStats();

  const items = data?.items ?? [];

  return (
    <div className="flex flex-col gap-5 p-6">
      <header>
        <h1 className="text-xl font-semibold text-admin-text">Clients</h1>
        <p className="mt-0.5 text-sm text-admin-text-muted">
          Agrégat des contacts (anniv + B2B) avec tags calculés.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="Total clients" value={stats?.total} icon={Users} accent="brand" />
        <KpiTile label="Fidèles" value={stats?.fideles} icon={Star} accent="amber" hint=">= 5 résa" />
        <KpiTile label="VIP" value={stats?.vip} icon={Crown} accent="pink" hint=">= 3 anniv" />
        <KpiTile label="Nouveaux (30j)" value={stats?.newRecent} icon={UserPlus} accent="green" />
      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-b border-admin-border-soft pb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Email, nom, téléphone…"
          data-admin-search
          aria-label="Rechercher un client"
          className="w-64 rounded-md border border-admin-border bg-admin-bg-elev py-2 pl-3 pr-3 text-sm text-admin-text placeholder:text-admin-text-muted focus:border-admin-brand focus:outline-none focus:ring-2 focus:ring-admin-brand-ring max-md:w-full"
        />
        <div className="flex items-center gap-1 rounded-md border border-admin-border bg-admin-bg-elev p-0.5">
          {TAG_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setTag(t.value)}
              className={cn(
                'rounded px-2.5 py-1 text-xs font-medium transition',
                tag === t.value
                  ? 'bg-admin-brand-soft text-admin-brand'
                  : 'text-admin-text-muted hover:bg-admin-bg-sunken',
              )}
              aria-pressed={tag === t.value}
            >
              {t.label}
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
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-12 text-center text-sm text-admin-text-muted">
          Aucun client correspondant.
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-admin-border bg-admin-bg-elev">
          <table className="min-w-full divide-y divide-admin-border-soft text-sm">
            <thead className="bg-admin-bg-sunken/50 text-admin-text-muted">
              <tr>
                <Th>Client</Th>
                <Th>Email</Th>
                <Th>Téléphone</Th>
                <Th>Résa</Th>
                <Th>Tags</Th>
                <Th>Dernière interaction</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border-soft">
              {items.map((c) => (
                <Row key={c.email} c={c} onClick={() => setDrawerEmail(c.email)} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ClientDrawer
        email={drawerEmail}
        open={drawerEmail !== null}
        onClose={() => setDrawerEmail(null)}
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

function Row({ c, onClick }: { c: ClientAggregate; onClick: () => void }) {
  const lastSeen = new Date(c.lastSeenAt);
  return (
    <tr className="cursor-pointer hover:bg-admin-bg-sunken/40" onClick={onClick}>
      <td className="px-3 py-2 font-medium text-admin-text">{c.displayName || '—'}</td>
      <td className="px-3 py-2 text-admin-text-muted">{c.email}</td>
      <td className="px-3 py-2 text-admin-text-muted">{c.phone ?? '—'}</td>
      <td className="px-3 py-2 text-admin-text-muted">
        <span title={`Anniv: ${c.totalAnniv} · B2B: ${c.totalB2B}`}>{c.totalReservations}</span>
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-wrap gap-1">
          {c.tags.map((t) => {
            const m = TAG_META[t];
            return (
              <span
                key={t}
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.7rem] font-medium ${m.bg} ${m.text}`}
              >
                {m.label}
              </span>
            );
          })}
          {c.tags.length === 0 && <span className="text-[0.7rem] text-admin-text-muted">—</span>}
        </div>
      </td>
      <td className="px-3 py-2 text-admin-text-muted">
        {lastSeen.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
      </td>
    </tr>
  );
}

function KpiTile({
  label,
  value,
  icon,
  accent,
  hint,
}: {
  label: string;
  value: number | undefined;
  icon: LucideIcon;
  accent: 'brand' | 'green' | 'amber' | 'pink';
  hint?: string;
}) {
  const map = {
    brand: { bg: 'bg-admin-brand-soft', text: 'text-admin-brand' },
    green: { bg: 'bg-admin-green-soft', text: 'text-admin-green' },
    amber: { bg: 'bg-admin-amber-soft', text: 'text-admin-amber' },
    pink: { bg: 'bg-admin-pink-soft', text: 'text-admin-pink' },
  }[accent];
  return (
    <div className="rounded-lg border border-admin-border bg-admin-bg-elev p-4">
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium text-admin-text-muted">{label}</span>
        <span className={`grid h-8 w-8 place-items-center rounded-md ${map.bg} ${map.text}`}>
          <Icon icon={icon as never} size={16} />
        </span>
      </div>
      <div className="mt-2 text-xl font-semibold text-admin-text">
        {value !== undefined ? value : '—'}
      </div>
      {hint && <p className="mt-1 text-[0.7rem] text-admin-text-muted">{hint}</p>}
    </div>
  );
}

function ClientDrawer({
  email,
  open,
  onClose,
}: {
  email: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data: detail, isLoading } = useClientDetail(email);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={detail?.displayName || email || 'Client'}
      description={email ?? undefined}
      width={560}
    >
      {isLoading ? (
        <div className="text-sm text-admin-text-muted">Chargement…</div>
      ) : !detail ? (
        <div className="text-sm text-admin-text-muted">Aucune donnée.</div>
      ) : (
        <div className="flex flex-col gap-5">
          <section className="grid grid-cols-2 gap-y-2 text-sm">
            <div>
              <dt className="text-[0.7rem] uppercase tracking-wider text-admin-text-muted">Téléphone</dt>
              <dd className="mt-0.5 text-admin-text">{detail.phone ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-wider text-admin-text-muted">Première visite</dt>
              <dd className="mt-0.5 text-admin-text">
                {new Date(detail.firstSeenAt).toLocaleDateString('fr-FR')}
              </dd>
            </div>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-wider text-admin-text-muted">Résa anniv</dt>
              <dd className="mt-0.5 text-admin-text">{detail.totalAnniv}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] uppercase tracking-wider text-admin-text-muted">Demandes B2B</dt>
              <dd className="mt-0.5 text-admin-text">{detail.totalB2B}</dd>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-admin-text-muted">
              Historique
            </h3>
            <ol className="space-y-2 text-sm">
              {detail.history.map((h) => (
                <li
                  key={`${h.kind}-${h.id}`}
                  className="rounded-md border border-admin-border-soft bg-admin-bg-sunken/40 p-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-admin-text">
                      {h.kind === 'anniv' ? '🎉' : '💼'} {h.reference}
                    </span>
                    <span className="text-[0.7rem] text-admin-text-muted">
                      {new Date(h.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-admin-text-muted">{h.summary}</p>
                  <div className="mt-1 flex items-center gap-2 text-[0.7rem] text-admin-text-muted">
                    <span>Statut : {h.status}</span>
                    {h.value !== null && (
                      <span>
                        ·{' '}
                        {new Intl.NumberFormat('fr-FR', {
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0,
                        }).format(h.value / 100)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </Drawer>
  );
}
