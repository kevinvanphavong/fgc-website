import Image from 'next/image';
import Button from '@/components/ui/Button';
import { RESERVATION_URL } from '@/lib/nav';

const STATS = [
  { num: '20', label: 'Pistes bowling' },
  { num: '15', label: 'Tables billard' },
  { num: '150m²', label: 'Arcade' },
  { num: '7J/7', label: 'Ouvert' },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden py-[70px] pb-[100px] max-md:py-10 max-md:pb-[60px]">
      <div className="wrap grid items-center gap-[60px] lg:grid-cols-[1.05fr_1fr] max-lg:gap-10">
        {/* Text column */}
        <div>
          {/* Eyebrow */}
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-fgc-yellow/40 bg-fgc-yellow/15 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-fgc-pink-hot animate-fgc-pulse" aria-hidden="true" />
            <span className="font-display text-[0.85rem] uppercase tracking-fgc-cap text-fgc-cream">
              Nouveau Printemps / Été 2026
            </span>
          </div>

          {/* Title */}
          <h1 className="hero-title mb-6">
            Le terrain de jeu{' '}
            <span className="pop">n°1</span> à Blois.
          </h1>

          {/* Subtitle */}
          <p className="mb-8 max-w-fgc-sub text-[1.05rem] leading-relaxed text-fgc-cream/85">
            20 pistes de bowling, 15 tables de billard, 150 m² d&apos;arcade,
            réalité virtuelle, karaoké box, blind test, fléchettes, bar à
            cocktails… Tout est réuni sous un seul toit pour vos meilleures
            soirées.
          </p>

          {/* CTAs */}
          <div className="mb-10 flex flex-wrap gap-4">
            <Button
              href={RESERVATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              variant="primary"
            >
              Réserver une partie
            </Button>
            <Button href="/tarifs" variant="ghost">
              Voir les tarifs
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display text-[1.8rem] text-fgc-yellow">
                  {stat.num}
                </div>
                <div className="text-[0.85rem] text-fgc-cream/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual column */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-fgc-hero border-2 border-fgc-yellow/20 shadow-fgc-soft">
            <Image
              src="/assets/affiche-anniversaire-hero.png"
              alt="Family Games Center — Bowling, arcade, VR et plus"
              width={600}
              height={750}
              className="h-auto w-full object-cover"
              style={{ aspectRatio: '4/5' }}
              priority
            />
            {/* Magenta glow overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-30"
              style={{
                background:
                  'radial-gradient(circle at 70% 30%, rgba(255,0,200,0.4), transparent 60%)',
              }}
              aria-hidden="true"
            />
          </div>

          {/* Float badge — top right */}
          <div className="absolute -right-4 -top-4 z-10 rounded-fgc-card-soft border border-fgc-yellow/30 bg-fgc-bg-deeper/90 px-4 py-3 shadow-fgc-soft backdrop-blur-sm max-md:hidden">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">🎳</span>
              <div>
                <div className="font-display text-[0.85rem] uppercase text-fgc-cream">
                  Bowling à volonté
                </div>
                <div className="font-display text-[1rem] text-fgc-yellow">
                  20€{' '}
                  <span className="text-[0.75rem] text-fgc-cream/60">
                    Lun & Mar
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Float badge — bottom left */}
          <div className="absolute -bottom-4 -left-4 z-10 rounded-fgc-card-soft border border-fgc-yellow/30 bg-fgc-bg-deeper/90 px-4 py-3 shadow-fgc-soft backdrop-blur-sm max-md:hidden">
            <div className="flex items-center gap-2">
              <span aria-hidden="true">🎉</span>
              <div>
                <div className="font-display text-[0.85rem] uppercase text-fgc-cream">
                  Anniversaires
                </div>
                <div className="text-[0.78rem] text-fgc-cream/70">
                  dès 6 ans
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
