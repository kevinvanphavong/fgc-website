import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import { fetchActivityPage } from '@/lib/content-api';
import PageHero from '@/components/sections/PageHero';

const staticPage = ACTIVITY_PAGES.karaoke;

export const metadata: Metadata = {
  title: 'Karaoké',
  description: staticPage.description,
};

export default async function KaraokePage() {
  const page = (await fetchActivityPage('karaoke')) ?? staticPage;

  return <PageHero page={page} />;
}
