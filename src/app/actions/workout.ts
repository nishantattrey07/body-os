"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get all workout routines
 */
export async function getWorkoutRoutines() {
    try {
        const routines = await prisma.workoutRoutine.findMany({
            include: {
                exercises: {
                    include: {
                        exercise: {
                            include: {
                                swapExercise: true,
                            },
                        },
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });

        return routines;
    } catch (error) {
        console.error("Failed to fetch workout routines:", error);
        return [];
    }
}

/**
 * Get warmup checklist items
 */
export async function getWarmupChecklist() {
    try {
        const items = await prisma.warmupChecklist.findMany({
            orderBy: {
                order: 'asc',
            },
        });

        return items;
    } catch (error) {
        console.error("Failed to fetch warmup checklist:", error);
        return [];
    }
}

/**
 * Get warmup progress for a specific workout session
 */
export async function getSessionWarmupProgress(workoutSessionId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const logs = await prisma.warmupLog.findMany({
            where: {
                userId: session.user.id,
                workoutSessionId,
            },
            include: {
                warmupChecklist: true,
            },
        });

        return logs;
    } catch (error) {
        console.error("Failed to fetch session warmup progress:", error);
        return [];
    }
}

/**
 * Toggle warmup item completion state for a specific session
 */
export async function toggleWarmupItem(workoutSessionId: string, warmupChecklistId: string, completed: boolean) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const log = await prisma.warmupLog.upsert({
            where: {
                userId_warmupChecklistId_workoutSessionId: {
                    userId: session.user.id,
                    warmupChecklistId,
                    workoutSessionId,
                },
            },
            update: {
                completed,
            },
            create: {
                userId: session.user.id,
                warmupChecklistId,
                workoutSessionId,
                completed,
            },
            include: {
                warmupChecklist: true,
            },
        });

        return log;
    } catch (error) {
        console.error("Failed to toggle warmup item:", error);
        throw error;
    }
}

/**
 * Mark warmup as complete for a session
 */
export async function markWarmupComplete(workoutSessionId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const updated = await prisma.workoutSession.update({
            where: { id: workoutSessionId },
            data: { warmupCompleted: true },
        });

        return updated;
    } catch (error) {
        console.error("Failed to mark warmup complete:", error);
        throw error;
    }
}

/**
 * Check if warmup is complete for a specific session
 */
export async function isWarmupComplete(workoutSessionId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return false;
        }

        // Get all warmup items
        const allWarmups = await prisma.warmupChecklist.findMany();

        // Get session's completed warmups
        const completedWarmups = await prisma.warmupLog.findMany({
            where: {
                userId: session.user.id,
                workoutSessionId,
                completed: true,
            },
        });

        // All warmups must be completed
        const isComplete = completedWarmups.length >= allWarmups.length;

        return isComplete;
    } catch (error) {
        console.error("Failed to check warmup status:", error);
        return false;
    }
}

// ==============================================
// DEPRECATED: The following functions used WorkoutLog which has been removed.
// Use the new session-based actions from './workout-session.ts' instead:
// - startWorkoutSession()
// - logSet()
// - completeExercise()
// - skipExercise()
// - completeWorkoutSession()
// - abandonWorkoutSession()
// - getActiveSession()
// - getSessionHistory()
// ==============================================

/**
 * @deprecated Use logSet() from './workout-session.ts' instead
 */
export async function logExercise(_data: {
    exerciseId: string;
    reps: number;
    weight?: number;
    painLevel?: number;
}) {
    throw new Error("DEPRECATED: Use logSet() from './workout-session.ts' instead");
}

/**
 * @deprecated Use getSessionHistory() from './workout-session.ts' instead
 */
export async function getTodayWorkoutLogs() {
    throw new Error("DEPRECATED: Use getActiveSession() or getSessionHistory() from './workout-session.ts'");
}

/**
 * @deprecated Use getSessionHistory() from './workout-session.ts' instead
 */
export async function getWorkoutHistory(_exerciseId: string, _limit: number = 10) {
    throw new Error("DEPRECATED: Use getSessionHistory() from './workout-session.ts'");
}

