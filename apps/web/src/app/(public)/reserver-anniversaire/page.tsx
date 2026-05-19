import type { Metadata } from 'next';
import TunnelAnniversaire from '@/components/sections/tunnel-anniv/TunnelAnniversaire';
import type { AnnivFormule } from '@/components/sections/tunnel-anniv/types';

export const metadata: Metadata = {
  title: 'Réserver un anniversaire enfant',
  description:
    "Réservez l'anniversaire de votre enfant au Family Games Center à Blois en 5 étapes : "
    + 'choix de la formule, date, détails enfant, coordonnées. Pas de paiement en ligne — '
    + "notre équipe vous rappelle sous 24h pour confirmer la date et l'acompte.",
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

const FALLBACK_FORMULES: AnnivFormule[] = [
  {
    id: 1,
    key: 'newbowler',
    icon: '🎳',
    name: 'New Bowler',
    age: '6 à 8 ans',
    price: '18,50€/enfant',
    unitPriceCents: 1850,
    minKids: 6,
    duration: '2h',
    tagline: 'La première fête de bowling — taillée pour les plus jeunes',
    features: [
      '1 partie de bowling + chaussures',
      '1 jeton arcade par enfant',
      "Goûter d'anniversaire complet",
      'Service VIP anniversaire inclus',
    ],
    featured: false,
    position: 0,
  },
  {
    id: 2,
    key: 'superbowler',
    icon: '🏆',
    name: 'Super Bowler',
    age: '8 à 10 ans',
    price: '22,50€/enfant',
    unitPriceCents: 2250,
    minKids: 6,
    duration: '2h30',
    tagline: 'La formule la plus demandée — plus de jeu, plus de fun',
    features: [
      '2 parties de bowling + chaussures',
      '2 jetons arcade par enfant',
      "Goûter d'anniversaire complet",
      'Service VIP anniversaire inclus',
    ],
    featured: true,
    position: 1,
  },
  {
    id: 3,
    key: 'probowler',
    icon: '💎',
    name: 'Pro Bowler',
    age: '10 à 12 ans',
    price: '26,50€/enfant',
    unitPriceCents: 2650,
    minKids: 6,
    duration: '3h',
    tagline: "L'expérience ultime — bowling, arcade et VR",
    features: [
      '2 parties de bowling + chaussures',
      '2 jetons arcade par enfant',
      '1 session de réalité virtuelle',
      "Goûter d'anniversaire complet",
      'Service VIP anniversaire inclus',
    ],
    featured: false,
    position: 2,
  },
];

async function fetchFormules(): Promise<AnnivFormule[]> {
  try {
    const res = await fetch(`${API_BASE}/formules/anniversaires`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.warn(`[tunnel-anniv] /formules/anniversaires → ${res.status}, fallback servi.`);
      return FALLBACK_FORMULES;
    }
    return (await res.json()) as AnnivFormule[];
  } catch (err) {
    console.warn(`[tunnel-anniv] fetch error: ${(err as Error).message}, fallback servi.`);
    return FALLBACK_FORMULES;
  }
}

export default async function ReserverAnniversairePage({
  searchParams,
}: {
  searchParams: { formule?: string };
}) {
  const formules = await fetchFormules();
  const prefillFormule = typeof searchParams.formule === 'string' ? searchParams.formule : null;

  return <TunnelAnniversaire formules={formules} prefillFormule={prefillFormule} />;
}
