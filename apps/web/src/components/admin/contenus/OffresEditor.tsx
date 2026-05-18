'use client';

import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import Drawer from '@/components/admin/ui/Drawer';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import { TextField } from '@/components/admin/ui/Field';
import Switch from '@/components/admin/ui/Switch';
import { useToast } from '@/components/admin/ui/Toast';
import EditorCard from './EditorCard';
import { offers, extractErrorMessage, type Offer } from '@/lib/admin-hooks';

export default function OffresEditor() {
  const list = offers.useList();
  const create = offers.useCreate();
  const update = offers.useUpdate();
  const remove = offers.useRemove();
  const toast = useToast();
  const [editing, setEditing] = useState<Offer | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Offer | null>(null);

  const empty: Offer = {
    key: '',
    image: '',
    title: '',
    badge: '',
    badgeVariant: 'yellow',
    href: '',
    active: true,
    position: (list.data?.length ?? 0) + 1,
  };

  const toggleActive = (offer: Offer) => {
    return update
      .mutateAsync({ id: offer.id!, body: { ...offer, active: !offer.active } })
      .then(() => {
        toast.success(offer.active ? 'Offre masquée' : 'Offre activée');
      })
      .catch((e) => toast.error('Échec', extractErrorMessage(e)));
  };

  return (
    <EditorCard
      title="Offres home"
      subtitle="Cards mises en avant sur la page d'accueil. Désactive une offre pour la masquer sans la supprimer."
      addLabel="Ajouter une offre"
      onAdd={() => setCreating(true)}
    >
      {list.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-lg bg-admin-bg-sunken" />
          ))}
        </div>
      ) : list.data?.length === 0 ? (
        <div className="rounded-md border border-dashed border-admin-border py-6 text-center text-[0.8125rem] text-admin-text-muted">
          Aucune offre.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(list.data ?? []).map((offer) => (
            <div
              key={offer.id}
              className={`rounded-lg border bg-admin-bg-elev p-4 ${
                offer.active ? 'border-admin-border' : 'border-admin-border opacity-60'
              }`}
            >
              <div className="text-[0.9375rem] font-semibold text-admin-text">
                {offer.title}
              </div>
              <div className="mt-0.5 text-[0.75rem] text-admin-text-muted">
                {offer.badge} · {offer.href}
              </div>
              <div className="mt-3 flex items-center gap-2 border-t border-dashed border-admin-border-soft pt-3">
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(offer)}
                  iconLeft={<Icon icon={Edit} size={13} />}
                >
                  Modifier
                </AdminButton>
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setPendingDelete(offer)}
                  iconLeft={<Icon icon={Trash2} size={13} />}
                  className="text-admin-red"
                >
                  Suppr.
                </AdminButton>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-[0.75rem] text-admin-text-muted">
                    {offer.active ? 'Visible' : 'Masquée'}
                  </span>
                  <Switch
                    checked={offer.active}
                    onChange={() => toggleActive(offer)}
                    label="Visible sur la home"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={editing !== null || creating}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        title={creating ? 'Nouvelle offre' : editing?.title ?? 'Modifier'}
      >
        {creating ? (
          <OfferForm
            initial={empty}
            pending={create.isPending}
            onSubmit={(payload) =>
              create
                .mutateAsync(payload)
                .then(() => {
                  toast.success('Offre créée');
                  setCreating(false);
                })
                .catch((e) => toast.error('Échec', extractErrorMessage(e)))
            }
          />
        ) : editing ? (
          <OfferForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update
                .mutateAsync({ id: editing.id!, body: payload })
                .then(() => {
                  toast.success('Offre mise à jour');
                  setEditing(null);
                })
                .catch((e) => toast.error('Échec', extractErrorMessage(e)))
            }
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer cette offre ?"
        description={`«${pendingDelete?.title}» disparaîtra de la home.`}
        destructive
        confirmLabel="Supprimer"
        pending={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() =>
          remove
            .mutateAsync(pendingDelete!.id!)
            .then(() => {
              toast.success('Offre supprimée');
              setPendingDelete(null);
            })
            .catch((e) => toast.error('Échec', extractErrorMessage(e)))
        }
      />
    </EditorCard>
  );
}

function OfferForm({
  initial,
  onSubmit,
  pending,
}: {
  initial: Offer;
  onSubmit: (p: Partial<Offer>) => Promise<unknown>;
  pending: boolean;
}) {
  const [v, setV] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...v, position: Number(v.position) || 0 });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Clé technique" required value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} />
      <TextField label="Titre" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
      <TextField label="Image (URL ou chemin)" required value={v.image} onChange={(e) => setV({ ...v, image: e.target.value })} placeholder="/assets/offers/foo.png" />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Badge" value={v.badge} onChange={(e) => setV({ ...v, badge: e.target.value })} placeholder="Nouveau" />
        <TextField label="Variant badge" value={v.badgeVariant} onChange={(e) => setV({ ...v, badgeVariant: e.target.value })} hint="yellow, pink, blue…" />
      </div>
      <TextField label="Lien cible (href)" required value={v.href} onChange={(e) => setV({ ...v, href: e.target.value })} placeholder="/bowling" />
      <TextField label="Position" type="number" value={String(v.position)} onChange={(e) => setV({ ...v, position: Number(e.target.value) })} />
      <label className="flex items-center gap-2">
        <Switch checked={v.active} onChange={(b) => setV({ ...v, active: b })} />
        <span className="text-[0.8125rem]">Visible sur la home</span>
      </label>
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}
