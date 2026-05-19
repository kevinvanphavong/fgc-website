'use client';

import { cn } from '@/lib/cn';
import type { StepKey } from './types';

const LABELS: { key: StepKey; n: number; label: string }[] = [
  { key: 'formule', n: 1, label: 'Formule' },
  { key: 'date', n: 2, label: 'Date' },
  { key: 'enfant', n: 3, label: 'L’enfant' },
  { key: 'coordonnees', n: 4, label: 'Parent' },
  { key: 'recap', n: 5, label: 'Récap' },
];

interface StepperProps {
  current: StepKey;
  completed: StepKey[];
  onJump: (step: StepKey) => void;
}

export default function Stepper({ current, completed, onJump }: StepperProps) {
  // Sur l'écran de confirmation, le stepper est masqué.
  if (current === 'confirmation') return null;

  return (
    <nav aria-label="Étapes de la réservation" className="mb-8">
      <ol className="flex flex-wrap items-center justify-center gap-2 md:gap-4">
        {LABELS.map((step, i) => {
          const isDone = completed.includes(step.key);
          const isActive = current === step.key;
          const clickable = isDone && !isActive;
          return (
            <li key={step.key} className="flex items-center gap-2 md:gap-4">
              <button
                type="button"
                onClick={() => (clickable ? onJump(step.key) : undefined)}
                disabled={!clickable && !isActive}
                aria-current={isActive ? 'step' : undefined}
                className={cn(
                  'group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-fgc-yellow focus-visible:ring-offset-2 focus-visible:ring-offset-fgc-bg',
                  isActive && 'bg-fgc-yellow text-fgc-bg shadow-fgc-yellow',
                  !isActive && isDone && 'bg-fgc-purple-bright/40 text-fgc-cream hover:bg-fgc-purple-bright/60 cursor-pointer',
                  !isActive && !isDone && 'bg-fgc-purple/40 text-fgc-cream/60',
                )}
              >
                <span
                  className={cn(
                    'grid h-7 w-7 place-items-center rounded-full text-xs font-bold',
                    isActive && 'bg-fgc-bg text-fgc-yellow',
                    !isActive && isDone && 'bg-fgc-yellow text-fgc-bg',
                    !isActive && !isDone && 'bg-fgc-bg/60 text-fgc-cream/70',
                  )}
                >
                  {isDone && !isActive ? '✓' : step.n}
                </span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
              {i < LABELS.length - 1 && (
                <span
                  className={cn(
                    'h-px w-6 md:w-10 transition-colors',
                    isDone ? 'bg-fgc-yellow' : 'bg-fgc-purple/60',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
