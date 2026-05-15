import type { Feature } from '@/lib/activity-pages';

type FeatureListProps = {
  features: Feature[];
};

export default function FeatureList({ features }: FeatureListProps) {
  return (
    <ul className="mb-8 grid gap-4 sm:grid-cols-2">
      {features.map((f) => (
        <li
          key={f.title}
          className="flex items-start gap-3 rounded-fgc-card-soft bg-white/[0.04] p-4"
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-fgc-sm bg-fgc-icon text-lg shadow-fgc-3d-yellow-sm"
            aria-hidden="true"
          >
            {f.icon}
          </span>
          <div>
            <div className="font-display text-[0.9rem] uppercase text-fgc-cream">
              {f.title}
            </div>
            <div className="text-[0.8rem] text-fgc-cream/60">{f.sub}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
