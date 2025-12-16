import { logNutrition } from '@/app/actions/nutrition';
import type { DailyLog } from '@/hooks/queries/useDailyLog';
import type { InventoryItem } from '@/hooks/queries/useInventory';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LogNutritionInput {
    item: InventoryItem;
    quantity?: number;
}

/**
 * Mutation hook for logging nutrition with optimistic updates
 * 
 * Features:
 * - Instant UI feedback (optimistic update)
 * - Automatic rollback on error
 * - Server Action wrapper pattern (throws on failure)
 * - Invalidates daily log cache on success
 */
export function useLogNutrition() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ item, quantity = 1 }: LogNutritionInput) => {
            // Call Server Action
            const result = await logNutrition(item.id, quantity);

            // Server Action throws on error, but check for null result too
            if (!result) {
                throw new Error('Failed to log nutrition');
            }

            return result;
        },

        // Optimistic Update - runs immediately before server call
        onMutate: async ({ item, quantity = 1 }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: queryKeys.dailyLog() });

            // Snapshot current value for rollback
            const previousLog = queryClient.getQueryData<DailyLog>(queryKeys.dailyLog());

            // Optimistically update the cache (multiply by quantity!)
            if (previousLog) {
                queryClient.setQueryData<DailyLog>(queryKeys.dailyLog(), {
                    ...previousLog,
                    proteinTotal: previousLog.proteinTotal + ((item.proteinPerUnit || 0) * quantity),
                    carbsTotal: previousLog.carbsTotal + ((item.carbsPerUnit || 0) * quantity),
                    fatsTotal: previousLog.fatsTotal + ((item.fatPerUnit || 0) * quantity),
                    caloriesTotal: previousLog.caloriesTotal + ((item.caloriesPerUnit || 0) * quantity),
                });
            }

            // Return context for rollback
            return { previousLog };
        },

        // On Error - rollback to previous value
        onError: (_error, _variables, context) => {
            if (context?.previousLog) {
                queryClient.setQueryData(queryKeys.dailyLog(), context.previousLog);
            }
        },

        // On Success - sync with server's authoritative totals
        onSuccess: (result) => {
            if (result.dailyTotals) {
                const currentLog = queryClient.getQueryData<DailyLog>(queryKeys.dailyLog());
                if (currentLog) {
                    queryClient.setQueryData<DailyLog>(queryKeys.dailyLog(), {
                        ...currentLog,
                        proteinTotal: result.dailyTotals.proteinTotal,
                        carbsTotal: result.dailyTotals.carbsTotal,
                        fatsTotal: result.dailyTotals.fatsTotal,
                        caloriesTotal: result.dailyTotals.caloriesTotal,
                    });
                }
            }
        },

        // Always refetch to ensure sync (handles race conditions)
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.dailyLog() });
        },
    });
}
