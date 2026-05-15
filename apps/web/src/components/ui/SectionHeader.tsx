import type { ReactNode } from 'react';

type SectionHeaderProps = {
  eyebrow: string;
  title: ReactNode;
  lead?: string;
};

export default function SectionHeader({
  eyebrow,
  title,
  lead,
}: SectionHeaderProps) {
  return (
    <div className="mb-12 text-center">
      <span className="mb-4 inline-block font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-pink-hot">
        {eyebrow}
      </span>
      <h2 className="section-title mx-auto">{title}</h2>
      {lead && (
        <p className="mx-auto mt-4 max-w-fgc-lead text-[1.05rem] text-fgc-cream/85">
          {lead}
        </p>
      )}
    </div>
  );
}
