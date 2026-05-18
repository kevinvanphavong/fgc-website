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
  menuSections,
  menuItems,
  extractErrorMessage,
  type MenuSection,
  type MenuCategory,
  type MenuItem,
} from '@/lib/admin-hooks';

/**
 * BarSnackEditor — arborescence Sections > Catégories > Items.
 * V1 : édition Section + édition/suppression Item. Création d'item + édition
 * Catégorie reportées (l'arborescence imbriquée nécessite plus d'UX que
 * l'enveloppe disponible pour PR4).
 */

export default function BarSnackEditor() {
  const list = menuSections.useList();
  const updateSection = menuSections.useUpdate();
  const updateItem = menuItems.useUpdate();
  const removeItem = menuItems.useRemove();
  const toast = useToast();
  const [editingSection, setEditingSection] = useState<MenuSection | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MenuItem | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {list.isLoading ? (
        <EditorCard title="Bar & Snack">
          <div className="h-32 animate-pulse rounded bg-admin-bg-sunken" />
        </EditorCard>
      ) : list.data?.length === 0 ? (
        <EditorCard title="Bar & Snack">
          <div className="rounded-md border border-dashed border-admin-border py-6 text-center text-[0.8125rem] text-admin-text-muted">
            Aucune section de menu.
          </div>
        </EditorCard>
      ) : (
        (list.data ?? []).map((section) => (
          <EditorCard
            key={section.id}
            title={`${section.eyebrow} — ${section.title}`}
            subtitle={section.lead ?? undefined}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[0.75rem] text-admin-text-muted">
                {(section.columns ?? []).length} catégorie(s)
              </span>
              <AdminButton
                variant="ghost"
                size="sm"
                onClick={() => setEditingSection(section)}
                iconLeft={<Icon icon={Edit} size={13} />}
              >
                Modifier la section
              </AdminButton>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(section.columns ?? []).map((cat: MenuCategory) => (
                <div
                  key={cat.id}
                  className="rounded-lg border border-admin-border bg-admin-bg-elev p-3"
                >
                  <div className="mb-2 text-[0.8125rem] font-semibold text-admin-text">
                    {cat.title}
                  </div>
                  <ul className="flex flex-col divide-y divide-admin-border-soft">
                    {(cat.items ?? []).length === 0 ? (
                      <li className="py-2 text-[0.75rem] text-admin-text-muted">
                        Aucun item.
                      </li>
                    ) : (
                      (cat.items ?? []).map((item: MenuItem) => (
                        <li key={item.id} className="flex items-start gap-2 py-2">
                          <div className="min-w-0 flex-1">
                            <div className="text-[0.875rem] font-medium text-admin-text">
                              {item.name}
                            </div>
                            <div className="text-[0.75rem] text-admin-text-muted">
                              {item.description}
                            </div>
                          </div>
                          <span className="shrink-0 text-[0.875rem] font-semibold text-admin-text tabular-nums">
                            {item.price}
                          </span>
                          <div className="flex shrink-0 gap-0.5">
                            <button
                              type="button"
                              onClick={() => setEditingItem(item)}
                              className="rounded p-1 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text"
                              aria-label="Modifier"
                            >
                              <Icon icon={Edit} size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPendingDelete(item)}
                              className="rounded p-1 text-admin-text-muted hover:bg-admin-red-soft hover:text-admin-red"
                              aria-label="Supprimer"
                            >
                              <Icon icon={Trash2} size={13} />
                            </button>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </EditorCard>
        ))
      )}

      <Drawer
        open={editingSection !== null}
        onClose={() => setEditingSection(null)}
        title={editingSection?.title ?? 'Section'}
      >
        {editingSection ? (
          <SectionForm
            initial={editingSection}
            pending={updateSection.isPending}
            onSubmit={(payload) =>
              updateSection
                .mutateAsync({ id: editingSection.id!, body: payload })
                .then(() => {
                  toast.success('Section mise à jour');
                  setEditingSection(null);
                })
                .catch((e) => toast.error('Échec', extractErrorMessage(e)))
            }
          />
        ) : null}
      </Drawer>

      <Drawer
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title={editingItem?.name ?? 'Item'}
      >
        {editingItem ? (
          <ItemForm
            initial={editingItem}
            pending={updateItem.isPending}
            onSubmit={(payload) =>
              updateItem
                .mutateAsync({ id: editingItem.id!, body: payload })
                .then(() => {
                  toast.success('Item mis à jour');
                  setEditingItem(null);
                })
                .catch((e) => toast.error('Échec', extractErrorMessage(e)))
            }
          />
        ) : null}
      </Drawer>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Supprimer cet item ?"
        description={`«${pendingDelete?.name}» disparaîtra du menu bar & snack.`}
        destructive
        confirmLabel="Supprimer"
        pending={removeItem.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() =>
          removeItem
            .mutateAsync(pendingDelete!.id!)
            .then(() => {
              toast.success('Item supprimé');
              setPendingDelete(null);
            })
            .catch((e) => toast.error('Échec', extractErrorMessage(e)))
        }
      />
    </div>
  );
}

function SectionForm({
  initial,
  onSubmit,
  pending,
}: {
  initial: MenuSection;
  onSubmit: (p: Partial<MenuSection>) => Promise<unknown>;
  pending: boolean;
}) {
  const [v, setV] = useState({
    key: initial.key,
    eyebrow: initial.eyebrow,
    title: initial.title,
    titleAccent: initial.titleAccent,
    lead: initial.lead ?? '',
    position: initial.position,
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          ...v,
          lead: v.lead || null,
          position: Number(v.position) || 0,
        });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Clé" required value={v.key} onChange={(e) => setV({ ...v, key: e.target.value })} />
      <TextField label="Eyebrow" required value={v.eyebrow} onChange={(e) => setV({ ...v, eyebrow: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <TextField label="Titre" required value={v.title} onChange={(e) => setV({ ...v, title: e.target.value })} />
        <TextField label="Accent titre" value={v.titleAccent} onChange={(e) => setV({ ...v, titleAccent: e.target.value })} />
      </div>
      <TextareaField label="Lead" rows={2} value={v.lead} onChange={(e) => setV({ ...v, lead: e.target.value })} />
      <TextField label="Position" type="number" value={String(v.position)} onChange={(e) => setV({ ...v, position: Number(e.target.value) })} />
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}

function ItemForm({
  initial,
  onSubmit,
  pending,
}: {
  initial: MenuItem;
  onSubmit: (p: Partial<MenuItem>) => Promise<unknown>;
  pending: boolean;
}) {
  const [v, setV] = useState({
    name: initial.name,
    description: initial.description,
    price: initial.price,
    position: initial.position,
  });
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ ...v, position: Number(v.position) || 0 });
      }}
      className="flex flex-col gap-3"
    >
      <TextField label="Nom" required value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
      <TextareaField label="Description" rows={2} value={v.description} onChange={(e) => setV({ ...v, description: e.target.value })} />
      <TextField label="Prix" required value={v.price} onChange={(e) => setV({ ...v, price: e.target.value })} placeholder="9,50€" />
      <TextField label="Position" type="number" value={String(v.position)} onChange={(e) => setV({ ...v, position: Number(e.target.value) })} />
      <div className="flex justify-end pt-2">
        <AdminButton type="submit" variant="primary" size="sm" disabled={pending}>
          {pending ? 'Enregistrement…' : 'Enregistrer'}
        </AdminButton>
      </div>
    </form>
  );
}
