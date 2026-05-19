import type { Metadata } from 'next';
import { Lilita_One, Fredoka } from 'next/font/google';
import './globals.css';

const lilita = Lilita_One({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

const fredoka = Fredoka({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

// Fallback OG image — affiche carte membre, visuel le plus "marque-mère"
// disponible aujourd'hui. PR9 finitions : à remplacer par un visuel og dédié
// (1200×630) quand le studio le produira.
const OG_IMAGE = '/assets/affiche-carte-membre.png';

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  title: {
    default: 'Family Games Center · Bowling, billard et arcade à Blois',
    template: '%s · Family Games Center',
  },
  description:
    "Bowling, billard, arcade, réalité virtuelle, karaoké et anniversaires enfants à Blois. Le plus grand espace de loisirs du Loir-et-Cher, 7J/7.",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Family Games Center',
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Family Games Center — Bowling, billard et arcade à Blois',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Family Games Center · Bowling, billard et arcade à Blois',
    description:
      'Bowling, billard, arcade, VR et anniversaires enfants à Blois. 7J/7.',
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${lilita.variable} ${fredoka.variable}`}>
      <body>{children}</body>
    </html>
  );
}
