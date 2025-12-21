import { getActiveSession } from '@/app/actions/workout-session';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

/**
 * Query hook for active workout session
 * 
 * Features:
 * - Auto-refetches on window focus (multi-device sync)
 * - Can accept initialData from server component
 * - Short stale time for workout accuracy
 */
export function useActiveSession(initialData?: any) {
    return useQuery({
        queryKey: queryKeys.activeSession,
        queryFn: getActiveSession,
        initialData,
        staleTime: 1000 * 30, // 30 seconds - workouts need fresh data
        refetchOnWindowFocus: true,
    });
}
