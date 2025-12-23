import { getTodayLog } from '@/app/actions/daily-log';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

export interface DailyLog {
    id: string;
    date: Date | string;
    weight: number | null;
    sleepHours: number | null;
    sleepQuality: number | null;
    mood: string | null;
    bloated: boolean;
    proteinTotal: number;
    carbsTotal: number;
    fatsTotal: number;
    caloriesTotal: number;
    waterTotal: number;
    dailyReview?: any;
}

/**
 * Query hook for today's daily log
 * 
 * Features:
 * - Uses user's cutoff time for "today" calculation
 * - Cached for 1 minute (staleTime from global config)
 * - Refetches on window focus (multi-device sync)
 * - Accepts initialData from Server Component to avoid loading skeleton
 */
export function useDailyLog(initialData?: DailyLog | null) {
    return useQuery({
        queryKey: queryKeys.dailyLog(),
        queryFn: async () => {
            const log = await getTodayLog();
            return log as DailyLog | null;
        },
        initialData,
    });
}
