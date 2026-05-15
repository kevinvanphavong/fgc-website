import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';
import type { ComponentPropsWithoutRef } from 'react';

const buttonVariants = cva(
  'inline-flex items-center gap-2.5 rounded-full font-display text-[1rem] uppercase leading-none transition-transform hover:-translate-y-0.5 active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary:
          'border-2 border-fgc-yellow-shadow bg-fgc-yellow px-6 py-3.5 text-fgc-purple shadow-fgc-btn-yellow',
        ghost:
          'border-2 border-fgc-cream/30 bg-fgc-cream/[0.08] px-6 py-3.5 text-fgc-cream',
        pink: 'border-2 border-fgc-pink-shadow bg-fgc-pink px-6 py-3.5 text-white shadow-fgc-btn-pink',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

type ButtonProps = ComponentPropsWithoutRef<'a'> &
  VariantProps<typeof buttonVariants>;

export default function Button({
  variant,
  className,
  ...props
}: ButtonProps) {
  return (
    <a className={cn(buttonVariants({ variant }), className)} {...props} />
  );
}

export { buttonVariants };
