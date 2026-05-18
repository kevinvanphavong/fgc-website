import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import { fetchActivityPage } from '@/lib/content-api';
import PageHero, { PricingSection } from '@/components/sections/PageHero';

const staticPage = ACTIVITY_PAGES.bowling;

export const metadata: Metadata = {
  title: 'Bowling',
  description: staticPage.description,
};

export default async function BowlingPage() {
  const page = (await fetchActivityPage('bowling')) ?? staticPage;

  return (
    <>
      <PageHero page={page} />
      <PricingSection page={page} />
    </>
  );
}
