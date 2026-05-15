import Image from 'next/image';
import Breadcrumb from '@/components/ui/Breadcrumb';
import FeatureList from '@/components/ui/FeatureList';
import Button from '@/components/ui/Button';
import type { ActivityPage } from '@/lib/activity-pages';
import { cn } from '@/lib/cn';

type PageHeroProps = {
  page: ActivityPage;
};

export default function PageHero({ page }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden py-[70px] max-md:py-10">
      <div className="wrap grid items-start gap-[50px] lg:grid-cols-[1.2fr_1fr]">
        {/* Text column */}
        <div>
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Activités' },
              { label: page.name },
            ]}
          />

          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            {page.eyebrow}
          </span>

          <h1 className="hero-title mb-6">{page.title}</h1>

          <p className="mb-8 max-w-fgc-sub text-[1.05rem] leading-relaxed text-fgc-cream/85">
            {page.description}
          </p>

          <FeatureList features={page.features} />

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            {page.ctas.map((cta) => (
              <Button
                key={cta.label}
                href={cta.href}
                variant={cta.variant}
                {...(cta.external
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
              >
                {cta.label}
              </Button>
            ))}
          </div>

          {/* Badge CTA */}
          {page.badgeCta && (
            <div className="mt-8">
              <div className="inline-flex items-center gap-3 rounded-full bg-fgc-purple-cta px-5 py-3 font-display text-[0.9rem] uppercase text-fgc-yellow">
                <span className="text-fgc-cream/40" aria-hidden="true">
                  ≈{'{'}{' '}
                </span>
                {page.badgeCta}
                <span className="text-fgc-cream/40" aria-hidden="true">
                  {' '}{'}'} ≈
                </span>
              </div>
              {page.badgeCtaSub && (
                <p className="mt-2 text-[0.85rem] text-fgc-cream/60">
                  {page.badgeCtaSub}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Visual column */}
        <div className="relative overflow-hidden rounded-fgc-hero border-2 border-fgc-yellow/20 shadow-fgc-soft">
          <Image
            src={page.image}
            alt={page.imageAlt}
            width={600}
            height={750}
            className="h-auto w-full object-cover"
            style={{ aspectRatio: '4/5' }}
            priority
          />
        </div>
      </div>
    </section>
  );
}

export function PricingSection({ page }: { page: ActivityPage }) {
  if (!page.priceCards) return null;

  return (
    <section className="section">
      <div className="wrap">
        {page.pricingEyebrow && (
          <div className="mb-12 text-center">
            <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              {page.pricingEyebrow}
            </span>
            {page.pricingTitle && (
              <h2 className="section-title">{page.pricingTitle}</h2>
            )}
            {page.pricingLead && (
              <p className="mx-auto mt-4 max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
                {page.pricingLead}
              </p>
            )}
          </div>
        )}

        <div className="mx-auto grid max-w-4xl gap-[22px] md:grid-cols-3">
          {page.priceCards.map((card) => (
            <div
              key={card.tier}
              className={cn(
                'relative rounded-fgc-lg border p-7 text-center',
                'bg-fgc-card',
                card.featured
                  ? 'border-fgc-yellow shadow-fgc-featured'
                  : 'border-fgc-yellow/20'
              )}
            >
              {card.featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-fgc-pink px-4 py-1 font-display text-[0.75rem] uppercase text-white">
                  ★ Le plus populaire
                </div>
              )}

              <h3 className="mb-2 font-display text-[1rem] uppercase text-fgc-cream">
                {card.tier}
              </h3>

              <div className="mb-1 font-display text-[3.4rem] leading-none text-fgc-cream">
                {card.price}
              </div>
              <div className="mb-6 text-[0.85rem] text-fgc-cream/60">
                {card.unit}
              </div>

              <ul className="mb-6 space-y-2.5 text-left">
                {card.features.map((feat) => (
                  <li
                    key={feat}
                    className="flex items-start gap-2 text-[0.9rem] text-fgc-cream/80"
                  >
                    <span className="mt-0.5 text-fgc-yellow" aria-hidden="true">
                      ✓
                    </span>
                    {feat}
                  </li>
                ))}
              </ul>

              <Button
                href="/tarifs"
                variant={card.featured ? 'primary' : 'ghost'}
                className="w-full justify-center"
              >
                {card.ctaLabel}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InlinePriceCard({ page }: { page: ActivityPage }) {
  if (!page.inlinePrice) return null;

  return (
    <section className="section">
      <div className="wrap">
        <div className="mx-auto max-w-lg rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-10 text-center">
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Tarif unique
          </span>
          <div className="mb-3 font-display text-[2.4rem] text-fgc-yellow">
            {page.inlinePrice.price}
          </div>
          <p className="text-[0.95rem] text-fgc-cream/70">
            {page.inlinePrice.description}
          </p>
        </div>
      </div>
    </section>
  );
}
