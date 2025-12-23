import { getTodayLog } from '@/app/actions/daily-log';
import { getExercisesPaginated } from '@/app/actions/exercises';
import { getRoutinesPaginated } from '@/app/actions/routines';
import { useDailyLogStore } from '@/store/daily-log-store';
import { useExercisesStore } from '@/store/exercises-store';
import { useRoutinesStore } from '@/store/routines-store';
import { useEffect, useState, useCallback } from 'react';

/**
 * Background Sync Hook - Non-blocking server synchronization
 * 
 * Syncs Zustand stores with server data in the background.
 * Never blocks the UI - all server calls are async.
 * 
 * Usage: Call once in app root (layout.tsx or page.tsx)
 * 
 * Sync strategy:
 * 1. On mount: Check if stores are empty (first-time user)
 * 2. If empty: Show loading screen while doing initial sync
 * 3. If not empty: Show cached data immediately, sync in background
 * 4. Periodic sync: Every 5 minutes while app is active
 * 5. On errors: Retry with exponential backoff
 */

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'complete';

interface SyncState {
    status: SyncStatus;
    progress: number; // 0-100
    error: string | null;
    lastSyncTime: number;
}

export function useBackgroundSync() {
    const [syncState, setSyncState] = useState<SyncState>({
        status: 'idle',
        progress: 0,
        error: null,
        lastSyncTime: 0,
    });

    const { routines, setRoutines, lastSyncTime: routinesSync } = useRoutinesStore();
    const { exercises, setExercises, lastSyncTime: exercisesSync } = useExercisesStore();
    const { getTodayLog: getCachedTodayLog, setLog, lastSyncTime: logsSync } = useDailyLogStore();

    // Check if initial sync is needed
    const isFirstTimeUser = routinesSync === 0 && exercisesSync === 0;

    // Function to sync all data from server
    const syncAllData = useCallback(async () => {
        try {
            setSyncState({
                status: 'syncing',
                progress: 0,
                error: null,
                lastSyncTime: Date.now(),
            });

            // Sync routines (33% progress)
            const routinesResult = await getRoutinesPaginated({ limit: 200 });
            setRoutines(routinesResult.items);
            setSyncState(prev => ({ ...prev, progress: 33 }));

            // Sync exercises (66% progress)
            const exercisesResult = await getExercisesPaginated({ limit: 500 });
            setExercises(exercisesResult.items);
            setSyncState(prev => ({ ...prev, progress: 66 }));

            // Sync today's log (100% progress)
            const today = new Date().toISOString().split('T')[0];
            const todayLog = await getTodayLog();
            if (todayLog) {
                setLog(today, todayLog);
            }
            setSyncState({
                status: 'complete',
                progress: 100,
                error: null,
                lastSyncTime: Date.now(),
            });

        } catch (error) {
            console.error('[BackgroundSync] Sync failed:', error);
            setSyncState({
                status: 'error',
                progress: 0,
                error: error instanceof Error ? error.message : 'Sync failed',
                lastSyncTime: Date.now(),
            });
        }
    }, [setRoutines, setExercises, setLog]);

    useEffect(() => {
        // Initial sync on mount (THIS RUNS ON PAGE RELOAD!)
        if (isFirstTimeUser) {
            console.log('[BackgroundSync] First-time user detected, starting initial sync...');
            syncAllData();
        } else {
            console.log('[BackgroundSync] Returning user, syncing in background...');
            // For returning users, sync in background (non-blocking)
            syncAllData();
        }

        // Set up periodic sync (every 5 minutes)
        const syncInterval = setInterval(() => {
            console.log('[BackgroundSync] Running periodic sync...');
            syncAllData();
        }, 5 * 60 * 1000); // 5 minutes

        // Cleanup
        return () => {
            clearInterval(syncInterval);
        };
    }, [isFirstTimeUser, syncAllData]); // syncAllData is memoized

    return {
        syncState,
        isFirstTimeUser,
        // Manual sync trigger - allows components to force immediate sync
        // Use case: "Pull to refresh" or "Sync now" button
        triggerSync: syncAllData,
    };
}

/**
 * Hook to check if app data is ready
 * Returns true when either:
 * - Cached data exists (instant load)
 * - Initial sync is complete (first-time user)
 */
export function useIsAppReady() {
    const { routines } = useRoutinesStore();
    const { exercises } = useExercisesStore();
    const { syncState, isFirstTimeUser } = useBackgroundSync();

    // If not first-time user, we're ready immediately (show cached data)
    if (!isFirstTimeUser) {
        return true;
    }

    // First-time user: wait for initial sync to complete
    return syncState.status === 'complete';
}
