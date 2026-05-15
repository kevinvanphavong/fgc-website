'use client';

import Breadcrumb from '@/components/ui/Breadcrumb';
import Schedule from '@/components/sections/Schedule';

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

const SUBJECTS = [
  'Question générale',
  'Réservation anniversaire',
  'Tarifs groupes',
  'Événement entreprise',
  'Objet trouvé / perdu',
  'Autre',
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

          <div className="mx-auto max-w-3xl rounded-fgc-lg border border-fgc-yellow/20 bg-fgc-card p-8 md:p-10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(
                  'Merci pour votre message ! Nous revenons vers vous au plus vite.'
                );
              }}
              className="flex flex-col gap-5"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Votre nom"
                  type="text"
                  required
                  placeholder="Prénom Nom"
                />
                <FormField
                  label="Email"
                  type="email"
                  required
                  placeholder="vous@example.fr"
                />
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  label="Téléphone (facultatif)"
                  type="tel"
                  placeholder="06 …"
                />
                <div className="flex flex-col gap-2">
                  <label className="font-display text-[0.82rem] uppercase tracking-wider text-fgc-cream/70">
                    Sujet
                  </label>
                  <select className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50">
                    {SUBJECTS.map((s) => (
                      <option key={s} className="bg-fgc-bg text-fgc-cream">
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-display text-[0.82rem] uppercase tracking-wider text-fgc-cream/70">
                  Message
                </label>
                <textarea
                  className="min-h-[140px] resize-y rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50"
                  placeholder="Votre message…"
                  required
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2.5 rounded-full border-2 border-fgc-yellow-shadow bg-fgc-yellow px-6 py-3.5 font-display text-[1rem] uppercase leading-none text-fgc-purple shadow-fgc-btn-yellow transition-transform hover:-translate-y-0.5 active:translate-y-px"
              >
                Envoyer
              </button>
            </form>
          </div>
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

function FormField({
  label,
  ...props
}: {
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label className="font-display text-[0.82rem] uppercase tracking-wider text-fgc-cream/70">
        {label}
      </label>
      <input
        {...props}
        className="rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-fgc-cream outline-none transition-colors focus:border-fgc-yellow/50"
      />
    </div>
  );
}
