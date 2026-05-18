/**
 * SVG sparkline natif — pas de Chart.js pour 4 mini-graphes (over-engineering).
 * Copié du mockup back-office-mockup/ui.jsx (Sparkline).
 */
type SparklineProps = {
  values: number[];
  className?: string;
  /** Couleur de la ligne — utilise une classe `text-admin-*` sur le parent. */
  ariaLabel?: string;
};

const VIEW_W = 100;
const VIEW_H = 36;

export default function Sparkline({ values, className, ariaLabel }: SparklineProps) {
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * VIEW_W;
      const y = VIEW_H - ((v - min) / span) * (VIEW_H - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="none"
      className={className}
      role={ariaLabel ? 'img' : 'presentation'}
      aria-label={ariaLabel}
    >
      <polyline
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
