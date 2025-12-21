import { getRoutinesPaginated } from '@/app/actions/routines';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

interface UseRoutinesParams {
    search?: string;
    filter?: 'all' | 'system' | 'user';
}

interface RoutinesInitialData {
    items: any[];
    hasMore: boolean;
    nextCursor: string | null;
}

/**
 * Query hook for workout routines
 * 
 * Features:
 * - Supports search and filter params
 * - Can accept initialData from server component
 * - Longer stale time (routines don't change often)
 */
export function useRoutines(
    params?: UseRoutinesParams,
    initialData?: RoutinesInitialData
) {
    return useQuery({
        queryKey: queryKeys.routines(params),
        queryFn: async () => {
            const result = await getRoutinesPaginated({
                search: params?.search,
                includeSystem: params?.filter !== 'user',
                includeUser: params?.filter !== 'system',
                limit: 20,
            });
            return {
                items: result.items,
                hasMore: result.hasMore,
                nextCursor: result.nextCursor,
            };
        },
        initialData,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
