import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import PageHero, { PricingSection } from '@/components/sections/PageHero';

const page = ACTIVITY_PAGES.bowling;

export const metadata: Metadata = {
  title: 'Bowling',
  description: page.description,
};

export default function BowlingPage() {
  return (
    <>
      <PageHero page={page} />
      <PricingSection page={page} />
    </>
  );
}
