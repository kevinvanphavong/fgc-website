import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Calendar,
  Briefcase,
  Users,
  Layers,
  Image as ImageIcon,
  Shield,
} from 'lucide-react';

export type AdminSectionTitle = 'Pilotage' | 'Site web' | 'Réglages';

export type AdminRoute = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  section: AdminSectionTitle;
  badge?: string;
};

/**
 * Source : back-office-mockup/app.jsx ROUTES (1:1, hash → routes Next.js).
 * Les badges sont volontairement omis en PR1 (data réelle en PR3+).
 */
export const ADMIN_ROUTES: AdminRoute[] = [
  { key: 'dashboard', label: 'Dashboard', href: '/admin', icon: Home, section: 'Pilotage' },
  { key: 'reservations', label: 'Réservations B2C', href: '/admin/reservations', icon: Calendar, section: 'Pilotage' },
  { key: 'b2b', label: 'Demandes B2B', href: '/admin/b2b', icon: Briefcase, section: 'Pilotage' },
  { key: 'clients', label: 'Clients', href: '/admin/clients', icon: Users, section: 'Pilotage' },
  { key: 'contenus', label: 'Contenus du site', href: '/admin/contenus', icon: Layers, section: 'Site web' },
  { key: 'medias', label: 'Médias & affiches', href: '/admin/medias', icon: ImageIcon, section: 'Site web' },
  { key: 'users', label: 'Utilisateurs & rôles', href: '/admin/users', icon: Shield, section: 'Réglages' },
];

export const ADMIN_SECTIONS: AdminSectionTitle[] = ['Pilotage', 'Site web', 'Réglages'];

export function findRouteByPath(pathname: string): AdminRoute | undefined {
  // /admin → dashboard; /admin/foo → exact match
  if (pathname === '/admin' || pathname === '/admin/') {
    return ADMIN_ROUTES.find((r) => r.key === 'dashboard');
  }
  return ADMIN_ROUTES.find(
    (r) => r.href !== '/admin' && pathname.startsWith(r.href)
  );
}
