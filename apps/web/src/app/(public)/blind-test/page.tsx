import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import { fetchActivityPage } from '@/lib/content-api';
import PageHero from '@/components/sections/PageHero';

const staticPage = ACTIVITY_PAGES['blind-test'];

export const metadata: Metadata = {
  title: 'Blind Test',
  description: staticPage.description,
};

export default async function BlindTestPage() {
  const page = (await fetchActivityPage('blind-test')) ?? staticPage;

  return <PageHero page={page} />;
}
