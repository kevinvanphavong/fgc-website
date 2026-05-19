/**
 * Schema.org LocalBusiness — injection JSON-LD pour SEO local (PR9 finitions).
 * Server component, rendu directement dans le HTML statique.
 *
 * Les horaires sont alignés sur la grille publique du site (cf. Schedule.tsx).
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://familygamescenter.fr';
const PHONE = process.env.NEXT_PUBLIC_PHONE ?? '02 54 74 85 21';

export default function LocalBusinessJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EntertainmentBusiness',
    '@id': SITE_URL,
    name: 'Family Games Center',
    alternateName: 'Bowling de Blois',
    description:
      "Centre de loisirs : bowling, billard, jeux d'arcade, réalité virtuelle, karaoké, fléchettes, blind test, bar & snack à Blois.",
    url: SITE_URL,
    telephone: PHONE.replace(/\s+/g, ''),
    address: {
      '@type': 'PostalAddress',
      streetAddress: '25 rue Robert Nau',
      addressLocality: 'Blois',
      postalCode: '41000',
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 47.5905,
      longitude: 1.3354,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        opens: '14:00',
        closes: '23:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Friday', 'Saturday'],
        opens: '14:00',
        closes: '02:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '14:00',
        closes: '22:00',
      },
    ],
    priceRange: '€€',
    sameAs: [
      'https://www.facebook.com/BowlingWorldBlois',
      'https://www.instagram.com/bowling.blois',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
