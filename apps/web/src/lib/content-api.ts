import type { TarifCard } from './tarifs';
import type { HebdoCard, PassCard, ResaCard, AnnivCard } from './formules';
import type { DaySchedule } from './schedule';
import type { MenuSection } from './menu';
import type { Offer } from './offers';
import type { ActivityPage } from './activity-pages';

import { TARIFS_ACTIVITES, TARIFS_BAR } from './tarifs';
import { HEBDO_CARDS, PASS_CARDS, RESA_CARDS, ANNIV_CARDS, VIP_FEATURES } from './formules';
import { SCHEDULE } from './schedule';
import { MENU_SECTIONS } from './menu';
import { OFFERS } from './offers';
import { ACTIVITY_PAGES } from './activity-pages';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000/api';
const REVALIDATE = 300;

async function apiFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export async function fetchTarifs(group: 'activites' | 'bar'): Promise<TarifCard[]> {
  const fallback = group === 'activites' ? TARIFS_ACTIVITES : TARIFS_BAR;
  const all = await apiFetch<TarifCard[]>(`/tarif_cards?cardGroup=${group}`, fallback);
  return all;
}

export async function fetchSchedule(): Promise<DaySchedule[]> {
  return apiFetch('/horaires', SCHEDULE);
}

export async function fetchHebdoCards(): Promise<HebdoCard[]> {
  return apiFetch('/formules/hebdo', HEBDO_CARDS);
}

export async function fetchPassCards(): Promise<PassCard[]> {
  return apiFetch('/formules/pass', PASS_CARDS);
}

export async function fetchResaCards(): Promise<ResaCard[]> {
  return apiFetch('/formules/reservations', RESA_CARDS);
}

export async function fetchAnnivCards(): Promise<AnnivCard[]> {
  return apiFetch('/formules/anniversaires', ANNIV_CARDS);
}

export async function fetchVipFeatures(): Promise<{ icon: string; label: string }[]> {
  return apiFetch('/formules/vip-features', VIP_FEATURES);
}

export async function fetchMenuSections(): Promise<MenuSection[]> {
  return apiFetch('/menu', MENU_SECTIONS);
}

export async function fetchOffers(): Promise<Offer[]> {
  return apiFetch('/offres', OFFERS);
}

export async function fetchActivityPage(slug: string): Promise<ActivityPage | null> {
  const fallback = ACTIVITY_PAGES[slug] ?? null;
  if (!fallback) return null;

  try {
    const res = await fetch(`${API_BASE}/activites/${slug}`, {
      headers: { Accept: 'application/json' },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return fallback;
    const data = await res.json();
    return { ...fallback, ...data } as ActivityPage;
  } catch {
    return fallback;
  }
}
