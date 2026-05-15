import Image from 'next/image';
import Button from '@/components/ui/Button';

export default function Experience() {
  return (
    <section className="section">
      <div className="wrap grid items-center gap-[50px] lg:grid-cols-[1.2fr_1fr]">
        {/* Text */}
        <div>
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            L&apos;expérience FGC
          </span>
          <h2 className="section-title mb-6">
            Bien plus qu&apos;un{' '}
            <span className="accent">simple bowling.</span>
          </h2>
          <p className="mb-4 text-[1.05rem] leading-relaxed text-fgc-cream/85">
            Pensé comme un véritable parc de loisirs urbain, le Family Games
            Center réunit sous un même toit toutes les expériences fun de votre
            soirée idéale. Bowling, jeux, bar à cocktails, snacking maison,
            événements privés — tout est conçu pour que vous n&apos;ayez plus
            jamais à choisir.
          </p>
          <p className="mb-8 text-[1.05rem] leading-relaxed text-fgc-cream/85">
            Que vous veniez en famille, entre amis, entre collègues, ou pour
            fêter un grand moment, notre équipe est là pour transformer votre
            venue en souvenir inoubliable.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button href="/entreprises" variant="pink">
              Pour les entreprises
            </Button>
            <Button href="/formules" variant="ghost">
              Voir les formules
            </Button>
          </div>
        </div>

        {/* Visual */}
        <div className="relative overflow-hidden rounded-fgc-hero border-2 border-fgc-yellow/20 shadow-fgc-soft">
          <Image
            src="/assets/affiche-trio-jeux.png"
            alt="Bowling, arcade et réalité virtuelle au Family Games Center"
            width={600}
            height={750}
            className="h-auto w-full object-cover"
            style={{ aspectRatio: '4/5' }}
          />
        </div>
      </div>
    </section>
  );
}
