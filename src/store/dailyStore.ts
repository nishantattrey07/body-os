import { createDailyLog, getTodayLog } from '@/app/actions';
import { create } from 'zustand';

interface DailyStats {
    weight: number;
    sleep: number;
    systemMode: 'optimized' | 'saver';
    bootStatus: 'pending' | 'completed';
    proteinTotal: number;
}

interface DailyStatsStore extends DailyStats {
    loading: boolean;
    initialized: boolean;

    // Actions
    loadTodayLog: () => Promise<void>;
    submitCheckIn: (weight: number, sleep: number) => Promise<void>;
    addProtein: (amount: number) => void;
    reset: () => void;
}

const initialState: DailyStats = {
    weight: 0,
    sleep: 0,
    systemMode: 'optimized',
    bootStatus: 'pending',
    proteinTotal: 0,
};

export const useDailyStore = create<DailyStatsStore>((set, get) => ({
    ...initialState,
    loading: false,
    initialized: false,

    loadTodayLog: async () => {
        const { initialized } = get();

        // Only load once per session
        if (initialized) return;

        set({ loading: true });

        try {
            const log = await getTodayLog();

            if (log) {
                // Today's log exists
                set({
                    weight: log.weight || 0,
                    sleep: log.sleepHours || 0,
                    systemMode: (log.sleepHours || 0) < 6 ? 'saver' : 'optimized',
                    bootStatus: 'completed',
                    initialized: true,
                    loading: false,
                });
            } else {
                // No log for today
                set({
                    bootStatus: 'pending',
                    initialized: true,
                    loading: false
                });
            }
        } catch (error) {
            console.error('Failed to load today log:', error);
            set({ loading: false, initialized: true });
        }
    },

    submitCheckIn: async (weight: number, sleep: number) => {
        const mode = sleep < 6 ? 'saver' : 'optimized';

        // Optimistic update
        set({
            weight,
            sleep,
            systemMode: mode,
            bootStatus: 'completed',
        });

        // Save to DB
        try {
            await createDailyLog(weight, sleep);
        } catch (error) {
            console.error('Failed to save check-in:', error);
        }
    },

    addProtein: (amount: number) => {
        set((state) => ({
            proteinTotal: state.proteinTotal + amount,
        }));
    },

    reset: () => {
        set({ ...initialState, initialized: false });
    },
}));
