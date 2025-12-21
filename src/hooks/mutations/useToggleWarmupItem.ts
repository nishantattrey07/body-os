import { toggleWarmupItem as toggleWarmupItemAction } from '@/app/actions/workout';
import { useWorkoutUIStore } from '@/store/workout-ui-store';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ToggleWarmupParams {
    sessionId: string;
    warmupChecklistId: string;
    completed: boolean;
}

/**
 * Mutation hook for toggling warmup items
 * 
 * Features:
 * - Fire-and-forget: UI updates immediately via Zustand
 * - Only shows error if server call fails
 * - Rolls back Zustand state on error
 */
export function useToggleWarmupItem() {
    const { toggleWarmupItem: toggleInStore } = useWorkoutUIStore();

    return useMutation({
        mutationFn: ({ sessionId, warmupChecklistId, completed }: ToggleWarmupParams) =>
            toggleWarmupItemAction(sessionId, warmupChecklistId, completed),

        // Note: We don't use onMutate for optimistic update here
        // because the component already updates Zustand before calling mutate.
        // This mutation is fire-and-forget with error handling.

        onError: (error, variables) => {
            // Rollback: toggle back to previous state
            toggleInStore(variables.warmupChecklistId);
            console.error('Failed to toggle warmup item:', error);
            toast.error('Failed to save. Please try again.');
        },
    });
}
