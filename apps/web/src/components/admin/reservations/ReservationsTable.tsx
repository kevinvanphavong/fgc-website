'use client';

import StatusPill from './StatusPill';
import {
  FORMULE_META,
  formatEventDate,
  formatRelativeAge,
  formatSlot,
} from '@/lib/admin-hooks/reservation-meta';
import type { DemandeReservation } from '@/lib/admin-hooks/useDemandeReservation';

interface TableProps {
  reservations: DemandeReservation[];
  onOpen: (r: DemandeReservation) => void;
}

export default function ReservationsTable({ reservations, onOpen }: TableProps) {
  if (reservations.length === 0) {
    return (
      <div className="grid place-items-center rounded-lg border border-admin-border bg-admin-bg-elev p-12 text-sm text-admin-text-muted">
        Aucune demande pour ces filtres.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-admin-border bg-admin-bg-elev">
      <table className="w-full text-sm">
        <thead className="border-b border-admin-border-soft bg-admin-bg-sunken/50 text-left text-[0.7rem] uppercase tracking-wider text-admin-text-muted">
          <tr>
            <th className="px-3 py-2.5">Ref</th>
            <th className="px-3 py-2.5">Status</th>
            <th className="px-3 py-2.5">Date événement</th>
            <th className="px-3 py-2.5">Créneau</th>
            <th className="px-3 py-2.5">Parent</th>
            <th className="px-3 py-2.5">Formule</th>
            <th className="px-3 py-2.5 text-right">Enfants</th>
            <th className="px-3 py-2.5">Créée</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map((r) => {
            const formule = FORMULE_META[r.formuleKey];
            return (
              <tr
                key={r.id}
                className="cursor-pointer border-b border-admin-border-soft transition hover:bg-admin-bg-sunken/40"
                onClick={() => onOpen(r)}
              >
                <td className="px-3 py-2.5 font-medium text-admin-brand">{r.reference}</td>
                <td className="px-3 py-2.5">
                  <StatusPill status={r.status} />
                </td>
                <td className="px-3 py-2.5 text-admin-text">{formatEventDate(r.eventDate)}</td>
                <td className="px-3 py-2.5 text-admin-text-muted">{formatSlot(r.timeSlot)}</td>
                <td className="px-3 py-2.5">
                  <div className="text-admin-text">
                    {r.parentFirstName} {r.parentLastName}
                  </div>
                  <div className="text-[0.7rem] text-admin-text-muted">{r.parentEmail}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="inline-flex items-center gap-1 text-admin-text">
                    <span>{formule?.icon}</span>
                    {formule?.label ?? r.formuleKey}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right text-admin-text">{r.kidsCount}</td>
                <td className="px-3 py-2.5 text-admin-text-muted" title={r.createdAt}>
                  {formatRelativeAge(r.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
