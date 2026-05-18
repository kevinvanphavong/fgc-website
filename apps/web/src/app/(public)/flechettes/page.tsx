import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import { fetchActivityPage } from '@/lib/content-api';
import PageHero, { InlinePriceCard } from '@/components/sections/PageHero';

const staticPage = ACTIVITY_PAGES.flechettes;

export const metadata: Metadata = {
  title: 'Fléchettes',
  description: staticPage.description,
};

export default async function FlechettesPage() {
  const page = (await fetchActivityPage('flechettes')) ?? staticPage;

  return (
    <>
      <PageHero page={page} />
      <InlinePriceCard page={page} />
    </>
  );
}
