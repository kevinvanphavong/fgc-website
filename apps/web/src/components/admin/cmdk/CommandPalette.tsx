'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Fuse from 'fuse.js';
import {
  Search,
  ArrowRight,
  Calendar,
  Briefcase,
  Users,
  Image as ImageIcon,
  Shield,
  Home,
  Layers,
  Sparkles,
} from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { cn } from '@/lib/cn';
import { ADMIN_ROUTES } from '@/lib/admin-nav';
import { apiCall, unwrapCollection } from '@/lib/admin-client';

/**
 * Command Palette ⌘K (PR8).
 *
 * 5 sections : Aller à (pages admin), Actions (V2 disabled), Réservations,
 * B2B, Clients. Recherche fuzzy via fuse.js (~5kb). Navigation ↑↓/Enter/Esc.
 *
 * Sélection résa/B2B : router push + `?open={id}` que la page cible peut
 * lire pour ouvrir son drawer (à brancher côté pages au besoin).
 */

interface CommandItem {
  id: string;
  section: 'goto' | 'action' | 'reservation' | 'b2b' | 'client';
  title: string;
  hint?: string;
  href?: string;
  onSelect?: () => void;
  disabled?: boolean;
  icon?: typeof Search;
}

const ROUTE_ICONS: Record<string, typeof Home> = {
  dashboard: Home,
  reservations: Calendar,
  b2b: Briefcase,
  clients: Users,
  contenus: Layers,
  medias: ImageIcon,
  users: Shield,
};

const GOTO_ITEMS: CommandItem[] = ADMIN_ROUTES.map((r) => ({
  id: `goto:${r.key}`,
  section: 'goto',
  title: r.label,
  hint: r.href,
  href: r.href,
  icon: ROUTE_ICONS[r.key] ?? Home,
}));

const ACTION_ITEMS: CommandItem[] = [
  { id: 'action:new-resa', section: 'action', title: 'Créer une réservation manuelle', hint: 'V2', disabled: true, icon: Sparkles },
  { id: 'action:new-b2b', section: 'action', title: 'Créer une demande B2B manuelle', hint: 'V2', disabled: true, icon: Sparkles },
  { id: 'action:import-media', section: 'action', title: 'Importer un média', href: '/admin/medias', icon: ImageIcon },
  { id: 'action:export-csv', section: 'action', title: 'Exporter les clients en CSV', hint: 'V2', disabled: true, icon: Sparkles },
];

const SECTION_LABEL: Record<CommandItem['section'], string> = {
  goto: 'Aller à',
  action: 'Actions',
  reservation: 'Réservations',
  b2b: 'Demandes B2B',
  client: 'Clients',
};

interface Props {
  open: boolean;
  onClose: () => void;
}

interface ResaLite {
  id: number;
  reference: string;
  parentLastName: string;
  parentFirstName: string;
  childName: string;
  eventDate: string;
}
interface B2BLite {
  id: number;
  reference: string;
  companyName: string;
  contactLastName: string;
}
interface ClientLite {
  email: string;
  displayName: string;
}

export default function CommandPalette({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [resas, setResas] = useState<ResaLite[]>([]);
  const [b2bs, setB2bs] = useState<B2BLite[]>([]);
  const [clients, setClients] = useState<ClientLite[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Charge les listes au premier open uniquement (pas de polling).
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const [resaPayload, b2bPayload, clientsPayload] = await Promise.all([
          apiCall<unknown>('/admin/demandes-reservation?itemsPerPage=30').catch(() => null),
          apiCall<unknown>('/admin/b2b-requests?itemsPerPage=30').catch(() => null),
          apiCall<{ items: ClientLite[] }>('/admin/clients?page=1').catch(() => null),
        ]);
        if (cancelled) return;
        setResas(resaPayload ? unwrapCollection<ResaLite>(resaPayload).slice(0, 30) : []);
        setB2bs(b2bPayload ? unwrapCollection<B2BLite>(b2bPayload).slice(0, 30) : []);
        setClients(clientsPayload?.items?.slice(0, 30) ?? []);
      } catch {
        /* silencieux — la palette reste utilisable avec juste goto/actions */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Autofocus + reset query à chaque ouverture.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  // Esc ferme.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const allItems = useMemo<CommandItem[]>(() => {
    const resaItems: CommandItem[] = resas.map((r) => ({
      id: `resa:${r.id}`,
      section: 'reservation',
      title: `${r.reference} · ${r.parentFirstName} ${r.parentLastName}`,
      hint: `${r.childName} · ${r.eventDate.slice(0, 10)}`,
      href: `/admin/reservations?open=${r.id}`,
      icon: Calendar,
    }));
    const b2bItems: CommandItem[] = b2bs.map((b) => ({
      id: `b2b:${b.id}`,
      section: 'b2b',
      title: `${b.reference} · ${b.companyName}`,
      hint: b.contactLastName,
      href: `/admin/b2b?open=${b.id}`,
      icon: Briefcase,
    }));
    const clientItems: CommandItem[] = clients.map((c) => ({
      id: `client:${c.email}`,
      section: 'client',
      title: c.displayName || c.email,
      hint: c.email,
      href: `/admin/clients?open=${encodeURIComponent(c.email)}`,
      icon: Users,
    }));
    return [...GOTO_ITEMS, ...ACTION_ITEMS, ...resaItems, ...b2bItems, ...clientItems];
  }, [resas, b2bs, clients]);

  const fuse = useMemo(
    () =>
      new Fuse(allItems, {
        keys: ['title', 'hint'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [allItems],
  );

  const results = useMemo<CommandItem[]>(() => {
    if (query.trim() === '') return allItems.slice(0, 50);
    return fuse.search(query).map((r) => r.item).slice(0, 50);
  }, [query, fuse, allItems]);

  const grouped = useMemo(() => {
    const out: Record<CommandItem['section'], CommandItem[]> = {
      goto: [],
      action: [],
      reservation: [],
      b2b: [],
      client: [],
    };
    for (const item of results) out[item.section].push(item);
    return out;
  }, [results]);

  // Réindex actif si le query change.
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  function activate(item: CommandItem) {
    if (item.disabled) return;
    onClose();
    if (item.onSelect) item.onSelect();
    if (item.href) router.push(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = results[activeIndex];
      if (item) activate(item);
    }
  }

  if (!open) return null;

  const sectionOrder: CommandItem['section'][] = ['goto', 'action', 'reservation', 'b2b', 'client'];
  let flatIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[15vh]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Palette de commandes"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-admin-border bg-admin-bg-elev shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-admin-border px-4 py-3">
          <Icon icon={Search} size={18} className="text-admin-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher une page, une demande, un client…"
            className="flex-1 bg-transparent text-sm text-admin-text placeholder:text-admin-text-muted focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="rounded border border-admin-border bg-admin-bg-sunken px-1.5 py-0.5 text-[0.65rem] font-mono text-admin-text-muted">
            Esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[60vh] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-admin-text-muted">
              Aucun résultat pour <strong>"{query}"</strong>.
            </div>
          ) : (
            sectionOrder.map((sectionKey) => {
              const sectionItems = grouped[sectionKey];
              if (sectionItems.length === 0) return null;
              return (
                <div key={sectionKey} className="px-2 py-1">
                  <div className="px-2 pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-admin-text-muted">
                    {SECTION_LABEL[sectionKey]}
                  </div>
                  {sectionItems.map((item) => {
                    const isActive = flatIndex === activeIndex;
                    const currentFlatIndex = flatIndex;
                    flatIndex++;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => activate(item)}
                        onMouseEnter={() => setActiveIndex(currentFlatIndex)}
                        disabled={item.disabled}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-md px-2.5 py-1.5 text-left text-sm transition',
                          isActive
                            ? 'bg-admin-brand-soft text-admin-brand'
                            : 'text-admin-text hover:bg-admin-bg-sunken',
                          item.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
                        )}
                      >
                        {item.icon && <Icon icon={item.icon} size={14} className="shrink-0" />}
                        <span className="flex-1 truncate">
                          {item.title}
                          {item.hint && (
                            <span className="ml-2 text-[0.7rem] text-admin-text-muted">
                              {item.hint}
                            </span>
                          )}
                        </span>
                        {isActive && <Icon icon={ArrowRight} size={14} className="text-admin-brand" />}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-admin-border px-4 py-2 text-[0.7rem] text-admin-text-muted">
          <span>
            <kbd className="rounded border border-admin-border bg-admin-bg-sunken px-1">↑</kbd>{' '}
            <kbd className="rounded border border-admin-border bg-admin-bg-sunken px-1">↓</kbd> naviguer
          </span>
          <span>
            <kbd className="rounded border border-admin-border bg-admin-bg-sunken px-1">↵</kbd> ouvrir
          </span>
          <span>{results.length} résultats</span>
        </div>
      </div>
    </div>
  );
}
