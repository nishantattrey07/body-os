import { create } from 'zustand';

/**
 * Workout UI Store
 * 
 * Stores UI-only state that doesn't need to sync to the database.
 * Server data (session, routines) comes from React Query.
 * 
 * This store is for:
 * - Current stage/screen
 * - UI element states (modals, selections)
 * - Derived positions (current exercise index)
 * - Optimistic UI states (pending toggles)
 */

export type WorkoutStage =
    | 'loading'      // Initial load
    | 'select'       // Routine selection
    | 'pre-workout'  // Pre-workout modal
    | 'warmup'       // Warmup checklist
    | 'exercise'     // Active exercise logging
    | 'post-workout' // Post-workout summary
    | 'complete';    // Done

interface WorkoutUIState {
    // Current screen/stage
    stage: WorkoutStage;

    // Selected routine (before starting session)
    selectedRoutineId: string | null;
    selectedRoutine: any | null;

    // Active session ID (after starting)
    sessionId: string | null;

    // Current position in workout
    currentExerciseIndex: number;

    // Warmup state (optimistic)
    warmupItemsCompleted: Set<string>;

    // Modals
    showResumeModal: boolean;
    showExitConfirm: boolean;

    // Workout stats (local tracking)
    setsLoggedCount: number;
    workoutStartTime: Date | null;

    // Actions
    setStage: (stage: WorkoutStage) => void;
    selectRoutine: (routine: any) => void;
    clearRoutineSelection: () => void;
    startSession: (sessionId: string, warmupData?: { checklist: any[]; progress: any[] }) => void;
    toggleWarmupItem: (itemId: string) => void;
    initWarmupProgress: (completedIds: string[]) => void;
    completeWarmup: () => void;
    advanceExercise: () => void;
    goToExercise: (index: number) => void;
    incrementSetsLogged: (count?: number) => void;
    setShowResumeModal: (show: boolean) => void;
    setShowExitConfirm: (show: boolean) => void;
    reset: () => void;

    // Hydration from server data
    hydrateFromSession: (session: any | null) => void;
}

const initialState = {
    stage: 'loading' as WorkoutStage,
    selectedRoutineId: null,
    selectedRoutine: null,
    sessionId: null,
    currentExerciseIndex: 0,
    warmupItemsCompleted: new Set<string>(),
    showResumeModal: false,
    showExitConfirm: false,
    setsLoggedCount: 0,
    workoutStartTime: null,
};

export const useWorkoutUIStore = create<WorkoutUIState>()((set, get) => ({
    ...initialState,

    setStage: (stage) => set({ stage }),

    selectRoutine: (routine) => set({
        selectedRoutineId: routine.id,
        selectedRoutine: routine,
        stage: 'pre-workout',
    }),

    clearRoutineSelection: () => set({
        selectedRoutineId: null,
        selectedRoutine: null,
        stage: 'select',
    }),

    startSession: (sessionId, warmupData) => {
        const completedIds = new Set<string>(
            warmupData?.progress
                ?.filter((log: any) => log.completed)
                .map((log: any) => log.warmupChecklistId) || []
        );

        set({
            sessionId,
            stage: 'warmup',
            workoutStartTime: new Date(),
            warmupItemsCompleted: completedIds,
        });
    },

    toggleWarmupItem: (itemId) => set((state) => {
        const newCompleted = new Set(state.warmupItemsCompleted);
        if (newCompleted.has(itemId)) {
            newCompleted.delete(itemId);
        } else {
            newCompleted.add(itemId);
        }
        return { warmupItemsCompleted: newCompleted };
    }),

    initWarmupProgress: (completedIds) => set({
        warmupItemsCompleted: new Set(completedIds),
    }),

    completeWarmup: () => set({
        stage: 'exercise',
        currentExerciseIndex: 0,
    }),

    advanceExercise: () => set((state) => ({
        currentExerciseIndex: state.currentExerciseIndex + 1,
    })),

    goToExercise: (index) => set({ currentExerciseIndex: index }),

    incrementSetsLogged: (count = 1) => set((state) => ({
        setsLoggedCount: state.setsLoggedCount + count,
    })),

    setShowResumeModal: (show) => set({ showResumeModal: show }),

    setShowExitConfirm: (show) => set({ showExitConfirm: show }),

    reset: () => set(initialState),

    hydrateFromSession: (session) => {
        if (!session) {
            set({ stage: 'select', sessionId: null });
            return;
        }

        // Determine stage based on session state
        let stage: WorkoutStage = 'select';
        if (session.warmupCompleted) {
            stage = 'exercise';
        } else {
            stage = 'warmup';
        }

        // Get completed warmup items from session
        const completedIds = new Set<string>(
            session.warmupLogs
                ?.filter((log: any) => log.completed)
                .map((log: any) => log.warmupChecklistId) || []
        );

        set({
            sessionId: session.id,
            stage,
            warmupItemsCompleted: completedIds,
            currentExerciseIndex: 0, // Could be smarter based on completed exercises
        });
    },
}));
