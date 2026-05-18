/**
 * Types des entités tels qu'exposés par l'API admin (JSON-LD).
 * Champs nullable/optional reflètent la réalité du backend Symfony.
 */

export type HebdoCard = {
  '@id'?: string;
  id?: number;
  key: string;
  tag: string;
  title: string;
  description: string | null;
  bullets: string[];
  price: string;
  days: string;
  featured: boolean;
  savings: string | null;
  position: number;
};

export type PassCard = {
  '@id'?: string;
  id?: number;
  key: string;
  name: string;
  price: string;
  features: string[];
  separatePrice: string;
  savings: string;
  featured: boolean;
  position: number;
};

export type ResaCard = {
  '@id'?: string;
  id?: number;
  key: string;
  rank: string;
  audience: string;
  price: string;
  pitch: string;
  features: string[];
  keyPoint: string;
  featured: boolean;
  position: number;
};

export type AnnivCard = {
  '@id'?: string;
  id?: number;
  key: string;
  icon: string;
  name: string;
  age: string;
  price: string;
  features: string[];
  featured: boolean;
  position: number;
};

export type VipFeature = {
  '@id'?: string;
  id?: number;
  icon: string;
  label: string;
  position: number;
};

export type TarifCard = {
  '@id'?: string;
  id?: number;
  cardGroup: string;
  icon: string;
  name: string;
  unit: string;
  note: string | null;
  position: number;
  prices?: TarifPriceLine[];
};

export type TarifPriceLine = {
  '@id'?: string;
  id?: number;
  label: string;
  price: string;
  position: number;
  tarifCard?: string; // IRI
};

export type DaySchedule = {
  '@id'?: string;
  id?: number;
  key: string;
  label: string;
  hours: string;
  jsDay: number;
  position: number;
};

export type Offer = {
  '@id'?: string;
  id?: number;
  key: string;
  image: string;
  title: string;
  badge: string;
  badgeVariant: string;
  href: string;
  active: boolean;
  position: number;
};

export type ActivityPageContent = {
  '@id'?: string;
  id?: number;
  slug: string;
  image: string;
  imageAlt: string;
  inlinePriceAmount: string | null;
  inlinePriceDescription: string | null;
  features: string[];
  priceCards: unknown[];
  pricingEyebrow: string | null;
  pricingTitle: string | null;
  pricingLead: string | null;
};

export type MenuSection = {
  '@id'?: string;
  id?: number;
  key: string;
  eyebrow: string;
  title: string;
  titleAccent: string;
  lead: string | null;
  position: number;
  columns?: MenuCategory[];
};

export type MenuCategory = {
  '@id'?: string;
  id?: number;
  key: string;
  title: string;
  position: number;
  section?: string;
  items?: MenuItem[];
};

export type MenuItem = {
  '@id'?: string;
  id?: number;
  name: string;
  description: string;
  price: string;
  position: number;
  category?: string;
};
