import { startWorkoutSession as startWorkoutSessionAction } from '@/app/actions/workout-session';
import { queryKeys } from '@/lib/query-keys';
import { useWorkoutUIStore } from '@/store/workout-ui-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface StartSessionData {
    routineId: string;
    preWorkoutEnergy?: number;
    preWorkoutMood?: number;
    preWorkoutMotivation?: number;
    preWorkoutNotes?: string;
    adjustIntensity?: 'decrease' | 'maintain' | 'increase';
}

/**
 * Mutation hook for starting a workout session
 * 
 * Features:
 * - Creates session and prefetches warmup data
 * - Updates Zustand store with session ID and warmup data
 * - Invalidates queries on success
 */
export function useStartWorkoutSession() {
    const queryClient = useQueryClient();
    const { startSession, setStage, clearRoutineSelection } = useWorkoutUIStore();

    return useMutation({
        mutationFn: (data: StartSessionData) => startWorkoutSessionAction(data),

        onMutate: async () => {
            // Show loading state - this is the only time we wait
            // since we're creating a new session
        },

        onSuccess: (result) => {
            if (result.session) {
                // Update store with new session
                startSession(result.session.id, result.warmupData);

                // Cache the warmup checklist
                if (result.warmupData?.checklist) {
                    queryClient.setQueryData(
                        queryKeys.warmupChecklist,
                        result.warmupData.checklist
                    );
                }

                // Invalidate active session query
                queryClient.invalidateQueries({ queryKey: queryKeys.activeSession });
            }
        },

        onError: (error) => {
            console.error('Failed to start workout session:', error);
            toast.error('Failed to start workout. Please try again.');
            clearRoutineSelection();
        },
    });
}
