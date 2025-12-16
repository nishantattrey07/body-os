import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a new QueryClient with optimized defaults for Body OS
 * 
 * Key configurations:
 * - staleTime: 1 minute - reduces unnecessary refetches
 * - retry: 3 - handles temporary network issues
 * - refetchOnWindowFocus: true (default) - syncs data on tab switch
 */
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data considered fresh for 1 minute
                // Prevents hammering the database on rapid navigation
                staleTime: 1000 * 60 * 1,

                // Retry failed queries 3 times
                retry: 3,

                // Refetch when user returns to tab (multi-device sync)
                refetchOnWindowFocus: true,
            },
            mutations: {
                // Retry mutations on network failure
                retry: 1,
            },
        },
    });
}
