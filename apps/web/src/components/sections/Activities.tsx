import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import { ACTIVITIES } from '@/lib/activities';

export default function Activities() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Nos activités"
          title={
            <>
              7 expériences, <span className="accent">1 seul endroit.</span>
            </>
          }
          lead="Choisissez votre terrain de jeu. Toutes nos activités sont accessibles en libre-service ou sur réservation, en duo, en groupe ou en famille."
        />

        <div className="grid gap-[22px] md:grid-cols-2 lg:grid-cols-3">
          {ACTIVITIES.map((activity) => (
            <Link
              key={activity.key}
              href={activity.href}
              className="group relative min-h-[320px] overflow-hidden rounded-fgc-lg border border-fgc-yellow/[0.18] bg-fgc-card p-7 transition-all duration-200 hover:-translate-y-1.5 hover:border-fgc-yellow/50 hover:shadow-fgc-card-hover"
            >
              {/* Halo magenta */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-[200px] w-[200px] opacity-50"
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,0,200,0.4), transparent 70%)',
                }}
                aria-hidden="true"
              />

              {/* Icon */}
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-fgc-card-soft bg-fgc-icon shadow-fgc-3d-yellow-md">
                <span className="text-[1.8rem]" aria-hidden="true">
                  {activity.icon}
                </span>
              </div>

              {/* Content */}
              <h3 className="relative mb-2 font-display text-fgc-cream">
                {activity.name}
              </h3>
              <p className="relative mb-4 text-[0.9rem] leading-relaxed text-fgc-cream/70">
                {activity.description}
              </p>

              {/* Link arrow */}
              <span className="relative inline-flex items-center gap-1 font-display text-[0.85rem] uppercase text-fgc-yellow">
                Découvrir
                <span
                  className="inline-block transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
