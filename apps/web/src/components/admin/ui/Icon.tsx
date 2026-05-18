import type { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/cn';

type IconProps = LucideProps & {
  icon: LucideIcon;
};

/**
 * Wrapper Lucide aligné sur les valeurs par défaut du back-office :
 * stroke 1.8, taille 16px, currentColor.
 */
export default function Icon({
  icon: LucideIconComponent,
  size = 16,
  strokeWidth = 1.8,
  className,
  ...rest
}: IconProps) {
  return (
    <LucideIconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={cn('shrink-0', className)}
      {...rest}
    />
  );
}
