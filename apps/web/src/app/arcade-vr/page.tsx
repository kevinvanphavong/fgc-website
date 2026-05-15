import type { Metadata } from 'next';
import Image from 'next/image';
import Breadcrumb from '@/components/ui/Breadcrumb';
import FeatureList from '@/components/ui/FeatureList';
import Button from '@/components/ui/Button';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';

const arcade = ACTIVITY_PAGES.arcade;
const vr = ACTIVITY_PAGES['realite-virtuelle'];

export const metadata: Metadata = {
  title: 'Arcade & Réalité Virtuelle',
  description:
    '150 m² d\'arcade nouvelle génération et espace VR immersif au Family Games Center de Blois. Flippers, simulateurs, bornes à lots, escape games VR et jeux multijoueur.',
};

export default function ArcadeVRPage() {
  return (
    <>
      {/* Hero commun */}
      <section className="relative overflow-hidden py-[70px] max-md:py-10">
        <div className="wrap">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Activités' },
              { label: 'Arcade & VR' },
            ]}
          />
          <div className="mx-auto max-w-[820px] text-center">
            <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              Deux univers, un même espace
            </span>
            <h1 className="hero-title mb-6">
              Arcade <span className="pop">&amp; VR.</span>
            </h1>
            <p className="mx-auto max-w-fgc-lead text-[1.05rem] leading-relaxed text-fgc-cream/85">
              150 m² de jeux d&apos;arcade nouvelle génération et un espace
              réalité virtuelle immersif. De 5 à 99 ans, du flipper culte à
              l&apos;escape game VR — il y en a pour tous les goûts.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="#arcade" variant="primary">
                Arcade
              </Button>
              <Button href="#vr" variant="pink">
                Réalité Virtuelle
              </Button>
              <Button href="/tarifs" variant="ghost">
                Voir les tarifs
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section Arcade */}
      <section className="section" id="arcade" style={{ paddingTop: 30 }}>
        <div className="wrap grid items-start gap-[50px] lg:grid-cols-[1.2fr_1fr]">
          <div>
            <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              {arcade.eyebrow}
            </span>
            <h2 className="section-title mb-6">
              Jeux <span className="accent">d&apos;arcade.</span>
            </h2>
            <p className="mb-8 max-w-fgc-sub text-[1.05rem] leading-relaxed text-fgc-cream/85">
              {arcade.description}
            </p>
            <FeatureList features={arcade.features} />
            <div className="flex flex-wrap gap-4">
              {arcade.ctas.map((cta) => (
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

            {/* Tarif inline */}
            <div className="mt-8 flex items-center gap-4 rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card px-6 py-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-fgc-yellow to-fgc-yellow-dark text-[1.4rem] shadow-fgc-btn-yellow">
                🕹️
              </div>
              <div>
                <span className="font-display text-[1.1rem] text-fgc-yellow">
                  À partir de 2€ / jeton
                </span>
                <p className="mt-0.5 text-[0.85rem] text-fgc-cream/60">
                  Flippers, simulateurs, air hockey, basket, bornes à lots.
                </p>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-fgc-hero border-2 border-fgc-yellow/20 shadow-fgc-soft">
            <Image
              src={arcade.image}
              alt={arcade.imageAlt}
              width={600}
              height={750}
              className="h-auto w-full object-cover"
              style={{ aspectRatio: '4/5' }}
            />
          </div>
        </div>
      </section>

      {/* Section VR */}
      <section className="section" id="vr">
        <div className="wrap grid items-start gap-[50px] lg:grid-cols-[1fr_1.2fr]">
          <div className="relative overflow-hidden rounded-fgc-hero border-2 border-fgc-pink-hot/30 shadow-fgc-soft max-lg:order-2">
            <Image
              src={vr.image}
              alt={vr.imageAlt}
              width={600}
              height={750}
              className="h-auto w-full object-cover"
              style={{ aspectRatio: '4/5' }}
            />
            {/* Pink glow overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-fgc-pink-hot/20 to-transparent" />
          </div>

          <div className="max-lg:order-1">
            <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              {vr.eyebrow}
            </span>
            <h2 className="section-title mb-6">
              Réalité <span className="accent">virtuelle.</span>
            </h2>
            <p className="mb-8 max-w-fgc-sub text-[1.05rem] leading-relaxed text-fgc-cream/85">
              {vr.description}
            </p>
            <FeatureList features={vr.features} />
            <div className="flex flex-wrap gap-4">
              {vr.ctas.map((cta) => (
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

            {/* Tarif inline */}
            <div className="mt-8 flex items-center gap-4 rounded-fgc-lg border border-fgc-pink-hot/20 bg-fgc-card px-6 py-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-fgc-pink-hot to-fgc-pink text-[1.4rem] text-white shadow-[0_5px_0_#8e0d3d]">
                🥽
              </div>
              <div>
                <span className="font-display text-[1.1rem] text-fgc-yellow">
                  À partir de 4€ / session
                </span>
                <p className="mt-0.5 text-[0.85rem] text-fgc-cream/60">
                  Salle VR dédiée de 50 m², catalogue mis à jour régulièrement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA bottom */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="mx-auto max-w-3xl rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-10 text-center">
            <h2 className="section-title mb-4">
              Envie de <span className="accent">tout tester ?</span>
            </h2>
            <p className="mx-auto mb-8 max-w-fgc-lead text-[1.05rem] leading-relaxed text-fgc-cream/80">
              Nos Pass multi-activités combinent bowling, arcade, VR et plus
              encore — avec jusqu&apos;à 30% d&apos;économie par rapport au
              tarif à la carte.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button href="/formules#pass" variant="primary">
                Voir les Pass
              </Button>
              <Button href="/formules#anniversaires" variant="pink">
                Formules anniversaires
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
