import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import { fetchActivityPage } from '@/lib/content-api';
import PageHero, { InlinePriceCard } from '@/components/sections/PageHero';

const staticPage = ACTIVITY_PAGES.billard;

export const metadata: Metadata = {
  title: 'Billard',
  description: staticPage.description,
};

export default async function BillardPage() {
  const page = (await fetchActivityPage('billard')) ?? staticPage;

  return (
    <>
      <PageHero page={page} />
      <InlinePriceCard page={page} />
    </>
  );
}
