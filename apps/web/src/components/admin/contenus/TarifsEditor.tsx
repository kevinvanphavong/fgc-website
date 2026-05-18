'use client';

import { useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import Drawer from '@/components/admin/ui/Drawer';
import ConfirmDialog from '@/components/admin/ui/ConfirmDialog';
import { TextField, TextareaField } from '@/components/admin/ui/Field';
import { useToast } from '@/components/admin/ui/Toast';
import EditorCard from './EditorCard';
import {
  tarifCards,
  extractErrorMessage,
  type TarifCard,
  type TarifPriceLine,
} from '@/lib/admin-hooks';

/**
 * TarifsEditor — édition des TarifCard + lignes de prix imbriquées.
 * Vue tableau groupée par activité (cf. mockup). Édition par drawer.
 *
 * Les TarifPriceLine sont lues via la collection TarifCard.prices
 * (sérialisée par le groupe `tarif:read`) ; pas besoin de loader séparé.
 */

export default function TarifsEditor() {
  const list = tarifCards.useList();
  const update = tarifCards.useUpdate();
  const remove = tarifCards.useRemove();
  const toast = useToast();
  const [editing, setEditing] = useState<TarifCard | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TarifCard | null>(null);

  return (
    <EditorCard
      title="Grille tarifs publique"
      subtitle="Tarifs à l'unité affichés sur la page Tarifs. Cliquer sur une carte pour éditer."
    >
      {list.isLoading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded bg-admin-bg-sunken" />
          ))}
        </div>
      ) : list.data?.length === 0 ? (
        <div className="rounded-md border border-dashed border-admin-border py-6 text-center text-[0.8125rem] text-admin-text-muted">
          Aucune carte tarif.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[0.875rem]">
            <thead>
              <tr className="border-b border-admin-border-soft text-left text-[0.75rem] uppercase tracking-wider text-admin-text-muted">
                <th className="px-2 py-2">Activité</th>
                <th className="px-2 py-2">Unité</th>
                <th className="px-2 py-2">Lignes de prix</th>
                <th className="px-2 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(list.data ?? []).map((card) => (
                <tr
                  key={card.id}
                  className="border-b border-admin-border-soft last:border-b-0"
                >
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[1.125rem]">{card.icon}</span>
                      <div>
                        <div className="font-medium text-admin-text">
                          {card.name}
                        </div>
                        <div className="text-[0.6875rem] text-admin-text-muted">
                          {card.cardGroup}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 text-admin-text-muted">{card.unit}</td>
                  <td className="px-2 py-2.5 text-admin-text-muted">
                    {card.prices?.length ?? 0} lignes
                  </td>
                  <td className="px-2 py-2.5 text-right">
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditing(card)}
                      iconLeft={<Icon icon={Edit} size={13} />}
                    >
                      Modifier
                    </AdminButton>
                    <AdminButton
                      variant="ghost"
                      size="sm"
                      onClick={() => setPendingDelete(card)}
                      iconLeft={<Icon icon={Trash2} size={13} />}
                      className="ml-1 text-admin-red"
                    >
                      Supprimer
                    </AdminButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.name ?? 'Modifier la carte tarif'}
      >
        {editing ? (
          <TarifForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update
                .mutateAsync({ id: editing.id!, body: payload })
                .then(() => {
                  toast.success('Carte mise à jour');
                  setEditing(null);
                })
                .catch((e) =>
                  toast.error('Échec de la mise à jour', extractErrorMessage(e))
                )
            }
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer cette carte ?"
        description={`La carte «${pendingDelete?.name}» et toutes ses lignes de prix seront supprimées.`}
        destructive
        confirmLabel="Supprimer"
        pending={remove.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() =>
          remove
            .mutateAsync(pendingDelete!.id!)
            .then(() => {
              toast.success('Carte supprimée');
              setPendingDelete(null);
            })
            .catch((e) => toast.error('Échec', extractErrorMessage(e)))
        }
      />
    </EditorCard>
  );
}

function TarifForm({
  initial,
  onSubmit,
  pending,
}: {
  initial: TarifCard;
  onSubmit: (payload: Partial<TarifCard>) => Promise<unknown>;
  pending: boolean;
}) {
  const [v, setV] = useState({
    cardGroup: initial.cardGroup,
    icon: initial.icon,
    name: initial.name,
    unit: initial.unit,
    note: initial.note ?? '',
    position: initial.position,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          cardGroup: v.cardGroup,
          icon: v.icon,
          name: v.name,
          unit: v.unit,
          note: v.note || null,
          position: Number(v.position) || 0,
        });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Groupe" required value={v.cardGroup} onChange={(e) => setV({ ...v, cardGroup: e.target.value })} hint="ex. activites, location" />
      <TextField label="Icône" value={v.icon} onChange={(e) => setV({ ...v, icon: e.target.value })} placeholder="🎳" />
      <TextField label="Nom" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <TextField label="Unité" required value={v.unit} onChange={(e) => setV({ ...v, unit: e.target.value })} placeholder="partie" />
      <TextareaField label="Note (texte libre)" rows={2} value={v.note} onChange={(e) => setV({ ...v, note: e.target.value })} />
      <TextField label="Position" type="number" value={String(v.position)} onChange={(e) => setV({ ...v, position: Number(e.target.value) })} />
      <p className="rounded-md bg-admin-bg-sunken px-3 py-2 text-[0.75rem] text-admin-text-muted">
        Édition des lignes de prix individuelles : à venir (sous-table dédiée).
        Pour l&apos;instant utilise le seed Doctrine pour ajuster les valeurs.
      </p>
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}
