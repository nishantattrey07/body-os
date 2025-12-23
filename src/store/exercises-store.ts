import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Exercises Store - Offline-first data layer for exercise library
 * 
 * Caches all exercises (system + user-created) in localStorage.
 * Provides instant access without server roundtrips.
 */

export interface Exercise {
    id: string;
    name: string;
    category: string;
    trackingType: string;
    defaultReps: number | null;
    defaultDuration: number | null;
    defaultSets: number;
    description: string | null;
    equipment: string | null;
    isSystem: boolean;
    userId: string | null;
    swapExerciseId: string | null;
}

interface ExercisesState {
    // Data
    exercises: Exercise[];
    lastSyncTime: number;

    // Actions
    setExercises: (exercises: Exercise[]) => void;
    addExercise: (exercise: Exercise) => void;
    updateExercise: (id: string, updates: Partial<Exercise>) => void;
    deleteExercise: (id: string) => void;
    markSynced: () => void;

    // Helpers
    getExerciseById: (id: string) => Exercise | undefined;
    getExercisesByCategory: (category: string) => Exercise[];
    getUserExercises: () => Exercise[];
    getSystemExercises: () => Exercise[];
    searchExercises: (query: string) => Exercise[];
}

export const useExercisesStore = create<ExercisesState>()(
    persist(
        (set, get) => ({
            // Initial state
            exercises: [],
            lastSyncTime: 0,

            // Set all exercises (from server sync)
            setExercises: (exercises) => set({
                exercises,
                lastSyncTime: Date.now()
            }),

            // Add new exercise (optimistic update)
            addExercise: (exercise) => set((state) => ({
                exercises: [...state.exercises, exercise]
            })),

            // Update existing exercise (optimistic update)
            updateExercise: (id, updates) => set((state) => ({
                exercises: state.exercises.map(e =>
                    e.id === id ? { ...e, ...updates } : e
                )
            })),

            // Delete exercise (optimistic update)
            deleteExercise: (id) => set((state) => ({
                exercises: state.exercises.filter(e => e.id !== id)
            })),

            // Mark as synced (called after successful server sync)
            markSynced: () => set({ lastSyncTime: Date.now() }),

            // Helper: Get exercise by ID
            getExerciseById: (id) => {
                return get().exercises.find(e => e.id === id);
            },

            // Helper: Get exercises by category
            getExercisesByCategory: (category) => {
                return get().exercises.filter(e => e.category === category);
            },

            // Helper: Get user's custom exercises
            getUserExercises: () => {
                return get().exercises.filter(e => !e.isSystem);
            },

            // Helper: Get system exercises
            getSystemExercises: () => {
                return get().exercises.filter(e => e.isSystem);
            },

            // Helper: Search exercises by name
            searchExercises: (query) => {
                const lowerQuery = query.toLowerCase();
                return get().exercises.filter(e =>
                    e.name.toLowerCase().includes(lowerQuery) ||
                    e.description?.toLowerCase().includes(lowerQuery)
                );
            },
        }),
        {
            name: 'body-os-exercises',
            // Only persist data, not helper functions
            partialize: (state) => ({
                exercises: state.exercises,
                lastSyncTime: state.lastSyncTime,
            }),
        }
    )
);
