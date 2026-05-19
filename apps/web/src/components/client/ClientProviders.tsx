'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { getClientQueryClient } from '@/lib/use-client';

/**
 * QueryClient dédié au site public (espace client). Distinct du QueryClient
 * admin pour ne pas mélanger les caches /me et les caches admin si jamais
 * un user est connecté aux deux dans le même browser context.
 */
export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={getClientQueryClient()}>{children}</QueryClientProvider>;
}
