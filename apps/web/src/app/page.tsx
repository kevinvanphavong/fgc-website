import Hero from '@/components/sections/Hero';
import Activities from '@/components/sections/Activities';
import Offers from '@/components/sections/Offers';
import Schedule from '@/components/sections/Schedule';
import Experience from '@/components/sections/Experience';
import { fetchOffers, fetchSchedule } from '@/lib/content-api';

export default async function HomePage() {
  const [offers, schedule] = await Promise.all([
    fetchOffers(),
    fetchSchedule(),
  ]);

  return (
    <>
      <Hero />
      <Activities />
      <Offers data={offers} />
      <Schedule data={schedule} />
      <Experience />
    </>
  );
}
