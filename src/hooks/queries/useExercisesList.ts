import { getExerciseCategories, getExercisesPaginated } from '@/app/actions/exercises';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

export interface Exercise {
    id: string;
    name: string;
    category: string;
    defaultSets: number;
    defaultReps: number | null;
    description?: string | null;
    isSystem: boolean;
}

export interface ExercisesData {
    items: Exercise[];
    nextCursor: string | null;
    hasMore: boolean;
}

/**
 * Query hook for exercises list
 * 
 * Features:
 * - Accepts initialData from Server Component
 * - Cached per filter/search/category params
 * - Refetches on window focus for multi-device sync
 */
export function useExercisesList(
    params: { search?: string; filter?: string; category?: string } = {},
    initialData?: ExercisesData
) {
    return useQuery({
        queryKey: queryKeys.exercises(params),
        queryFn: async () => {
            const result = await getExercisesPaginated({
                search: params.search || undefined,
                category: params.category || undefined,
                includeSystem: params.filter !== 'user',
                includeUser: params.filter !== 'system',
                limit: 20,
            });
            return result as ExercisesData;
        },
        initialData,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Query hook for exercise categories
 */
export function useExerciseCategories(initialData?: string[]) {
    return useQuery({
        queryKey: queryKeys.exerciseCategories,
        queryFn: async () => {
            return await getExerciseCategories();
        },
        initialData,
        staleTime: 1000 * 60 * 5, // 5 minutes - categories rarely change
    });
}
