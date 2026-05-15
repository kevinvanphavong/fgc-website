import type { Metadata } from 'next';
import { Lilita_One, Fredoka } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  title: {
    default: 'Family Games Center · Bowling de Blois',
    template: '%s · Family Games Center',
  },
  description:
    "Le plus grand espace de loisirs à Blois : bowling, billard, jeux d'arcade, réalité virtuelle, karaoké, blind test, bar & snack. 7J/7.",
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Family Games Center',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${lilita.variable} ${fredoka.variable}`}>
      <body>
        <div className="bg-ambient" aria-hidden="true" />
        <Header />
        <main className="relative z-[1]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
