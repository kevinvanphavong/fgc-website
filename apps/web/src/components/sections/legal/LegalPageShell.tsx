import type { ReactNode } from 'react';
import Breadcrumb from '@/components/ui/Breadcrumb';

interface Props {
  title: string;
  intro: string;
  children: ReactNode;
}

/**
 * Shell visuel partagé par les 4 pages /legal/* (PR9 finitions).
 * Encart "à valider par avocat" non-négociable — ce site est un pilote
 * commercial, pas un site juridique en production.
 */
export default function LegalPageShell({ title, intro, children }: Props) {
  return (
    <>
      <section className="relative py-[60px] pb-[30px]">
        <div className="wrap mx-auto max-w-[820px]">
          <Breadcrumb
            items={[
              { label: 'Accueil', href: '/' },
              { label: 'Mentions & légales', href: '/legal/mentions-legales' },
              { label: title },
            ]}
          />
          <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}>
            {title}
          </h1>
          <p className="mt-4 text-[1.05rem] text-fgc-cream/85">{intro}</p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 20 }}>
        <div className="wrap mx-auto max-w-[820px]">
          <div className="mb-8 flex gap-3 rounded-[18px] border border-dashed border-fgc-yellow/40 bg-fgc-yellow/10 p-5">
            <span className="text-[1.4rem]">⚠️</span>
            <div>
              <div className="mb-1 font-display text-[0.9rem] uppercase tracking-fgc-eyebrow text-fgc-yellow">
                Document de démonstration
              </div>
              <p className="text-[0.9rem] text-fgc-cream/85">
                Ces contenus sont rédigés pour la mise en démo du site et{' '}
                <strong>doivent être validés par un avocat / DPO</strong> avant publication
                officielle.
              </p>
            </div>
          </div>

          <article className="prose prose-invert max-w-none text-fgc-cream/85 [&_a]:text-fgc-yellow [&_a:hover]:text-fgc-pink-hot [&_h2]:font-display [&_h2]:uppercase [&_h2]:text-fgc-yellow [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:text-[1.4rem] [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-fgc-cream [&_p]:my-3 [&_p]:leading-relaxed [&_ul]:my-3 [&_ul]:ml-5 [&_ul]:list-disc [&_li]:my-1">
            {children}
          </article>
        </div>
      </section>
    </>
  );
}
