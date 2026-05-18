'use client';

import { makeEntityHooks } from './useEntity';
import type {
  HebdoCard,
  PassCard,
  ResaCard,
  AnnivCard,
  VipFeature,
  TarifCard,
  TarifPriceLine,
  DaySchedule,
  Offer,
  ActivityPageContent,
  MenuSection,
  MenuCategory,
  MenuItem,
} from './types';

export const hebdoCards = makeEntityHooks<HebdoCard>('hebdo_cards');
export const passCards = makeEntityHooks<PassCard>('pass_cards');
export const resaCards = makeEntityHooks<ResaCard>('resa_cards');
export const annivCards = makeEntityHooks<AnnivCard>('anniv_cards');
export const vipFeatures = makeEntityHooks<VipFeature>('vip_features');

export const tarifCards = makeEntityHooks<TarifCard>('tarif_cards');
export const tarifPriceLines = makeEntityHooks<TarifPriceLine>('tarif_price_lines');

export const daySchedules = makeEntityHooks<DaySchedule>('day_schedules');
export const offers = makeEntityHooks<Offer>('offers');
export const activityPages = makeEntityHooks<ActivityPageContent>(
  'activity_page_contents'
);

export const menuSections = makeEntityHooks<MenuSection>('menu_sections');
export const menuCategories = makeEntityHooks<MenuCategory>('menu_categories');
export const menuItems = makeEntityHooks<MenuItem>('menu_items');

export { extractErrorMessage } from './useEntity';
export type {
  HebdoCard,
  PassCard,
  ResaCard,
  AnnivCard,
  VipFeature,
  TarifCard,
  TarifPriceLine,
  DaySchedule,
  Offer,
  ActivityPageContent,
  MenuSection,
  MenuCategory,
  MenuItem,
};
