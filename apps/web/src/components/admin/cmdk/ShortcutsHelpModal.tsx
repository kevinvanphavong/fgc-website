'use client';

import { useEffect } from 'react';
import { Keyboard, X } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { ADMIN_SHORTCUTS } from '@/lib/admin-keyboard';

interface Props {
  open: boolean;
  onClose: () => void;
}

const EXTRA_SHORTCUTS = [
  { combo: '⌘ K', description: 'Ouvrir la palette de commandes' },
  { combo: '⌘ .', description: 'Ouvrir/fermer le panneau de réglages' },
  { combo: 'Esc', description: 'Fermer la palette ou un drawer' },
];

export default function ShortcutsHelpModal({ open, onClose }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-help-title"
    >
      <div
        className="w-full max-w-md rounded-xl border border-admin-border bg-admin-bg-elev p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-admin-border pb-3">
          <h2 id="shortcuts-help-title" className="flex items-center gap-2 text-base font-semibold text-admin-text">
            <Icon icon={Keyboard} size={16} />
            Raccourcis clavier
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-brand-ring"
          >
            <Icon icon={X} size={16} />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {ADMIN_SHORTCUTS.map((s) => (
            <Row key={s.combo} combo={s.combo} description={s.description} />
          ))}
          <div className="my-3 h-px bg-admin-border-soft" />
          {EXTRA_SHORTCUTS.map((s) => (
            <Row key={s.combo} combo={s.combo} description={s.description} />
          ))}
        </div>

        <p className="mt-4 text-[0.7rem] text-admin-text-muted">
          Les raccourcis sont désactivés quand un champ texte a le focus.
        </p>
      </div>
    </div>
  );
}

function Row({ combo, description }: { combo: string; description: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-admin-text-muted">{description}</span>
      <kbd className="rounded border border-admin-border bg-admin-bg-sunken px-2 py-0.5 font-mono text-[0.75rem] text-admin-text">
        {combo}
      </kbd>
    </div>
  );
}
