import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Daily Log Store - Offline-first data layer for daily logs
 * 
 * Stores daily logs keyed by date for fast lookups.
 * Keeps last 30 days in cache to minimize storage.
 */

export interface DailyLog {
    id: string;
    date: string | Date; // Support both for compatibility
    weight: number | null;
    sleepHours: number | null;
    sleepQuality: number | null;
    mood: string | null;
    bloated: boolean;
    proteinTotal: number;
    carbsTotal: number;
    fatsTotal: number;
    waterTotal: number;
    caloriesTotal: number;
    dailyReview?: any;
}

interface DailyLogState {
    // Data - keyed by date string for O(1) lookups
    logs: Record<string, DailyLog>;
    lastSyncTime: number;

    // Actions
    setLog: (date: string, log: DailyLog) => void;
    setLogs: (logs: DailyLog[]) => void;
    updateLog: (date: string, updates: Partial<DailyLog>) => void;
    markSynced: () => void;

    // Helpers
    getLogByDate: (date: string) => DailyLog | undefined;
    getTodayLog: () => DailyLog | undefined;
    getRecentLogs: (days: number) => DailyLog[];
    cleanupOldLogs: (keepDays: number) => void;
}

// Helper: Get today's date in YYYY-MM-DD format
function getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
}

export const useDailyLogStore = create<DailyLogState>()(
    persist(
        (set, get) => ({
            // Initial state
            logs: {},
            lastSyncTime: 0,

            // Set a single log for a specific date
            setLog: (date, log) => {
                // Normalize date to string key  
                const dateKey = typeof log.date === 'string' ? log.date : log.date.toISOString().split('T')[0];
                set((state) => ({
                    logs: { ...state.logs, [dateKey]: log }
                }));
            },

            // Set multiple logs (from server sync)
            setLogs: (logs) => {
                const logsMap = logs.reduce((acc, log) => {
                    // Normalize date to string key
                    const dateKey = typeof log.date === 'string' ? log.date : log.date.toISOString().split('T')[0];
                    acc[dateKey] = log;
                    return acc;
                }, {} as Record<string, DailyLog>);

                set({
                    logs: logsMap,
                    lastSyncTime: Date.now()
                });
            },

            // Update existing log
            updateLog: (date, updates) => set((state) => ({
                logs: {
                    ...state.logs,
                    [date]: state.logs[date]
                        ? { ...state.logs[date], ...updates }
                        : updates as DailyLog
                }
            })),

            // Mark as synced (called after successful server sync)
            markSynced: () => set({ lastSyncTime: Date.now() }),

            // Helper: Get log by specific date
            getLogByDate: (date) => {
                return get().logs[date];
            },

            // Helper: Get today's log
            getTodayLog: () => {
                const today = getTodayDateString();
                return get().logs[today];
            },

            // Helper: Get recent logs (sorted newest first)
            getRecentLogs: (days) => {
                const logs = Object.values(get().logs)
                    .sort((a, b) => {
                        const dateA = typeof a.date === 'string' ? a.date : (a.date as Date).toISOString().split('T')[0];
                        const dateB = typeof b.date === 'string' ? b.date : (b.date as Date).toISOString().split('T')[0];
                        return dateB.localeCompare(dateA);
                    })
                    .slice(0, days);
                return logs;
            },

            // Helper: Clean up old logs to save space
            cleanupOldLogs: (keepDays = 30) => {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - keepDays);
                const cutoffString = cutoffDate.toISOString().split('T')[0];

                set((state) => {
                    const filteredLogs = Object.entries(state.logs)
                        .filter(([date]) => date >= cutoffString)
                        .reduce((acc, [date, log]) => {
                            acc[date] = log;
                            return acc;
                        }, {} as Record<string, DailyLog>);

                    return { logs: filteredLogs };
                });
            },
        }),
        {
            name: 'body-os-daily-logs',
            // Only persist data, not helper functions
            partialize: (state) => ({
                logs: state.logs,
                lastSyncTime: state.lastSyncTime,
            }),
        }
    )
);
