import { getCurrentClient } from '@/lib/client-auth';
import { redirect } from 'next/navigation';
import ProfileClient from '@/components/sections/compte/ProfileClient';

export const metadata = { title: 'Mon profil' };

export default async function ComptePage() {
  const user = await getCurrentClient();
  if (!user) redirect('/connexion?next=/compte');

  return <ProfileClient initialUser={user} />;
}
