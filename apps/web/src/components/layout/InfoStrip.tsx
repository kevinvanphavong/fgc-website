const ITEMS = [
  { icon: '📅', text: 'Ouvert 7J/7', variant: 'default' as const },
  { icon: '🥤', text: 'Snack & Bar', variant: 'default' as const },
  { icon: '☺', text: 'Ambiance & Fun garantis', variant: 'default' as const },
  {
    icon: '🎉',
    text: 'Anniversaires · EVG/EVJF · Événements',
    variant: 'pink' as const,
  },
];

export default function InfoStrip() {
  return (
    <div className="border-y border-fgc-yellow/15 bg-fgc-strip">
      <div className="wrap flex flex-wrap items-center justify-around gap-4 py-4">
        {ITEMS.map((item) => (
          <div key={item.text} className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-fgc-sm bg-fgc-yellow text-lg shadow-fgc-3d-yellow-sm"
              aria-hidden="true"
              style={
                item.variant === 'pink'
                  ? { background: 'linear-gradient(180deg, #ff2d87 0%, #e91e63 100%)' }
                  : undefined
              }
            >
              {item.icon}
            </span>
            <span
              className={
                item.variant === 'pink'
                  ? 'font-display text-[0.95rem] uppercase text-white'
                  : 'font-display text-[0.95rem] uppercase text-fgc-cream'
              }
            >
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
