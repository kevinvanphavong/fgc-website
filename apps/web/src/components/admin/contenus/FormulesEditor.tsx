'use client';

import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import Drawer from '@/components/admin/ui/Drawer';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import { TextField, TextareaField } from '@/components/admin/ui/Field';
import Switch from '@/components/admin/ui/Switch';
import { useToast } from '@/components/admin/ui/Toast';
import EditorCard from './EditorCard';
import {
  hebdoCards,
  passCards,
  resaCards,
  annivCards,
  vipFeatures,
  extractErrorMessage,
  type HebdoCard,
  type PassCard,
  type ResaCard,
  type AnnivCard,
  type VipFeature,
} from '@/lib/admin-hooks';

/**
 * FormulesEditor — 5 groupes :
 *  1. Hebdo (HebdoCard)
 *  2. Pass multi-activités (PassCard)
 *  3. Réservations groupe (ResaCard)
 *  4. Anniversaires (AnnivCard)
 *  5. Avantages VIP (VipFeature)
 *
 * Chaque groupe rend une grille de cards éditables avec drawer
 * d'édition. Patron commun extrait dans <GroupSection>.
 */

export default function FormulesEditor() {
  return (
    <div className="flex flex-col gap-4">
      <HebdoGroup />
      <PassGroup />
      <ResaGroup />
      <AnnivGroup />
      <VipGroup />
    </div>
  );
}

// ===================== HEBDO =====================

function HebdoGroup() {
  const list = hebdoCards.useList();
  const create = hebdoCards.useCreate();
  const update = hebdoCards.useUpdate();
  const remove = hebdoCards.useRemove();
  const toast = useToast();
  const [editing, setEditing] = useState<HebdoCard | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<HebdoCard | null>(null);

  const empty: HebdoCard = {
    key: '',
    tag: '',
    title: '',
    description: '',
    bullets: [],
    price: '',
    days: '',
    featured: false,
    savings: '',
    position: (list.data?.length ?? 0) + 1,
  };

  return (
    <EditorCard
      title="Soirées hebdomadaires"
      subtitle="Sans réservation · prix à l'unité"
      addLabel="Ajouter une formule"
      onAdd={() => setCreating(true)}
    >
      <CardGrid
        loading={list.isLoading}
        empty={list.data?.length === 0}
        items={(list.data ?? []).map((f) => (
          <FormuleItemCard
            key={f.id}
            primary={f.title}
            secondary={f.tag}
            price={f.price}
            badge={f.featured ? 'Best-seller' : undefined}
            onEdit={() => setEditing(f)}
            onDelete={() => setPendingDelete(f)}
          />
        ))}
      />

      <Drawer
        open={editing !== null || creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={creating ? 'Nouvelle formule hebdo' : editing?.title ?? 'Modifier'}
        description="Affichée sur la page Tarifs & Formules"
      >
        {creating ? (
          <HebdoForm
            initial={empty}
            pending={create.isPending}
            onSubmit={(payload) =>
              create
                .mutateAsync(payload)
                .then(() => {
                  toast.success('Formule créée');
                  setCreating(false);
                })
                .catch((e) => toast.error('Échec de la création', extractErrorMessage(e)))
            }
          />
        ) : editing ? (
          <HebdoForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update
                .mutateAsync({ id: editing.id!, body: payload })
                .then(() => {
                  toast.success('Formule mise à jour');
                  setEditing(null);
                })
                .catch((e) => toast.error('Échec de la mise à jour', extractErrorMessage(e)))
            }
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer la formule ?"
        description={`«${pendingDelete?.title}» disparaîtra immédiatement du site public.`}
        destructive
        confirmLabel="Supprimer"
        pending={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() =>
          remove
            .mutateAsync(pendingDelete!.id!)
            .then(() => {
              toast.success('Formule supprimée');
              setPendingDelete(null);
            })
            .catch((e) => toast.error('Échec de la suppression', extractErrorMessage(e)))
        }
      />
    </EditorCard>
  );
}

function HebdoForm({
  initial,
  onSubmit,
  pending,
}: {
  initial: HebdoCard;
  onSubmit: (payload: Partial<HebdoCard>) => Promise<unknown>;
  pending: boolean;
}) {
  const [v, setV] = useState({
    key: initial.key,
    tag: initial.tag,
    title: initial.title,
    description: initial.description ?? '',
    bullets: (initial.bullets ?? []).join('\n'),
    price: initial.price,
    days: initial.days,
    featured: initial.featured,
    savings: initial.savings ?? '',
    position: initial.position,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          key: v.key,
          tag: v.tag,
          title: v.title,
          description: v.description || null,
          bullets: v.bullets.split('\n').map((s) => s.trim()).filter(Boolean),
          price: v.price,
          days: v.days,
          featured: v.featured,
          savings: v.savings || null,
          position: Number(v.position) || 0,
        });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Clé technique" required value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} placeholder="ex. lundi-illimite" />
      <TextField label="Tag" required value={v.tag} onChange={(e) => setV({ ...v, tag: e.target.value })} placeholder="Lundi & mardi soir" />
      <TextField label="Titre" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      <TextareaField label="Description" rows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      <TextareaField label="Bullets (une ligne par bullet)" rows={3} value={v.bullets} onChange={(e) => setV({ ...v, bullets: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Prix (texte)" required value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} placeholder="20€" />
        <TextField label="Jours" value={v.days} onChange={(e) => setV({ ...v, days: e.target.value })} placeholder="lun, mar" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Économies (texte)" value={v.savings} onChange={(e) => setV({ ...v, savings: e.target.value })} placeholder="-21%" />
        <TextField label="Position" type="number" value={String(v.position)} onChange={(e) => setV({ ...v, position: Number(e.target.value) })} />
      </div>
      <label className="flex items-center gap-2">
        <Switch checked={v.featured} onChange={(b) => setV({ ...v, featured: b })} label="Mise en avant" />
        <span className="text-[0.8125rem] text-admin-text">Mise en avant (best-seller)</span>
      </label>
      <div className="flex items-center justify-end gap-2 pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}

// ===================== PASS =====================

function PassGroup() {
  const list = passCards.useList();
  const update = passCards.useUpdate();
  const toast = useToast();
  const [editing, setEditing] = useState<PassCard | null>(null);

  return (
    <EditorCard title="Pass multi-activités" subtitle="4 packs combinés · dimanche → jeudi">
      <CardGrid
        loading={list.isLoading}
        empty={list.data?.length === 0}
        items={(list.data ?? []).map((f) => (
          <FormuleItemCard
            key={f.id}
            primary={f.name}
            secondary={f.separatePrice ? `Séparé : ${f.separatePrice}` : undefined}
            price={f.price}
            badge={f.featured ? 'Best-seller' : undefined}
            onEdit={() => setEditing(f)}
          />
        ))}
      />
      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing?.name ?? 'Modifier'}>
        {editing ? (
          <PassForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update
                .mutateAsync({ id: editing.id!, body: payload })
                .then(() => {
                  toast.success('Pass mis à jour');
                  setEditing(null);
                })
                .catch((e) => toast.error('Échec', extractErrorMessage(e)))
            }
          />
        ) : null}
      </Drawer>
    </EditorCard>
  );
}

function PassForm({
  initial,
  onSubmit,
  pending,
}: {
  initial: PassCard;
  onSubmit: (payload: Partial<PassCard>) => Promise<unknown>;
  pending: boolean;
}) {
  const [v, setV] = useState({
    key: initial.key,
    name: initial.name,
    price: initial.price,
    features: (initial.features ?? []).join('\n'),
    separatePrice: initial.separatePrice,
    savings: initial.savings,
    featured: initial.featured,
    position: initial.position,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...v,
          features: v.features.split('\n').map((s) => s.trim()).filter(Boolean),
          position: Number(v.position) || 0,
        });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Clé" required value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} />
      <TextField label="Nom" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <TextField label="Prix" required value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} />
      <TextareaField label="Features (une par ligne)" rows={4} value={v.features} onChange={(e) => setV({ ...v, features: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Prix séparé" value={v.separatePrice} onChange={(e) => setV({ ...v, separatePrice: e.target.value })} />
        <TextField label="Économies" value={v.savings} onChange={(e) => setV({ ...v, savings: e.target.value })} />
      </div>
      <label className="flex items-center gap-2">
        <Switch checked={v.featured} onChange={(b) => setV({ ...v, featured: b })} />
        <span className="text-[0.8125rem]">Mise en avant</span>
      </label>
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}

// ===================== RESA =====================

function ResaGroup() {
  const list = resaCards.useList();
  const update = resaCards.useUpdate();
  const toast = useToast();
  const [editing, setEditing] = useState<ResaCard | null>(null);

  return (
    <EditorCard title="Réservations groupe" subtitle="Pistes garanties · cocktail inclus">
      <CardGrid
        loading={list.isLoading}
        empty={list.data?.length === 0}
        items={(list.data ?? []).map((f) => (
          <FormuleItemCard
            key={f.id}
            primary={f.rank.toUpperCase()}
            secondary={f.audience}
            price={f.price}
            badge={f.featured ? 'Best-seller' : undefined}
            onEdit={() => setEditing(f)}
          />
        ))}
      />
      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing?.rank ?? 'Modifier'}>
        {editing ? (
          <ResaForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update.mutateAsync({ id: editing.id!, body: payload }).then(() => {
                toast.success('Formule mise à jour');
                setEditing(null);
              }).catch((e) => toast.error('Échec', extractErrorMessage(e)))
            }
          />
        ) : null}
      </Drawer>
    </EditorCard>
  );
}

function ResaForm({ initial, onSubmit, pending }: { initial: ResaCard; onSubmit: (p: Partial<ResaCard>) => Promise<unknown>; pending: boolean }) {
  const [v, setV] = useState({ ...initial, features: (initial.features ?? []).join('\n') });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...v,
          features: v.features.split('\n').map((s) => s.trim()).filter(Boolean),
          position: Number(v.position) || 0,
        });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Clé" required value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} />
      <TextField label="Rang (silver/gold/platinium)" required value={v.rank} onChange={(e) => setV({ ...v, rank: e.target.value })} />
      <TextField label="Audience" required value={v.audience} onChange={(e) => setV({ ...v, audience: e.target.value })} />
      <TextField label="Prix" required value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} />
      <TextareaField label="Pitch" rows={2} value={v.pitch} onChange={(e) => setV({ ...v, pitch: e.target.value })} />
      <TextareaField label="Features (une par ligne)" rows={4} value={v.features} onChange={(e) => setV({ ...v, features: e.target.value })} />
      <TextareaField label="Argument clé" rows={2} value={v.keyPoint} onChange={(e) => setV({ ...v, keyPoint: e.target.value })} />
      <label className="flex items-center gap-2">
        <Switch checked={v.featured} onChange={(b) => setV({ ...v, featured: b })} />
        <span className="text-[0.8125rem]">Mise en avant</span>
      </label>
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}

// ===================== ANNIV =====================

function AnnivGroup() {
  const list = annivCards.useList();
  const update = annivCards.useUpdate();
  const toast = useToast();
  const [editing, setEditing] = useState<AnnivCard | null>(null);

  return (
    <EditorCard title="Anniversaires enfants" subtitle="Service VIP inclus dans les 3 formules">
      <CardGrid
        loading={list.isLoading}
        empty={list.data?.length === 0}
        items={(list.data ?? []).map((f) => (
          <FormuleItemCard
            key={f.id}
            primary={`${f.icon} ${f.name}`}
            secondary={f.age}
            price={f.price}
            badge={f.featured ? 'Best-seller' : undefined}
            onEdit={() => setEditing(f)}
          />
        ))}
      />
      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing?.name ?? 'Modifier'}>
        {editing ? (
          <AnnivForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update.mutateAsync({ id: editing.id!, body: payload }).then(() => {
                toast.success('Formule mise à jour');
                setEditing(null);
              }).catch((e) => toast.error('Échec', extractErrorMessage(e)))
            }
          />
        ) : null}
      </Drawer>
    </EditorCard>
  );
}

function AnnivForm({ initial, onSubmit, pending }: { initial: AnnivCard; onSubmit: (p: Partial<AnnivCard>) => Promise<unknown>; pending: boolean }) {
  const [v, setV] = useState({ ...initial, features: (initial.features ?? []).join('\n') });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...v,
          features: v.features.split('\n').map((s) => s.trim()).filter(Boolean),
          position: Number(v.position) || 0,
        });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Clé" required value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} />
      <TextField label="Icône (emoji)" value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value })} placeholder="🎂" />
      <TextField label="Nom" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <TextField label="Tranche d'âge" value={v.age} onChange={(e) => setV({ ...v, age: e.target.value })} placeholder="6-8 ans" />
      <TextField label="Prix" required value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} />
      <TextareaField label="Features (une par ligne)" rows={4} value={v.features} onChange={(e) => setV({ ...v, features: e.target.value })} />
      <label className="flex items-center gap-2">
        <Switch checked={v.featured} onChange={(b) => setV({ ...v, featured: b })} />
        <span className="text-[0.8125rem]">Mise en avant</span>
      </label>
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}

// ===================== VIP =====================

function VipGroup() {
  const list = vipFeatures.useList();
  const update = vipFeatures.useUpdate();
  const toast = useToast();
  const [editing, setEditing] = useState<VipFeature | null>(null);

  return (
    <EditorCard title="Avantages VIP" subtitle="Liste affichée dans le bloc anniversaire VIP">
      <ul className="flex flex-col divide-y divide-admin-border-soft">
        {list.isLoading ? (
          <li className="py-4 text-center text-[0.8125rem] text-admin-text-muted">Chargement…</li>
        ) : list.data?.length === 0 ? (
          <li className="py-4 text-center text-[0.8125rem] text-admin-text-muted">Aucun avantage VIP.</li>
        ) : (
          (list.data ?? []).map((f) => (
            <li key={f.id} className="flex items-center gap-3 py-2.5">
              <span className="text-[1.125rem]">{f.icon}</span>
              <span className="flex-1 text-[0.875rem] text-admin-text">{f.label}</span>
              <AdminButton variant="ghost" size="sm" onClick={() => setEditing(f)} iconLeft={<Icon icon={Edit} size={13} />}>
                Modifier
              </AdminButton>
            </li>
          ))
        )}
      </ul>
      <Drawer open={editing !== null} onClose={() => setEditing(null)} title={editing?.label ?? 'Modifier'}>
        {editing ? (
          <VipForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update.mutateAsync({ id: editing.id!, body: payload }).then(() => {
                toast.success('Avantage VIP mis à jour');
                setEditing(null);
              }).catch((e) => toast.error('Échec', extractErrorMessage(e)))
            }
          />
        ) : null}
      </Drawer>
    </EditorCard>
  );
}

function VipForm({ initial, onSubmit, pending }: { initial: VipFeature; onSubmit: (p: Partial<VipFeature>) => Promise<unknown>; pending: boolean }) {
  const [v, setV] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...v, position: Number(v.position) || 0 });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Icône (emoji)" value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value })} />
      <TextField label="Label" required value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} />
      <TextField label="Position" type="number" value={String(v.position)} onChange={(e) => setV({ ...v, position: Number(e.target.value) })} />
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}

// ===================== Sub-components =====================

function CardGrid({
  loading,
  empty,
  items,
}: {
  loading: boolean;
  empty: boolean;
  items: React.ReactNode[];
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg border border-admin-border bg-admin-bg-sunken" />
        ))}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="rounded-md border border-dashed border-admin-border py-6 text-center text-[0.8125rem] text-admin-text-muted">
        Aucun élément à afficher.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{items}</div>
  );
}

function FormuleItemCard({
  primary,
  secondary,
  price,
  badge,
  onEdit,
  onDelete,
}: {
  primary: string;
  secondary?: string;
  price: string;
  badge?: string;
  onEdit: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="relative rounded-lg border border-admin-border bg-admin-bg-elev p-4">
      {badge ? (
        <span className="absolute -top-2 left-3 inline-flex items-center rounded-full bg-admin-gold/10 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-admin-gold">
          ★ {badge}
        </span>
      ) : null}
      <div className="mt-1 text-[0.9375rem] font-semibold text-admin-text">
        {primary}
      </div>
      {secondary ? (
        <div className="mt-0.5 text-[0.75rem] text-admin-text-muted">{secondary}</div>
      ) : null}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-[1.25rem] font-semibold text-admin-text tabular-nums">
          {price}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-dashed border-admin-border-soft pt-3">
        <AdminButton variant="ghost" size="sm" onClick={onEdit} iconLeft={<Icon icon={Edit} size={13} />}>
          Modifier
        </AdminButton>
        {onDelete ? (
          <AdminButton variant="ghost" size="sm" onClick={onDelete} className="ml-auto text-admin-red hover:bg-admin-red-soft" iconLeft={<Icon icon={Trash2} size={13} />}>
            Supprimer
          </AdminButton>
        ) : null}
      </div>
    </div>
  );
}
