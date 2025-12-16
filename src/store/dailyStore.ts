import { createDailyLog, getTodayLog } from '@/app/actions/daily-log';
import { InventoryItem } from '@/store/inventoryStore';
import { create } from 'zustand';

interface DailyStats {
    weight: number;
    sleep: number;
    systemMode: 'optimized' | 'saver';
    bootStatus: 'pending' | 'completed';
    proteinTotal: number;
    carbsTotal: number;
    fatsTotal: number;
    caloriesTotal: number;
    waterTotal: number;

    // Targets from UserSettings
    proteinTarget: number;
    carbsTarget: number;
    fatsTarget: number;
    caloriesTarget: number;
    waterTarget: number;
}

interface DailyStatsStore extends DailyStats {
    loading: boolean;
    initialized: boolean;

    // Actions
    loadTodayLog: () => Promise<void>;
    submitCheckIn: (weight: number, sleep: number) => Promise<void>;
    addProtein: (amount: number) => void;
    logNutritionItem: (item: InventoryItem) => Promise<void>;
    logWater: (amount: number) => Promise<void>;
    reset: () => void;
}

const initialState: DailyStats = {
    weight: 0,
    sleep: 0,
    systemMode: 'optimized',
    bootStatus: 'pending',
    proteinTotal: 0,
    carbsTotal: 0,
    fatsTotal: 0,
    caloriesTotal: 0,
    waterTotal: 0,
    proteinTarget: 140,
    carbsTarget: 200,
    fatsTarget: 60,
    caloriesTarget: 2000,
    waterTarget: 4000,
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
            const [log, settings] = await Promise.all([
                getTodayLog(),
                (async () => {
                    const { getUserSettings } = await import('@/app/actions/settings');
                    return getUserSettings();
                })()
            ]);

            if (log) {
                // Today's log exists
                set({
                    weight: log.weight || 0,
                    sleep: log.sleepHours || 0,
                    systemMode: (log.sleepHours || 0) < 6 ? 'saver' : 'optimized',
                    bootStatus: 'completed',
                    proteinTotal: log.proteinTotal || 0,
                    carbsTotal: log.carbsTotal || 0,
                    fatsTotal: log.fatsTotal || 0,
                    caloriesTotal: log.caloriesTotal || 0,
                    waterTotal: log.waterTotal || 0,
                    proteinTarget: settings.proteinTarget,
                    carbsTarget: settings.carbsTarget,
                    fatsTarget: settings.fatsTarget,
                    caloriesTarget: settings.caloriesTarget,
                    waterTarget: settings.waterTarget,
                    initialized: true,
                    loading: false,
                });
            } else {
                // No log for today - still load settings
                set({
                    bootStatus: 'pending',
                    proteinTarget: settings.proteinTarget,
                    carbsTarget: settings.carbsTarget,
                    fatsTarget: settings.fatsTarget,
                    caloriesTarget: settings.caloriesTarget,
                    waterTarget: settings.waterTarget,
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
            await createDailyLog({ weight, sleepHours: sleep });
        } catch (error) {
            console.error('Failed to save check-in:', error);
            // In a real app, we might want to show a toast here too
        }
    },

    addProtein: (amount: number) => {
        // Legacy support if needed, but prefer logNutritionItem
        set((state) => ({
            proteinTotal: state.proteinTotal + amount,
        }));
    },

    logNutritionItem: async (item: InventoryItem) => {
        const state = get();

        // Capture current state for rollback
        const previousState = {
            proteinTotal: state.proteinTotal || 0,
            carbsTotal: state.carbsTotal || 0,
            fatsTotal: state.fatsTotal || 0,
            caloriesTotal: state.caloriesTotal || 0,
        };

        // Calculate expected new totals for instant feedback
        const optimisticState = {
            proteinTotal: previousState.proteinTotal + (item.proteinPerUnit || 0),
            carbsTotal: previousState.carbsTotal + (item.carbsPerUnit || 0),
            fatsTotal: previousState.fatsTotal + (item.fatPerUnit || 0),
            caloriesTotal: previousState.caloriesTotal + (item.caloriesPerUnit || 0),
        };

        // 1. ⚡ Optimistic Update (Instant feedback)
        set(optimisticState);

        try {
            // 2. 🌐 Server Request - returns authoritative totals
            const { logNutrition } = await import('@/app/actions/nutrition');
            const result = await logNutrition(item.id, 1);

            // 3. ✅ Trust Server Values (no reconciliation needed)
            // Server calculated the true totals, use them directly
            if (result.dailyTotals) {
                set({
                    proteinTotal: result.dailyTotals.proteinTotal,
                    carbsTotal: result.dailyTotals.carbsTotal,
                    fatsTotal: result.dailyTotals.fatsTotal,
                    caloriesTotal: result.dailyTotals.caloriesTotal,
                });
            }

        } catch (error) {
            console.error('Failed to log nutrition:', error);

            // 4. ❌ Rollback on Error
            set(previousState);

            throw error; // Let caller show toast
        }
    },

    logWater: async (amount: number) => {
        const state = get();
        const previousWater = state.waterTotal || 0;

        // 1. Optimistic Update
        set({ waterTotal: previousWater + amount });

        // 2. Server Action
        try {
            const { logWater } = await import('@/app/actions/water');
            await logWater(amount);
        } catch (error) {
            console.error('Failed to log water:', error);

            // 3. Rollback
            set({ waterTotal: previousWater });
            throw error;
        }
    },

    reset: () => {
        set({ ...initialState, initialized: false });
    },
}));
