import type { Metadata } from 'next';
import Image from 'next/image';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import { MENU_SECTIONS } from '@/lib/menu';

export const metadata: Metadata = {
  title: 'Bar & Snack',
  description:
    'Bar à cocktails, smoothies, milkshakes, pizzas, snacks sucrés & salés au Family Games Center. Commande sur tablette ou QR code.',
};

export default function BarSnackPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-[70px] max-md:py-10">
        <div className="wrap grid items-start gap-[50px] lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Breadcrumb
              items={[
                { label: 'Accueil', href: '/' },
                { label: 'Bar & Snack' },
              ]}
            />
            <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              À table
            </span>
            <h1 className="hero-title mb-6" style={{ fontSize: 'clamp(2.6rem,5vw,4.4rem)' }}>
              Bar <span className="pop">&amp; Snack.</span>
            </h1>
            <p className="mb-8 max-w-fgc-sub text-[1.05rem] leading-relaxed text-fgc-cream/85">
              Pour recharger les batteries entre deux strikes : un bar à
              cocktails maison, des snacks salés généreux, des smoothies frais
              et la nouveauté{' '}
              <strong>Smoothies &amp; Milkshakes</strong> printemps/été 2026.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="#carte" variant="primary">
                Voir la carte
              </Button>
              <Button href="#cocktails" variant="ghost">
                Cocktails
              </Button>
            </div>
            <p className="mt-[18px] text-[0.9rem] text-fgc-cream/70">
              📱 Commandez directement depuis votre piste via QR code ou
              tablette.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-fgc-hero border-2 border-fgc-yellow/20 shadow-fgc-soft">
            <Image
              src="/assets/affiche-cocktails-snacks.png"
              alt="Bar & Snack"
              width={600}
              height={750}
              className="h-auto w-full object-cover"
              style={{ aspectRatio: '4/5' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Menu sections */}
      {MENU_SECTIONS.map((section) => (
        <section
          key={section.key}
          className="section"
          id={section.key === 'cocktails' ? 'carte' : undefined}
          style={{ paddingTop: 30 }}
        >
          <div className="wrap">
            <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              {section.eyebrow}
            </span>
            <h2
              className="section-title"
              id={section.key === 'cocktails' ? 'cocktails' : undefined}
            >
              {section.title}
              <span className="accent">{section.titleAccent}</span>
            </h2>
            {section.lead && (
              <p className="mx-auto mt-4 max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
                {section.lead}
              </p>
            )}

            <div className="mt-8 grid gap-10 lg:grid-cols-2">
              {section.columns.map((col) => (
                <div key={col.key}>
                  <h3 className="mb-4 font-display text-[1.1rem] uppercase tracking-wider text-fgc-cream">
                    {col.title}
                  </h3>
                  <div className="flex flex-col gap-3">
                    {col.items.map((item) => (
                      <div
                        key={item.name}
                        className="flex items-start justify-between gap-4 border-b border-dashed border-white/[0.08] pb-3"
                      >
                        <div>
                          <div className="font-display text-[1rem] uppercase text-fgc-cream">
                            {item.name}
                          </div>
                          <div className="mt-0.5 text-[0.85rem] text-fgc-cream/60">
                            {item.description}
                          </div>
                        </div>
                        <span className="shrink-0 font-display text-[1.05rem] text-fgc-yellow">
                          {item.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Badge CTA */}
      <div className="pb-[60px] text-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-fgc-purple-cta px-7 py-4 font-display text-[1.05rem] uppercase text-fgc-yellow">
          Commander sur notre carte · QR code et tablettes
        </div>
      </div>
    </>
  );
}
