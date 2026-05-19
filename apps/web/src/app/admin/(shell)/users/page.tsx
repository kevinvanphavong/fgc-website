import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/admin-auth';
import UsersClient from '@/components/admin/users/UsersClient';

export const metadata = { title: 'Utilisateurs & rôles' };

export default async function AdminUsersPage() {
  const user = await getCurrentUser();
  // Garde supplémentaire : seuls les admins voient cette page. Le sidebar
  // masque déjà l'item, et l'API renvoie 403 — c'est la 3ᵉ couche de défense.
  if (!user || !user.roles.includes('ROLE_ADMIN')) {
    redirect('/admin');
  }
  return <UsersClient currentUserId={user.id} />;
}
