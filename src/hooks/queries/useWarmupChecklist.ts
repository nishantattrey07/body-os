import { getWarmupChecklist } from '@/app/actions/workout';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

/**
 * Query hook for warmup checklist items
 * 
 * Features:
 * - Long stale time (checklist rarely changes)
 * - Can accept initialData from startWorkoutSession prefetch
 */
export function useWarmupChecklist(initialData?: any[]) {
    return useQuery({
        queryKey: queryKeys.warmupChecklist,
        queryFn: getWarmupChecklist,
        initialData,
        staleTime: 1000 * 60 * 5, // 5 minutes - checklist is static
    });
}
