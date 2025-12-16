import { createDailyLog } from '@/app/actions/daily-log';
import { queryKeys } from '@/lib/query-keys';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface CheckInInput {
    weight: number;
    sleepHours: number;
}

/**
 * Mutation hook for morning check-in
 * 
 * Features:
 * - Creates daily log with weight and sleep
 * - Invalidates queries to refresh dashboard
 */
export function useSubmitCheckIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ weight, sleepHours }: CheckInInput) => {
            const result = await createDailyLog({ weight, sleepHours });

            if (!result) {
                throw new Error('Failed to create daily log');
            }

            return result;
        },

        // On success, invalidate all related queries
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.dailyLog() });
            queryClient.invalidateQueries({ queryKey: queryKeys.userSettings });
        },
    });
}
