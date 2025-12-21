import { getRoutinesPaginated } from '@/app/actions/routines';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

export interface Routine {
    id: string;
    name: string;
    description?: string | null;
    isSystem: boolean;
    exercises: any[];
}

export interface RoutinesData {
    items: Routine[];
    nextCursor: string | null;
    hasMore: boolean;
}

/**
 * Query hook for routines list
 * 
 * Features:
 * - Accepts initialData from Server Component
 * - Cached per filter/search params
 * - Refetches on window focus for multi-device sync
 */
export function useRoutinesList(
    params: { search?: string; filter?: string } = {},
    initialData?: RoutinesData
) {
    return useQuery({
        queryKey: queryKeys.routines(params),
        queryFn: async () => {
            const result = await getRoutinesPaginated({
                search: params.search || undefined,
                includeSystem: params.filter !== 'user',
                includeUser: params.filter !== 'system',
                limit: 20,
            });
            return result as RoutinesData;
        },
        initialData,
        // Keep data fresh but don't refetch too aggressively
        staleTime: 1000 * 60, // 1 minute
    });
}
