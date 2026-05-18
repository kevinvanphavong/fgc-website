import { Sparkles } from 'lucide-react';
import { Card } from '@/components/admin/ui/Card';
import Icon from '@/components/admin/ui/Icon';

type ComingSoonProps = {
  title: string;
  subtitle?: string;
  pr: string;
};

/**
 * Page placeholder utilisée tant qu'un module n'a pas été branché.
 * En PR1 : toutes les pages /admin/* sauf le shell.
 */
export default function ComingSoon({ title, subtitle, pr }: ComingSoonProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-[1.5rem] font-semibold text-admin-text">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-[0.875rem] text-admin-text-muted">{subtitle}</p>
        ) : null}
      </div>

      <Card className="px-6 py-8 text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-admin-brand-soft text-admin-brand">
          <Icon icon={Sparkles} size={20} />
        </div>
        <div className="mt-4 text-[0.9375rem] font-semibold text-admin-text">
          Module en cours d&apos;implémentation
        </div>
        <p className="mx-auto mt-1 max-w-md text-[0.8125rem] text-admin-text-muted">
          Ce module sera livré dans la <span className="font-medium text-admin-text">{pr}</span>.
          La structure de navigation et le shell sont en place — le contenu arrive.
        </p>
      </Card>
    </div>
  );
}
