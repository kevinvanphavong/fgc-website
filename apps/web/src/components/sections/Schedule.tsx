'use client';

import SectionHeader from '@/components/ui/SectionHeader';
import type { DaySchedule } from '@/lib/schedule';
import { SCHEDULE } from '@/lib/schedule';
import { cn } from '@/lib/cn';

export default function Schedule({ data }: { data?: DaySchedule[] }) {
  const today = new Date().getDay();
  const schedule = data ?? SCHEDULE;

  return (
    <section className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Nos horaires"
          title={
            <>
              Toujours <span className="accent">ouverts pour vous.</span>
            </>
          }
          lead="Le centre est ouvert tous les jours de la semaine, avec des nocturnes le week-end jusqu'à 2h du matin."
        />

        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
          {schedule.map((day) => {
            const isToday = day.jsDay === today;
            return (
              <div
                key={day.key}
                className={cn(
                  'rounded-fgc-card-soft px-3 py-[18px] text-center transition-all',
                  isToday
                    ? 'bg-fgc-yellow text-fgc-purple shadow-fgc-3d-yellow-sm'
                    : 'bg-white/[0.04] border border-white/[0.08]'
                )}
              >
                <div
                  className={cn(
                    'mb-1 font-display text-[0.9rem] uppercase',
                    isToday ? 'text-fgc-purple' : 'text-fgc-cream'
                  )}
                >
                  {day.label}
                </div>
                <div
                  className={cn(
                    'text-[0.85rem]',
                    isToday ? 'font-semibold text-fgc-purple/80' : 'text-fgc-cream/60'
                  )}
                >
                  {day.hours}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
