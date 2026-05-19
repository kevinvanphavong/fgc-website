import type { Metadata } from 'next';
import ReservationsClient from '@/components/admin/reservations/ReservationsClient';

export const metadata: Metadata = { title: 'Réservations anniv' };

export default function AdminReservationsPage() {
  return <ReservationsClient />;
}
