'use client';

import Image from 'next/image';
import Breadcrumb from '@/components/ui/Breadcrumb';
import Button from '@/components/ui/Button';
import DevisB2BForm from '@/components/sections/entreprises/DevisB2BForm';

const FORMATS = [
  {
    icon: '🤝',
    title: 'Team Building',
    description:
      "Tournoi bowling inter-équipes, blind test compétitif, escape game VR coopératif. Animations pensées pour souder les équipes. À partir de 10 personnes.",
  },
  {
    icon: '🎄',
    title: 'Arbre de Noël',
    description:
      "Goûter pour les enfants, espace arcade en accès libre, photo Père Noël, distribution de cadeaux. Animation et catering inclus.",
  },
  {
    icon: '💼',
    title: 'Séminaire',
    description:
      "Salle de réunion adjacente possible, pause-déjeuner sur place et activités décompression en fin de journée pour ressouder l'équipe.",
  },
  {
    icon: '🥂',
    title: 'Soirée client',
    description:
      "Privatisation d'un espace bar, cocktails dînatoires, animation karaoké ou blind test. L'occasion de marquer les esprits autrement.",
  },
];

export default function EntreprisesPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden py-[70px] max-md:py-10">
        <div className="wrap grid items-start gap-[50px] lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Breadcrumb
              items={[
                { label: 'Accueil', href: '/' },
                { label: 'Entreprises' },
              ]}
            />
            <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
              Pour les pros
            </span>
            <h1 className="hero-title mb-6" style={{ fontSize: 'clamp(2.6rem,5vw,4.4rem)' }}>
              Vos événements{' '}
              <span className="pop">d&apos;entreprise.</span>
            </h1>
            <p className="mb-8 max-w-fgc-sub text-[1.05rem] leading-relaxed text-fgc-cream/85">
              Team building, séminaire, arbre de Noël, after-work
              d&apos;équipe, soirée client… On adapte le centre à votre
              événement. Privatisation totale ou partielle, formules sur
              mesure, devis sous 48h.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button href="#devis" variant="primary">
                Demander un devis
              </Button>
              <Button href="tel:0254748521" variant="ghost">
                02 54 74 85 21
              </Button>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-fgc-hero border-2 border-fgc-yellow/20 shadow-fgc-soft">
            <Image
              src="/assets/affiche-afterwork.png"
              alt="Entreprises"
              width={600}
              height={750}
              className="h-auto w-full object-cover"
              style={{ aspectRatio: '4/5' }}
              priority
            />
          </div>
        </div>
      </section>

      {/* Formats */}
      <section className="section">
        <div className="wrap">
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Nos formats entreprises
          </span>
          <h2 className="section-title mb-10">
            4 formats <span className="accent">éprouvés.</span>
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            {FORMATS.map((f) => (
              <article
                key={f.title}
                className="group flex flex-col gap-4 rounded-fgc-lg border border-fgc-yellow/[0.18] bg-fgc-card p-7 transition-all hover:-translate-y-1 hover:border-fgc-yellow/40"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-fgc-yellow to-fgc-yellow-dark text-[1.8rem] shadow-fgc-btn-yellow">
                  {f.icon}
                </div>
                <h3 className="font-display text-[1.3rem] uppercase text-fgc-cream">
                  {f.title}
                </h3>
                <p className="text-[0.95rem] leading-relaxed text-fgc-cream/75">
                  {f.description}
                </p>
                <a
                  href="#devis"
                  className="mt-auto font-display text-[0.85rem] uppercase tracking-wider text-fgc-yellow transition-colors hover:text-fgc-pink-hot"
                >
                  Demander un devis →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="section" id="devis" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Devis personnalisé
          </span>
          <h2 className="section-title">
            Parlons de <span className="accent">votre projet.</span>
          </h2>
          <p className="mx-auto mb-10 mt-4 max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
            Remplissez le formulaire et notre équipe événementielle vous
            recontacte sous 48h avec une proposition adaptée.
          </p>

          <DevisB2BForm />
        </div>
      </section>
    </>
  );
}
