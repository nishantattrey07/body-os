import { logWater } from '@/app/actions/water';
import type { DailyLog } from '@/hooks/queries/useDailyLog';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Mutation hook for logging water with optimistic updates
 * 
 * Note: For debouncing rapid taps, the component should use
 * useDebouncedCallback to batch multiple taps before calling mutate()
 * 
 * Features:
 * - Instant UI feedback
 * - Automatic rollback on error
 * - Invalidates daily log on success
 */
export function useLogWater() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (amount: number) => {
            await logWater(amount);
            return amount;
        },

        // Optimistic Update
        onMutate: async (amount) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.dailyLog() });

            const previousLog = queryClient.getQueryData<DailyLog>(queryKeys.dailyLog());

            if (previousLog) {
                queryClient.setQueryData<DailyLog>(queryKeys.dailyLog(), {
                    ...previousLog,
                    waterTotal: previousLog.waterTotal + amount,
                });
            }

            return { previousLog };
        },

        // Rollback on error
        onError: (_error, _amount, context) => {
            if (context?.previousLog) {
                queryClient.setQueryData(queryKeys.dailyLog(), context.previousLog);
            }
        },

        // Refetch to sync with server
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.dailyLog() });
        },
    });
}
