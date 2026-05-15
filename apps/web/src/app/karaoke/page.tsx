import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import PageHero from '@/components/sections/PageHero';

const page = ACTIVITY_PAGES.karaoke;

export const metadata: Metadata = {
  title: 'Karaoké',
  description: page.description,
};

export default function KaraokePage() {
  return <PageHero page={page} />;
}
