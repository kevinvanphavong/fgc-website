import Link from 'next/link';

type BreadcrumbProps = {
  items: { label: string; href?: string }[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="mb-6 flex items-center gap-2 text-[0.85rem]" aria-label="Fil d'Ariane">
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-2">
          {i > 0 && (
            <span className="text-fgc-cream/50" aria-hidden="true">
              ›
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="text-fgc-cream/60 transition-colors hover:text-fgc-yellow">
              {item.label}
            </Link>
          ) : (
            <span className="text-fgc-cream">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
