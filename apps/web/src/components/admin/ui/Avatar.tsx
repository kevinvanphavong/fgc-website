import { cn } from '@/lib/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

const sizeMap: Record<AvatarSize, string> = {
  sm: 'h-7 w-7 text-[0.7rem]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
};

type AvatarProps = {
  name: string;
  size?: AvatarSize;
  gradient?: string;
  className?: string;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Avatar({
  name,
  size = 'md',
  gradient = 'linear-gradient(135deg, #FF2D87, #5E2DB8)',
  className,
}: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-semibold text-white tracking-tight',
        sizeMap[size],
        className
      )}
      style={{ background: gradient }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </div>
  );
}
