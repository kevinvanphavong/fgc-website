'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import Drawer from '@/components/admin/ui/Drawer';
import { TextField } from '@/components/admin/ui/Field';
import { useToast } from '@/components/admin/ui/Toast';
import EditorCard from './EditorCard';
import {
  daySchedules,
  extractErrorMessage,
  type DaySchedule,
} from '@/lib/admin-hooks';

/**
 * HorairesEditor — édition des horaires hebdomadaires.
 * Section "Exceptions" : non implémentée en V1 (pas d'entité dédiée).
 * TODO V2 : créer une entité `ScheduleException`.
 */

export default function HorairesEditor() {
  const list = daySchedules.useList();
  const update = daySchedules.useUpdate();
  const toast = useToast();
  const [editing, setEditing] = useState<DaySchedule | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <EditorCard
        title="Horaires hebdomadaires"
        subtitle="Diffusés en pied de page sur familygamescenter.fr."
      >
        {list.isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-admin-bg-sunken" />
            ))}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {(list.data ?? []).map((d) => (
              <li
                key={d.id}
                className="flex items-center gap-3 rounded-md bg-admin-bg-sunken px-3 py-2.5"
              >
                <span className="w-24 font-medium text-admin-text">{d.label}</span>
                <span className="flex-1 text-[0.875rem] text-admin-text">
                  {d.hours}
                </span>
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(d)}
                  iconLeft={<Icon icon={Edit} size={13} />}
                >
                  Modifier
                </AdminButton>
              </li>
            ))}
          </ul>
        )}
      </EditorCard>

      <EditorCard title="Exceptions" subtitle="Fériés, fermetures, maintenances">
        <div className="rounded-md border border-dashed border-admin-border py-4 px-4 text-[0.8125rem] text-admin-text-muted">
          Gestion des exceptions différée en V2 : entité dédiée à modéliser
          (jour ponctuel + override horaires/fermeture). Pour l&apos;instant la
          colonne <code>hours</code> du jour concerné peut être éditée à la
          main pour absorber une exception ponctuelle.
        </div>
      </EditorCard>

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing?.label ?? 'Modifier'}
      >
        {editing ? (
          <HorairesForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update
                .mutateAsync({ id: editing.id!, body: payload })
                .then(() => {
                  toast.success('Horaires mis à jour');
                  setEditing(null);
                })
                .catch((e) =>
                  toast.error('Échec de la mise à jour', extractErrorMessage(e))
                )
            }
          />
        ) : null}
      </Drawer>
    </div>
  );
}

function HorairesForm({
  initial,
  onSubmit,
  pending,
}: {
  initial: DaySchedule;
  onSubmit: (payload: Partial<DaySchedule>) => Promise<unknown>;
  pending: boolean;
}) {
  const [v, setV] = useState({
    key: initial.key,
    label: initial.label,
    hours: initial.hours,
    jsDay: initial.jsDay,
    position: initial.position,
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...v,
          jsDay: Number(v.jsDay) || 0,
          position: Number(v.position) || 0,
        });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Clé" required value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} hint="ex. lundi, mardi" />
      <TextField label="Label" required value={v.label} onChange={(e) => setV({ ...v, label: e.target.value })} />
      <TextField label="Horaires" required value={v.hours} onChange={(e) => setV({ ...v, hours: e.target.value })} placeholder="17h - 23h30 (ou 'Fermé')" />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="jsDay (0=dim, 1=lun…)" type="number" value={String(v.jsDay)} onChange={(e) => setV({ ...v, jsDay: Number(e.target.value) })} />
        <TextField label="Position" type="number" value={String(v.position)} onChange={(e) => setV({ ...v, position: Number(e.target.value) })} />
      </div>
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}
