import Image from 'next/image';
import Link from 'next/link';
import SectionHeader from '@/components/ui/SectionHeader';
import { OFFERS } from '@/lib/offers';
import { cn } from '@/lib/cn';

const BADGE_STYLES = {
  yellow: 'bg-fgc-yellow text-fgc-purple',
  pink: 'bg-fgc-pink-hot text-white',
  cream: 'bg-fgc-cream-warm text-fgc-purple border border-fgc-yellow-dark',
} as const;

export default function Offers() {
  return (
    <section className="section">
      <div className="wrap">
        <SectionHeader
          eyebrow="Nos offres du moment"
          title={
            <>
              Les bons plans <span className="accent">à ne pas rater.</span>
            </>
          }
          lead="Du lundi à l'afterwork, des formules pensées pour chaque jour de la semaine et chaque moment de l'année."
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {OFFERS.map((offer) => (
            <Link
              key={offer.key}
              href={offer.href}
              className="group relative overflow-hidden rounded-fgc-offer transition-all duration-200 hover:-translate-y-1.5 hover:scale-[1.02]"
              style={{ aspectRatio: '4/5' }}
            >
              <Image
                src={offer.image}
                alt={offer.title}
                fill
                className="object-cover"
                sizes="(max-width: 720px) 100vw, (max-width: 980px) 50vw, 25vw"
              />

              {/* Dark overlay gradient bottom */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
                aria-hidden="true"
              />

              {/* Badge pill */}
              <div className="absolute left-4 top-4">
                <span
                  className={cn(
                    'inline-block rounded-full px-4 py-1.5 font-display text-[0.8rem] uppercase',
                    BADGE_STYLES[offer.badgeVariant]
                  )}
                >
                  {offer.badge}
                </span>
              </div>

              {/* Title */}
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="font-display text-[1.1rem] text-white">
                  {offer.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
