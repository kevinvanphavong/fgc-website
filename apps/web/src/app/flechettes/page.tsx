import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import PageHero, { InlinePriceCard } from '@/components/sections/PageHero';

const page = ACTIVITY_PAGES.flechettes;

export const metadata: Metadata = {
  title: 'Fléchettes',
  description: page.description,
};

export default function FlechettesPage() {
  return (
    <>
      <PageHero page={page} />
      <InlinePriceCard page={page} />
    </>
  );
}
