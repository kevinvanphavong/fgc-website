import type { Metadata } from 'next';
import { ACTIVITY_PAGES } from '@/lib/activity-pages';
import PageHero from '@/components/sections/PageHero';

const page = ACTIVITY_PAGES['blind-test'];

export const metadata: Metadata = {
  title: 'Blind Test',
  description: page.description,
};

export default function BlindTestPage() {
  return <PageHero page={page} />;
}
