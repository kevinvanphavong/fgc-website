import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Helper de concat de classes Tailwind avec déduplication. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
