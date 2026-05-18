'use client';

import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import AdminButton from '@/components/admin/ui/Button';
import Icon from '@/components/admin/ui/Icon';
import { Card } from '@/components/admin/ui/Card';

type EditorCardProps = {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  addLabel?: string;
  children: ReactNode;
};

/**
 * Wrapper card commun aux éditeurs Contenus : title + sub + bouton "Ajouter"
 * en header. Reproduit la "card-head" du mockup.
 */
export default function EditorCard({
  title,
  subtitle,
  onAdd,
  addLabel = 'Ajouter',
  children,
}: EditorCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-admin-border-soft px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-admin-text">{title}</h2>
          {subtitle ? (
            <p className="mt-0.5 text-[0.8125rem] text-admin-text-muted">
              {subtitle}
            </p>
          ) : null}
        </div>
        {onAdd ? (
          <AdminButton
            type="button"
            variant="ghost"
            size="sm"
            onClick={onAdd}
            iconLeft={<Icon icon={Plus} size={14} />}
          >
            {addLabel}
          </AdminButton>
        ) : null}
      </div>
      <div className="px-5 py-4">{children}</div>
    </Card>
  );
}
