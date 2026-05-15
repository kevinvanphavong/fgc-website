import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { TARIFS_ACTIVITES, TARIFS_BAR } from '@/lib/tarifs';
import type { TarifCard } from '@/lib/tarifs';

export const metadata: Metadata = {
  title: 'Tarifs à la carte',
  description:
    'Tarifs à la carte 2026 du Family Games Center à Blois : bowling, billard, fléchettes, karaoké, VR, blindtest, bar et snacking.',
};

function TarifCardComponent({
  card,
  variant = 'default',
}: {
  card: TarifCard;
  variant?: 'default' | 'bar';
}) {
  const isBar = variant === 'bar';

  return (
    <article
      className={`group flex flex-col gap-4 rounded-fgc-lg border p-7 transition-all hover:-translate-y-1 ${
        isBar
          ? 'border-fgc-yellow/30 bg-gradient-to-b from-fgc-yellow/10 to-fgc-bg/95'
          : 'border-fgc-yellow/[0.18] bg-fgc-card'
      } hover:border-fgc-yellow/40`}
    >
      <div
        className={`grid h-14 w-14 place-items-center rounded-2xl text-[1.8rem] ${
          isBar
            ? 'bg-gradient-to-br from-fgc-pink-hot to-fgc-pink text-white shadow-[0_5px_0_#8e0d3d]'
            : 'bg-gradient-to-br from-fgc-yellow to-fgc-yellow-dark text-fgc-purple shadow-fgc-btn-yellow'
        }`}
      >
        {card.icon}
      </div>

      <div>
        <div className="font-display text-[1.7rem] uppercase leading-none text-fgc-cream">
          {card.name}
        </div>
        <div className="mt-1 text-[0.78rem] uppercase tracking-widest text-fgc-cream/55">
          {card.unit}
        </div>
      </div>

      <ul className="flex flex-col gap-2.5 border-t border-dashed border-white/10 pt-3.5">
        {card.prices.map((line) => (
          <li
            key={line.label}
            className="flex items-baseline gap-2 text-[0.95rem] text-fgc-cream/90"
          >
            <span className="shrink-0">{line.label}</span>
            <span className="flex-1 -translate-y-1 border-b border-dotted border-white/15" />
            <span
              className={`whitespace-nowrap font-display text-[1.05rem] tracking-wide ${
                line.price.includes('—') || line.price.startsWith('dès')
                  ? 'text-fgc-pink-hot'
                  : 'text-fgc-yellow'
              }`}
            >
              {line.price}
            </span>
          </li>
        ))}
      </ul>

      {card.note && (
        <div className="border-t border-dashed border-white/[0.08] pt-2 text-[0.82rem] leading-relaxed text-fgc-cream/60">
          {card.note}
        </div>
      )}
    </article>
  );
}

export default function TarifsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-[60px] pb-[30px]">
        <div className="wrap mx-auto max-w-[820px] text-center">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Tarifs à la carte' },
            ]}
          />
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Tarifs 2026 / 2027
          </span>
          <h1 className="hero-title">
            Tarifs <span className="pop">à la carte.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
            Référence des activités, du bar et du snacking — à l&apos;unité,
            par heure ou par personne. Pour les formules à prix négocié, voir
            notre{' '}
            <a
              href="/formules"
              className="text-fgc-yellow underline underline-offset-2"
            >
              page Formules
            </a>
            .
          </p>
        </div>
      </section>

      {/* Activités */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            🎮 Les activités
          </span>
          <h2 className="section-title">
            Activités <span className="accent">à l&apos;unité.</span>
          </h2>

          <div className="mt-8 grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
            {TARIFS_ACTIVITES.map((card) => (
              <TarifCardComponent key={card.name} card={card} />
            ))}
          </div>
        </div>
      </section>

      {/* Bar & Snacking */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            🍹 Bar &amp; Snacking
          </span>
          <h2 className="section-title">
            À <span className="accent">l&apos;unité.</span>
          </h2>

          <div className="mt-8 grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
            {TARIFS_BAR.map((card) => (
              <TarifCardComponent
                key={card.name}
                card={card}
                variant="bar"
              />
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-10 rounded-r-[14px] border-l-[3px] border-fgc-yellow bg-fgc-yellow/[0.06] px-[22px] py-[18px] text-[0.88rem] leading-relaxed text-fgc-cream/80">
            Tarifs susceptibles d&apos;évoluer selon les saisons et les
            fournisseurs.{' '}
            <strong className="text-fgc-yellow">
              Soumis à TVA et au service.
            </strong>{' '}
            Pour les groupes de plus de 9 personnes, voir nos{' '}
            <a
              href="/formules#pass"
              className="text-fgc-yellow underline underline-offset-2"
            >
              Pass multi-activités
            </a>{' '}
            et{' '}
            <a
              href="/formules#reservations-groupe"
              className="text-fgc-yellow underline underline-offset-2"
            >
              Réservations groupe
            </a>{' '}
            à prix négocié.
          </div>
        </div>
      </section>
    </>
  );
}
