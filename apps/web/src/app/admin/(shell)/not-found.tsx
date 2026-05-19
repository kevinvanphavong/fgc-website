import Link from 'next/link';

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 text-[3rem]">🧐</div>
      <h1 className="text-xl font-semibold text-admin-text">Cette page n&apos;existe pas</h1>
      <p className="mt-2 max-w-md text-sm text-admin-text-muted">
        L&apos;URL que tu as saisie n&apos;est plus valide ou n&apos;a jamais existé. Reviens au
        dashboard ou utilise <kbd className="rounded border border-admin-border bg-admin-bg-sunken px-1">⌘ K</kbd> pour
        chercher.
      </p>
      <Link
        href="/admin"
        className="mt-5 inline-flex items-center gap-2 rounded-md bg-admin-brand px-4 py-2 text-sm font-medium text-white hover:bg-admin-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-admin-brand-ring"
      >
        Retour au dashboard
      </Link>
    </div>
  );
}
