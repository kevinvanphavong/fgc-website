'use client';

import { useState } from 'react';
import { Edit } from 'lucide-react';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import Drawer from '@/components/admin/ui/Drawer';
import { TextField, TextareaField } from '@/components/admin/ui/Field';
import { useToast } from '@/components/admin/ui/Toast';
import EditorCard from './EditorCard';
import {
  activityPages,
  extractErrorMessage,
  type ActivityPageContent,
} from '@/lib/admin-hooks';

/**
 * ActivitesEditor — édition du contenu textuel des 8 pages activité.
 * Le visuel (champ `image`) est éditable en V1 par URL/chemin manuel.
 * Upload réel arrive en PR7 (module Médias).
 */

export default function ActivitesEditor() {
  const list = activityPages.useList();
  const update = activityPages.useUpdate();
  const toast = useToast();
  const [editing, setEditing] = useState<ActivityPageContent | null>(null);

  return (
    <EditorCard
      title="Pages activités"
      subtitle="Une carte par activité du site. Édite ici le contenu textuel ; l'upload d'image arrive en PR7."
    >
      {list.isLoading ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-admin-bg-sunken" />
          ))}
        </div>
      ) : list.data?.length === 0 ? (
        <div className="rounded-md border border-dashed border-admin-border py-6 text-center text-[0.8125rem] text-admin-text-muted">
          Aucune page activité.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(list.data ?? []).map((a) => (
            <div
              key={a.id}
              className="flex flex-col rounded-lg border border-admin-border bg-admin-bg-elev p-4"
            >
              <div className="text-[0.9375rem] font-semibold capitalize text-admin-text">
                /{a.slug}
              </div>
              <div className="mt-1 text-[0.75rem] text-admin-text-muted">
                {a.pricingTitle ?? '—'}
              </div>
              {a.inlinePriceAmount ? (
                <div className="mt-2 text-[0.875rem] text-admin-text">
                  {a.inlinePriceAmount}{' '}
                  <span className="text-admin-text-muted">
                    {a.inlinePriceDescription}
                  </span>
                </div>
              ) : null}
              <div className="mt-auto pt-3">
                <AdminButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(a)}
                  iconLeft={<Icon icon={Edit} size={13} />}
                >
                  Modifier
                </AdminButton>
              </div>
            </div>
          ))}
        </div>
      )}

      <Drawer
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing ? `/${editing.slug}` : 'Modifier'}
        width={560}
      >
        {editing ? (
          <ActivityForm
            initial={editing}
            pending={update.isPending}
            onSubmit={(payload) =>
              update
                .mutateAsync({ id: editing.id!, body: payload })
                .then(() => {
                  toast.success('Page activité mise à jour');
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

function ActivityForm({
  initial,
  onSubmit,
  pending,
}: {
  initial: ActivityPageContent;
  onSubmit: (p: Partial<ActivityPageContent>) => Promise<unknown>;
  pending: boolean;
}) {
  const [v, setV] = useState({
    slug: initial.slug,
    image: initial.image,
    imageAlt: initial.imageAlt,
    inlinePriceAmount: initial.inlinePriceAmount ?? '',
    inlinePriceDescription: initial.inlinePriceDescription ?? '',
    pricingEyebrow: initial.pricingEyebrow ?? '',
    pricingTitle: initial.pricingTitle ?? '',
    pricingLead: initial.pricingLead ?? '',
    features: (initial.features ?? []).join('\n'),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          slug: v.slug,
          image: v.image,
          imageAlt: v.imageAlt,
          inlinePriceAmount: v.inlinePriceAmount || null,
          inlinePriceDescription: v.inlinePriceDescription || null,
          pricingEyebrow: v.pricingEyebrow || null,
          pricingTitle: v.pricingTitle || null,
          pricingLead: v.pricingLead || null,
          features: v.features.split('\n').map((s) => s.trim()).filter(Boolean),
        });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Slug" required value={v.slug} onChange={(e) => setV({ ...v, slug: e.target.value })} />
      <TextField label="Image (chemin)" required value={v.image} onChange={(e) => setV({ ...v, image: e.target.value })} hint="ex. /assets/activites/bowling.png" />
      <TextField label="Image alt" value={v.imageAlt} onChange={(e) => setV({ ...v, imageAlt: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Tarif principal" value={v.inlinePriceAmount} onChange={(e) => setV({ ...v, inlinePriceAmount: e.target.value })} placeholder="8,50€" />
        <TextField label="Description tarif" value={v.inlinePriceDescription} onChange={(e) => setV({ ...v, inlinePriceDescription: e.target.value })} placeholder="la partie adulte" />
      </div>
      <TextField label="Pricing eyebrow" value={v.pricingEyebrow} onChange={(e) => setV({ ...v, pricingEyebrow: e.target.value })} />
      <TextField label="Pricing title" value={v.pricingTitle} onChange={(e) => setV({ ...v, pricingTitle: e.target.value })} />
      <TextareaField label="Pricing lead" rows={2} value={v.pricingLead} onChange={(e) => setV({ ...v, pricingLead: e.target.value })} />
      <TextareaField label="Features (une par ligne)" rows={4} value={v.features} onChange={(e) => setV({ ...v, features: e.target.value })} />
      <p className="rounded-md bg-admin-bg-sunken px-3 py-2 text-[0.75rem] text-admin-text-muted">
        Édition des price cards (sous-objet JSON) à venir en V2.
      </p>
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}
