import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.7rem] font-medium leading-tight',
  {
    variants: {
      color: {
        slate: 'bg-admin-bg-sunken text-admin-slate',
        brand: 'bg-admin-brand-soft text-admin-brand',
        green: 'bg-admin-green-soft text-admin-green',
        amber: 'bg-admin-amber-soft text-admin-amber',
        red: 'bg-admin-red-soft text-admin-red',
        blue: 'bg-admin-blue-soft text-admin-blue',
        pink: 'bg-admin-pink-soft text-admin-pink',
      },
    },
    defaultVariants: { color: 'slate' },
  }
);

type BadgeProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
  };

export default function Badge({
  color,
  dot,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ color }), className)} {...rest}>
      {dot ? (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current opacity-70"
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}
