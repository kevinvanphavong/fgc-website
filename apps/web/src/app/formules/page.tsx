import type { Metadata } from 'next';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import {
  fetchHebdoCards,
  fetchPassCards,
  fetchResaCards,
  fetchAnnivCards,
  fetchVipFeatures,
} from '@/lib/content-api';

export const metadata: Metadata = {
  title: 'Nos Formules',
  description:
    'Soirées hebdomadaires, Pass multi-activités, Réservations groupe SILVER/GOLD/PLATINIUM et anniversaires enfants — saison 2026/2027.',
};

function SectionDivider({
  num,
  label,
}: {
  num: string;
  label: string;
}) {
  return (
    <div className="mb-3.5 flex items-center gap-3 font-display text-[0.85rem] uppercase tracking-[2px] text-fgc-pink-hot">
      <span className="grid h-9 w-9 place-items-center rounded-full border border-fgc-pink-hot bg-fgc-pink-hot/10 text-[0.85rem] text-fgc-yellow">
        {num}
      </span>
      {label}
    </div>
  );
}

export default async function FormulesPage() {
  const [HEBDO_CARDS, PASS_CARDS, RESA_CARDS, ANNIV_CARDS, VIP_FEATURES] = await Promise.all([
    fetchHebdoCards(),
    fetchPassCards(),
    fetchResaCards(),
    fetchAnnivCards(),
    fetchVipFeatures(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative py-[60px] pb-[30px]">
        <div className="wrap mx-auto max-w-[820px] text-center">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Nos Formules' },
            ]}
          />
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Formules &amp; Réservations
          </span>
          <h1 className="hero-title">
            Formules <span className="pop">&amp; Pass.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
            Soirées à thème, pass multi-activités, offres groupe et
            anniversaires enfants — tout est ici. Les{' '}
            <a
              href="/tarifs"
              className="text-fgc-yellow underline underline-offset-2"
            >
              tarifs à la carte
            </a>{' '}
            sont sur une page dédiée.
          </p>
        </div>
      </section>

      {/* 1 — Soirées hebdomadaires */}
      <section className="section" id="hebdomadaires" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <SectionDivider num="1" label="Soirées hebdomadaires" />
          <div className="mb-9 grid items-end gap-[60px] border-b border-dashed border-fgc-yellow/20 pb-[26px] lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="section-title">
                Les <span className="accent">bons plans</span> de la semaine.
              </h2>
            </div>
            <p className="text-[1rem] leading-relaxed text-fgc-cream/80">
              Chaque semaine, des soirées à prix réduit pour profiter du centre
              sans compter.{' '}
              <em className="not-italic font-semibold text-fgc-yellow">
                Bowling à volonté, Jeudi à gogo, Pack Afterwork.
              </em>
            </p>
          </div>

          <div className="grid gap-[22px] lg:grid-cols-3">
            {HEBDO_CARDS.map((card) => (
              <article
                key={card.key}
                className={cn(
                  'relative flex min-h-[360px] flex-col gap-4 overflow-hidden rounded-fgc-lg border p-7 transition-all hover:-translate-y-1',
                  'bg-fgc-card',
                  card.featured
                    ? 'border-fgc-yellow shadow-[0_0_0_1px_var(--yellow-dark)]'
                    : 'border-fgc-yellow/[0.18] hover:border-fgc-yellow/40'
                )}
              >
                {/* Magenta glow */}
                <div className="pointer-events-none absolute -right-10 -top-10 h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(255,45,135,0.25)_0%,transparent_65%)]" />

                {card.featured && (
                  <div className="absolute right-[18px] top-[18px] rounded-full bg-gradient-to-b from-fgc-yellow to-fgc-yellow-dark px-3 py-1 font-display text-[0.72rem] uppercase tracking-wide text-fgc-purple shadow-[0_3px_0_#b88200]">
                    ★ Pack du moment
                  </div>
                )}

                <div className="flex items-center gap-2 font-display text-[0.72rem] uppercase tracking-[1.5px] text-fgc-pink-hot before:h-1.5 before:w-1.5 before:rounded-full before:bg-fgc-pink-hot">
                  {card.tag}
                </div>

                <h3 className="font-display text-[1.7rem] uppercase leading-tight text-fgc-cream">
                  {card.title}
                </h3>

                {card.description && (
                  <p className="text-[0.95rem] leading-relaxed text-fgc-cream/80">
                    {card.description}
                  </p>
                )}

                {card.bullets && (
                  <ul className="flex flex-col gap-2">
                    {card.bullets.map((b) => (
                      <li
                        key={b}
                        className="relative pl-[18px] text-[0.92rem] text-fgc-cream/85 before:absolute before:left-0 before:top-[9px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-fgc-yellow"
                      >
                        {b}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-auto flex items-end justify-between gap-3.5 border-t border-dashed border-white/10 pt-[18px]">
                  <div>
                    <span className="font-display text-[2.6rem] leading-none text-fgc-yellow">
                      {card.price.split('/')[0]}
                    </span>
                    {card.price.includes('/') && (
                      <span className="ml-1.5 text-[0.78rem] text-fgc-cream/60">
                        /{card.price.split('/')[1]}
                      </span>
                    )}
                    {card.savings && (
                      <span className="mt-1 block text-[0.72rem] text-fgc-cream/50 line-through">
                        {card.savings}
                      </span>
                    )}
                  </div>
                  <div className="text-right font-display text-[0.78rem] uppercase leading-snug tracking-wide text-fgc-cream/65">
                    {card.days}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 2 — Pass multi-activités */}
      <section className="section" id="pass">
        <div className="wrap">
          <SectionDivider num="2" label="Pass multi-activités" />
          <div className="mb-9 grid items-end gap-[60px] border-b border-dashed border-fgc-yellow/20 pb-[26px] lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="section-title">
                Pass <span className="accent">multi-activités.</span>
              </h2>
            </div>
            <p className="text-[1rem] leading-relaxed text-fgc-cream/80">
              Combinez bowling, VR, arcade et plus encore.{' '}
              <em className="not-italic font-semibold text-fgc-yellow">
                Plus vous ajoutez, plus vous économisez.
              </em>
            </p>
          </div>

          <div className="grid gap-[18px] sm:grid-cols-2 xl:grid-cols-4">
            {PASS_CARDS.map((card) => (
              <article
                key={card.key}
                className={cn(
                  'relative flex flex-col gap-3.5 rounded-[22px] border p-6 transition-all hover:-translate-y-1',
                  card.featured
                    ? 'border-fgc-yellow bg-gradient-to-b from-[rgba(94,45,184,0.85)] to-fgc-bg/95 shadow-[0_0_0_1px_var(--yellow-dark)]'
                    : 'border-fgc-yellow/[0.18] bg-fgc-card hover:border-fgc-yellow/40'
                )}
              >
                {card.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-b from-fgc-pink-hot to-fgc-pink px-3.5 py-1 font-display text-[0.7rem] uppercase tracking-wider text-white">
                    ★ Best-seller
                  </div>
                )}

                <div className="font-display text-[1rem] uppercase tracking-[1.5px] text-fgc-cream">
                  {card.name}
                </div>

                <div className="font-display text-[2.6rem] leading-none text-fgc-yellow">
                  {card.price.split('/')[0]}
                  <span className="ml-1.5 font-body text-[0.78rem] font-normal text-fgc-cream/55">
                    /{card.price.split('/')[1]}
                  </span>
                </div>

                {/* Features breakdown */}
                <div className="flex flex-col gap-1.5 border-t border-dashed border-white/10 pt-3">
                  {card.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-baseline gap-1.5 text-[0.78rem] text-fgc-cream/70"
                    >
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-auto flex items-baseline justify-between border-t border-white/10 pt-2.5 font-display text-[0.72rem] uppercase tracking-wider text-fgc-cream/55">
                  <span>Séparé</span>
                  <strong className="text-[1rem] tracking-normal text-fgc-cream">
                    {card.separatePrice}
                  </strong>
                </div>

                {/* Savings */}
                <div className="flex items-center justify-between rounded-xl border border-[rgba(132,204,22,0.3)] bg-[rgba(132,204,22,0.12)] px-3.5 py-2 font-display uppercase tracking-wide">
                  <span className="text-[0.72rem] text-fgc-cream/70">
                    Économie
                  </span>
                  <span className="text-[1.3rem] text-[#a3e635]">
                    {card.savings}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 3 — Réservations groupe */}
      <section className="section" id="reservations-groupe">
        <div className="wrap">
          <SectionDivider num="3" label="Réservations groupe" />
          <div className="mb-9 grid items-end gap-[60px] border-b border-dashed border-fgc-yellow/20 pb-[26px] lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="section-title">
                Réservations <span className="accent">groupe.</span>
              </h2>
            </div>
            <p className="text-[1rem] leading-relaxed text-fgc-cream/80">
              Réservez à l&apos;avance et votre piste vous attend.{' '}
              <em className="not-italic font-semibold text-fgc-yellow">
                3 niveaux selon votre groupe.
              </em>
            </p>
          </div>

          <div className="grid gap-[22px] lg:grid-cols-3">
            {RESA_CARDS.map((card) => {
              const rankColor =
                card.rank === 'GOLD'
                  ? 'text-fgc-yellow'
                  : card.rank === 'PLATINIUM'
                    ? 'text-fgc-pink-hot'
                    : 'text-[#d4d4d8]';
              return (
                <article
                  key={card.key}
                  className="flex flex-col gap-4 rounded-fgc-lg border border-fgc-yellow/[0.18] bg-fgc-card p-[30px] transition-all hover:-translate-y-1"
                >
                  <div
                    className={cn(
                      'flex flex-wrap items-baseline gap-2.5 font-display uppercase tracking-[2px]',
                      rankColor
                    )}
                  >
                    {card.rank}
                    <span className="font-body text-[0.72rem] font-medium uppercase tracking-wider text-fgc-cream/50">
                      {card.audience}
                    </span>
                  </div>

                  <div className="font-display text-[3rem] leading-none text-fgc-cream">
                    {card.price.split('/')[0]}
                    <span className="ml-1 text-[1.4rem] text-fgc-pink-hot">
                      €
                    </span>
                    <span className="ml-1.5 font-body text-[0.85rem] font-normal text-fgc-cream/55">
                      /{card.price.split('€/')[1]}
                    </span>
                  </div>

                  <p className="font-display text-[0.9rem] uppercase text-fgc-cream/80">
                    {card.pitch}
                  </p>

                  <ul className="flex flex-col gap-2 border-t border-dashed border-white/10 pt-3.5">
                    {card.features.map((f) => (
                      <li
                        key={f}
                        className="relative pl-4 text-[0.88rem] text-fgc-cream/85 before:absolute before:left-0 before:top-[9px] before:h-1.5 before:w-1.5 before:rounded-full before:bg-fgc-yellow"
                      >
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto rounded-xl border border-fgc-yellow/20 bg-fgc-yellow/[0.06] p-3.5 text-[0.85rem] leading-relaxed text-fgc-cream/70">
                    💡 {card.keyPoint}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4 — Anniversaires */}
      <section className="section" id="anniversaires">
        <div className="wrap">
          <SectionDivider num="4" label="Anniversaires enfants" />
          <div className="mb-9 grid items-end gap-[60px] border-b border-dashed border-fgc-yellow/20 pb-[26px] lg:grid-cols-[1.2fr_1fr]">
            <div>
              <h2 className="section-title">
                Anniversaires <span className="accent">enfants.</span>
              </h2>
            </div>
            <p className="text-[1rem] leading-relaxed text-fgc-cream/80">
              3 formules adaptées à l&apos;âge, toutes incluant le goûter et le
              service VIP anniversaire.{' '}
              <em className="not-italic font-semibold text-fgc-yellow">
                À partir de 6 enfants.
              </em>
            </p>
          </div>

          <div className="grid gap-[22px] lg:grid-cols-3">
            {ANNIV_CARDS.map((card) => (
              <article
                key={card.key}
                className={cn(
                  'relative flex flex-col gap-4 rounded-fgc-lg border p-7 transition-all hover:-translate-y-1',
                  card.featured
                    ? 'border-fgc-yellow bg-gradient-to-b from-[rgba(94,45,184,0.85)] to-fgc-bg/95 shadow-fgc-featured'
                    : 'border-fgc-yellow/[0.18] bg-fgc-card hover:border-fgc-yellow/40'
                )}
              >
                {card.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-b from-fgc-pink-hot to-fgc-pink px-3.5 py-1 font-display text-[0.7rem] uppercase tracking-wider text-white">
                    ★ Le plus populaire
                  </div>
                )}

                <div className="text-[2.4rem]">{card.icon}</div>

                <div>
                  <div className="font-display text-[1.5rem] uppercase text-fgc-cream">
                    {card.name}
                  </div>
                  <div className="mt-1 text-[0.82rem] text-fgc-cream/60">
                    {card.age}
                  </div>
                </div>

                <div className="font-display text-[2.4rem] leading-none text-fgc-yellow">
                  {card.price.split('/')[0]}
                  <span className="ml-1.5 font-body text-[0.85rem] font-normal text-fgc-cream/55">
                    /{card.price.split('/')[1]}
                  </span>
                </div>

                <ul className="flex flex-col gap-2 border-t border-dashed border-white/10 pt-3.5">
                  {card.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[0.9rem] text-fgc-cream/85"
                    >
                      <span className="mt-0.5 text-fgc-yellow">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* VIP Features */}
          <div className="mt-10 rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8">
            <h3 className="mb-6 text-center font-display text-[1.1rem] uppercase tracking-wider text-fgc-yellow">
              🎉 Inclus dans toutes les formules — Service VIP Anniversaire
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VIP_FEATURES.map((feat) => (
                <div
                  key={feat.label}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-black/20 px-4 py-3"
                >
                  <span className="text-[1.3rem]">{feat.icon}</span>
                  <span className="text-[0.9rem] text-fgc-cream/85">
                    {feat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Button href="/contact" variant="pink">
              Réserver un anniversaire
            </Button>
          </div>
        </div>
      </section>

      {/* 5 — EVG/EVJF */}
      <section className="section" id="evg-evjf">
        <div className="wrap">
          <SectionDivider num="5" label="EVG / EVJF / Événements" />
          <div className="mx-auto max-w-3xl rounded-fgc-lg border border-fgc-pink-hot/30 bg-gradient-to-b from-fgc-pink-hot/10 to-fgc-bg/95 p-10 text-center">
            <h2 className="section-title mb-4">
              EVG, EVJF <span className="accent">&amp; événements.</span>
            </h2>
            <p className="mx-auto mb-8 max-w-fgc-lead text-[1.05rem] leading-relaxed text-fgc-cream/80">
              Enterrement de vie de garçon/fille, anniversaire adulte, soirée
              entre amis… Contactez-nous pour une formule sur mesure avec
              privatisation partielle, cocktails et animations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/contact" variant="pink">
                Nous contacter
              </Button>
              <Button href="tel:0254748521" variant="ghost">
                02 54 74 85 21
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
