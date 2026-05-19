'use client';

import Breadcrumb from '@/components/ui/Breadcrumb';
import Schedule from '@/components/sections/Schedule';
import ContactForm from '@/components/sections/contact/ContactForm';

const CONTACT_CARDS = [
  {
    icon: '📍',
    title: 'Adresse',
    lines: ['25 rue Robert Nau', '41000 Blois', 'Parking gratuit sur place'],
    linkLabel: 'Itinéraire',
    href: 'https://maps.google.com/?q=25+rue+Robert+Nau+41000+Blois',
    external: true,
  },
  {
    icon: '📞',
    title: 'Téléphone',
    lines: ['Accueil & réservations'],
    highlight: '02 54 74 85 21',
    linkLabel: 'Appeler',
    href: 'tel:0254748521',
  },
  {
    icon: '✉️',
    title: 'Email',
    lines: ['Pour toute question, devis ou réservation de groupe.'],
    linkLabel: 'contact@familygamescenter.fr',
    href: 'mailto:contact@familygamescenter.fr',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-[60px] pb-[30px]">
        <div className="wrap mx-auto max-w-[820px] text-center">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Contact & Infos' },
            ]}
          />
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Nous écrire · Venir
          </span>
          <h1 className="hero-title">
            Contact <span className="pop">&amp; Infos.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
            À 5 min du centre-ville de Blois. Parking gratuit. Accessible
            PMR. On vous attend !
          </p>
        </div>
      </section>

      {/* Contact cards */}
      <section className="section" style={{ paddingTop: 30, paddingBottom: 30 }}>
        <div className="wrap">
          <div className="grid gap-6 lg:grid-cols-3">
            {CONTACT_CARDS.map((card) => (
              <article
                key={card.title}
                className="group flex flex-col gap-4 rounded-fgc-lg border border-fgc-yellow/[0.18] bg-fgc-card p-7 transition-all hover:-translate-y-1 hover:border-fgc-yellow/40"
              >
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-fgc-yellow to-fgc-yellow-dark text-[1.8rem] shadow-fgc-btn-yellow">
                  {card.icon}
                </div>
                <h3 className="font-display text-[1.3rem] uppercase text-fgc-cream">
                  {card.title}
                </h3>
                <div className="text-[0.95rem] leading-relaxed text-fgc-cream/75">
                  {card.lines.map((line) => (
                    <span key={line}>
                      {line}
                      <br />
                    </span>
                  ))}
                  {card.highlight && (
                    <strong className="text-[1.2rem] text-fgc-yellow">
                      {card.highlight}
                    </strong>
                  )}
                </div>
                <a
                  href={card.href}
                  className="mt-auto font-display text-[0.85rem] uppercase tracking-wider text-fgc-yellow transition-colors hover:text-fgc-pink-hot"
                  {...(card.external
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                >
                  {card.linkLabel} →
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Horaires (reuse Schedule component) */}
      <Schedule />

      {/* Holiday notice */}
      <div className="wrap -mt-8 mb-8">
        <div className="flex gap-3 rounded-[18px] border border-dashed border-fgc-yellow/40 bg-fgc-yellow/10 p-5">
          <span className="text-[1.4rem]">⚠️</span>
          <div>
            <div className="mb-1 font-display uppercase text-fgc-yellow">
              Ouvertures exceptionnelles
            </div>
            <p className="text-[0.95rem] text-fgc-cream/85">
              Jours fériés : ouvertures décalées (généralement 14h–23h).
              Consultez nos réseaux sociaux ou appelez-nous pour vérifier.
            </p>
          </div>
        </div>
      </div>

      {/* Contact form */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Une question ?
          </span>
          <h2 className="section-title">
            Écrivez-nous <span className="accent">directement.</span>
          </h2>
          <p className="mx-auto mb-10 mt-4 max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
            Nous répondons généralement sous 24h ouvrées. Pour les
            réservations, privilégiez le téléphone ou notre plateforme en
            ligne.
          </p>

          <ContactForm />
        </div>
      </section>

      {/* Map */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="wrap">
          <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
            Nous trouver
          </span>
          <h2 className="section-title mb-8">
            Sur <span className="accent">la carte.</span>
          </h2>
          <div className="overflow-hidden rounded-[24px] border border-fgc-yellow/30 shadow-fgc-soft">
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=1.31%2C47.575%2C1.36%2C47.605&layer=mapnik&marker=47.5905%2C1.3354"
              className="h-[420px] w-full border-0"
              style={{ filter: 'hue-rotate(220deg) invert(0.9)' }}
              loading="lazy"
              title="Carte Family Games Center"
            />
          </div>
        </div>
      </section>
    </>
  );
}

