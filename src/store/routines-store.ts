import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Routines Store - Offline-first data layer for workout routines
 * 
 * Uses Zustand persist middleware to cache routines in localStorage.
 * This enables instant page loads without waiting for server responses.
 * 
 * Data flow:
 * 1. Components read from this store (instant from localStorage)
 * 2. Background sync updates store with fresh server data
 * 3. Store auto-persists changes to localStorage
 */

interface Exercise {
    id: string;
    name: string;
    category: string;
    trackingType: string;
    defaultReps: number | null;
    defaultDuration: number | null;
    defaultSets: number;
    description: string | null;
    isSystem: boolean;
    swapExercise?: {
        id: string;
        name: string;
    } | null;
}

interface RoutineExercise {
    id: string;
    order: number;
    sets: number;
    reps: number | null;
    duration: number | null;
    restSeconds: number;
    exerciseId: string;
    exercise: Exercise;
}

export interface Routine {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    userId: string | null;
    exercises: RoutineExercise[];
}

interface RoutinesState {
    // Data
    routines: Routine[];
    lastSyncTime: number;

    // Actions
    setRoutines: (routines: Routine[]) => void;
    addRoutine: (routine: Routine) => void;
    updateRoutine: (id: string, updates: Partial<Routine>) => void;
    deleteRoutine: (id: string) => void;
    markSynced: () => void;

    // Helpers
    getRoutineById: (id: string) => Routine | undefined;
    getUserRoutines: () => Routine[];
    getSystemRoutines: () => Routine[];
}

export const useRoutinesStore = create<RoutinesState>()(
    persist(
        (set, get) => ({
            // Initial state
            routines: [],
            lastSyncTime: 0,

            // Set all routines (from server sync)
            setRoutines: (routines) => set({
                routines,
                lastSyncTime: Date.now()
            }),

            // Add new routine (optimistic update)
            addRoutine: (routine) => set((state) => ({
                routines: [...state.routines, routine]
            })),

            // Update existing routine (optimistic update)
            updateRoutine: (id, updates) => set((state) => ({
                routines: state.routines.map(r =>
                    r.id === id ? { ...r, ...updates } : r
                )
            })),

            // Delete routine (optimistic update)
            deleteRoutine: (id) => set((state) => ({
                routines: state.routines.filter(r => r.id !== id)
            })),

            // Mark as synced (called after successful server sync)
            markSynced: () => set({ lastSyncTime: Date.now() }),

            // Helper: Get routine by ID
            getRoutineById: (id) => {
                return get().routines.find(r => r.id === id);
            },

            // Helper: Get user's custom routines
            getUserRoutines: () => {
                return get().routines.filter(r => !r.isSystem);
            },

            // Helper: Get system routines
            getSystemRoutines: () => {
                return get().routines.filter(r => r.isSystem);
            },
        }),
        {
            name: 'body-os-routines',
            // Only persist data, not helper functions
            partialize: (state) => ({
                routines: state.routines,
                lastSyncTime: state.lastSyncTime,
            }),
        }
    )
);
