import { getTodayLog } from '@/app/actions/daily-log';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

export interface DailyLog {
    id: string;
    date: string;
    weight: number | null;
    sleepHours: number | null;
    bloated: boolean;
    proteinTotal: number;
    carbsTotal: number;
    fatsTotal: number;
    caloriesTotal: number;
    waterTotal: number;
}

/**
 * Query hook for today's daily log
 * 
 * Features:
 * - Uses user's cutoff time for "today" calculation
 * - Cached for 1 minute (staleTime from global config)
 * - Refetches on window focus (multi-device sync)
 */
export function useDailyLog() {
    return useQuery({
        queryKey: queryKeys.dailyLog(),
        queryFn: async () => {
            const log = await getTodayLog();
            return log as DailyLog | null;
        },
    });
}
