import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import PageHero, { InlinePriceCard } from '@/components/sections/PageHero';

const page = ACTIVITY_PAGES.billard;

export const metadata: Metadata = {
  title: 'Billard',
  description: page.description,
};

export default function BillardPage() {
  return (
    <>
      <PageHero page={page} />
      <InlinePriceCard page={page} />
    </>
  );
}
