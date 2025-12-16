'use client';

import { makeQueryClient } from '@/lib/query-client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * React Query Provider with DevTools
 * 
 * Wraps app with QueryClientProvider for global query/mutation access.
 * DevTools only visible in development mode (bottom-right floating panel).
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create QueryClient once per mount (not on every render)
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only show in development - floating bottom-right */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
