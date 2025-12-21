import { markWarmupComplete as markWarmupCompleteAction } from '@/app/actions/workout';
import { queryKeys } from '@/lib/query-keys';
import { useWorkoutUIStore } from '@/store/workout-ui-store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * Mutation hook for completing warmup
 * 
 * Features:
 * - Optimistic UI: transitions to exercise stage immediately
 * - Rollback on error
 * - Invalidates session query on success
 */
export function useMarkWarmupComplete() {
    const queryClient = useQueryClient();
    const { completeWarmup, setStage } = useWorkoutUIStore();

    return useMutation({
        mutationFn: (sessionId: string) => markWarmupCompleteAction(sessionId),

        onMutate: async () => {
            // Optimistic: move to exercise stage immediately
            completeWarmup();
        },

        onError: (error) => {
            // Rollback: go back to warmup stage
            setStage('warmup');
            console.error('Failed to mark warmup complete:', error);
            toast.error('Failed to save. Please try again.');
        },

        onSuccess: () => {
            // Invalidate session to ensure warmupCompleted=true is reflected
            queryClient.invalidateQueries({ queryKey: queryKeys.activeSession });
        },
    });
}
