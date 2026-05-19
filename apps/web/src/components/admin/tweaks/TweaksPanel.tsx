'use client';

import { useEffect } from 'react';
import { Sliders, X } from 'lucide-react';
import Icon from '@/components/admin/ui/Icon';
import { cn } from '@/lib/cn';
import {
  useAdminTweaks,
  type Density,
  type SidebarMode,
  type ThemeMode,
} from '@/lib/admin-tweaks';

const DENSITY_OPTIONS: { value: Density; label: string; hint: string }[] = [
  { value: 'compact', label: 'Compact', hint: 'Plus de données à l\'écran' },
  { value: 'regular', label: 'Standard', hint: 'Équilibre par défaut' },
  { value: 'comfy', label: 'Confort', hint: 'Plus d\'air autour des éléments' },
];

const SIDEBAR_OPTIONS: { value: SidebarMode; label: string; hint: string }[] = [
  { value: 'expanded', label: 'Étendue', hint: 'Labels visibles' },
  { value: 'collapsed', label: 'Repliée', hint: 'Icônes seules + tooltip' },
  { value: 'floating', label: 'Flottante', hint: 'Drawer mobile/tablette' },
];

const THEME_OPTIONS: { value: ThemeMode; label: string; disabled?: boolean }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre', disabled: true },
  { value: 'system', label: 'Système', disabled: true },
];

/**
 * Panel de réglages d'interface (PR8). Toggle visibilité via `⌘.` / `Ctrl+.`,
 * également manipulable depuis le bouton flottant bas-droite et la topbar.
 */
export default function TweaksPanel() {
  const { tweaks, update, ready } = useAdminTweaks();

  // Raccourci global ⌘. / Ctrl+. — déclenche l'ouverture/fermeture.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        update({ panelOpen: !tweaks.panelOpen });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tweaks.panelOpen, update]);

  // Esc ferme le panel.
  useEffect(() => {
    if (!tweaks.panelOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') update({ panelOpen: false });
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tweaks.panelOpen, update]);

  if (!ready) return null;

  return (
    <>
      {/* Bouton flottant — toujours présent quand le panel est fermé. */}
      {!tweaks.panelOpen && (
        <button
          type="button"
          onClick={() => update({ panelOpen: true })}
          className="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full border border-admin-border bg-admin-bg-elev text-admin-text-muted shadow-lg hover:text-admin-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-brand-ring"
          aria-label="Ouvrir le panneau de réglages (⌘.)"
          title="Réglages (⌘.)"
        >
          <Icon icon={Sliders} size={18} />
        </button>
      )}

      {tweaks.panelOpen && (
        <aside
          role="dialog"
          aria-modal="false"
          aria-label="Panneau de réglages"
          className="fixed bottom-5 right-5 z-40 w-[320px] rounded-xl border border-admin-border bg-admin-bg-elev p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-admin-text">
              <Icon icon={Sliders} size={16} />
              <span className="text-sm font-semibold">Réglages</span>
            </div>
            <button
              type="button"
              onClick={() => update({ panelOpen: false })}
              aria-label="Fermer le panneau"
              className="rounded-md p-1 text-admin-text-muted hover:bg-admin-bg-sunken hover:text-admin-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-brand-ring"
            >
              <Icon icon={X} size={15} />
            </button>
          </div>

          <Section title="Densité">
            <SegmentedControl
              options={DENSITY_OPTIONS}
              value={tweaks.density}
              onChange={(v) => update({ density: v })}
            />
          </Section>

          <Section title="Barre latérale">
            <SegmentedControl
              options={SIDEBAR_OPTIONS}
              value={tweaks.sidebar}
              onChange={(v) => update({ sidebar: v })}
            />
          </Section>

          <Section title="Thème">
            <SegmentedControl
              options={THEME_OPTIONS}
              value={tweaks.theme}
              onChange={(v) => update({ theme: v })}
              hint="Mode sombre — bientôt"
            />
          </Section>

          <p className="mt-4 text-[0.7rem] text-admin-text-muted">
            Astuce : ouvre ce panneau avec <kbd className="rounded border border-admin-border bg-admin-bg-sunken px-1">⌘ .</kbd>
          </p>
        </aside>
      )}
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="mb-1.5 text-[0.7rem] font-semibold uppercase tracking-wider text-admin-text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface SegmentedOption<V extends string> {
  value: V;
  label: string;
  hint?: string;
  disabled?: boolean;
}

function SegmentedControl<V extends string>({
  options,
  value,
  onChange,
  hint,
}: {
  options: SegmentedOption<V>[];
  value: V;
  onChange: (v: V) => void;
  hint?: string;
}) {
  return (
    <>
      <div
        role="radiogroup"
        className="flex items-center gap-1 rounded-md border border-admin-border bg-admin-bg p-0.5"
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            disabled={o.disabled}
            onClick={() => !o.disabled && onChange(o.value)}
            className={cn(
              'flex-1 rounded px-2 py-1 text-[0.75rem] font-medium transition',
              value === o.value
                ? 'bg-admin-brand-soft text-admin-brand'
                : 'text-admin-text-muted hover:bg-admin-bg-sunken',
              o.disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
            )}
            title={o.hint}
          >
            {o.label}
          </button>
        ))}
      </div>
      {hint && (
        <p className="mt-1 text-[0.7rem] italic text-admin-text-muted">{hint}</p>
      )}
    </>
  );
}
