import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a new QueryClient with optimized defaults for Body OS
 * 
 * PERFORMANCE OPTIMIZATIONS for low-bandwidth gym environments:
 * - staleTime: 5 minutes - data stays fresh, prevents refetches on navigation
 * - gcTime: 30 minutes - keep data in memory longer for back-navigation
 * - refetchOnWindowFocus: false - prevents refetches when switching apps on mobile
 * - retry: 3 - handles temporary network issues gracefully
 */
export function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Data considered fresh for 5 minutes
                // This is critical for navigation speed - when user goes
                // Dashboard -> Workout -> Routines -> Workout, data is cached
                staleTime: 1000 * 60 * 5,

                // Keep unused data in cache for 30 minutes
                // This allows instant back-navigation even after long periods
                gcTime: 1000 * 60 * 30,

                // Retry failed queries 3 times
                retry: 3,

                // PERFORMANCE: Disable refetch on window focus for mobile
                // On mobile, switching apps shouldn't trigger refetches
                // Manual refresh is preferred for data integrity
                refetchOnWindowFocus: false,

                // Don't refetch on reconnect - we have localStorage backup
                refetchOnReconnect: false,
            },
            mutations: {
                // Retry mutations on network failure
                retry: 2,
            },
        },
    });
}
