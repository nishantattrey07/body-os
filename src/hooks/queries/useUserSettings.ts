import { getUserSettings } from '@/app/actions/settings';
import { queryKeys } from '@/lib/query-keys';
import { useQuery } from '@tanstack/react-query';

export interface UserSettings {
    proteinTarget: number;
    carbsTarget: number;
    fatsTarget: number;
    caloriesTarget: number;
    waterTarget: number;
    dayCutoffHour: number;
    dayCutoffMinute: number;
}

/**
 * Query hook for user settings/targets
 * 
 * Features:
 * - Singleton query (no params)
 * - Long cache time (settings rarely change)
 * - Used for macro targets, water target, etc.
 * - Accepts initialData from Server Component to avoid loading skeleton
 */
export function useUserSettings(initialData?: UserSettings) {
    return useQuery({
        queryKey: queryKeys.userSettings,
        queryFn: async () => {
            const settings = await getUserSettings();
            return settings as UserSettings;
        },
        initialData,
        // Settings change rarely, cache longer
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
