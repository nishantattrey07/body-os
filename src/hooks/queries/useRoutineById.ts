import { getExercises } from '@/app/actions/exercises';
import { getRoutineById } from '@/app/actions/routines';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

// Types
export type RoutineExercise = {
    id: string;
    order: number;
    sets: number;
    reps: number | null;
    duration: number | null;
    restSeconds: number;
    exercise: Exercise;
};

export type Exercise = {
    id: string;
    name: string;
    category: string;
    trackingType: string;
    defaultSets: number;
    defaultReps: number | null;
    defaultDuration: number | null;
};

export type RoutineWithExercises = {
    id: string;
    name: string;
    description?: string | null;
    isSystem: boolean;
    exercises: RoutineExercise[];
};

/**
 * Query hook for a specific routine by ID
 * 
 * Features:
 * - Accepts initialData from Server Component
 * - Cached per routine ID
 * - Refetches on window focus
 */
export function useRoutineById(
    routineId: string,
    initialData?: RoutineWithExercises
) {
    return useQuery({
        queryKey: queryKeys.routineById(routineId),
        queryFn: async () => {
            const result = await getRoutineById(routineId);
            return result as RoutineWithExercises | null;
        },
        initialData,
        staleTime: 1000 * 60, // 1 minute
    });
}

/**
 * Query hook for all exercises (for the exercise picker)
 */
export function useAllExercises(initialData?: Exercise[]) {
    return useQuery({
        queryKey: ['all-exercises'] as const,
        queryFn: async () => {
            const result = await getExercises();
            return result as Exercise[];
        },
        initialData,
        staleTime: 1000 * 60 * 5, // 5 minutes - exercise list rarely changes
    });
}
