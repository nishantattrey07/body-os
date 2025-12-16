"use server";

import { auth } from "@/auth";
import { getDailyLogKey } from "@/lib/date-utils";
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
 * Get today's warmup progress
 */
export async function getTodayWarmupProgress() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const today = getDailyLogKey();

        const logs = await prisma.warmupLog.findMany({
            where: {
                userId: session.user.id,
                date: today,
            },
            include: {
                warmupChecklist: true,
            },
        });

        return logs;
    } catch (error) {
        console.error("Failed to fetch warmup progress:", error);
        return [];
    }
}

/**
 * Toggle warmup item completion state
 */
export async function toggleWarmupItem(warmupChecklistId: string, completed: boolean) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const today = getDailyLogKey();

        const log = await prisma.warmupLog.upsert({
            where: {
                userId_warmupChecklistId_date: {
                    userId: session.user.id,
                    warmupChecklistId,
                    date: today,
                },
            },
            update: {
                completed,
            },
            create: {
                userId: session.user.id,
                warmupChecklistId,
                date: today,
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
 * DEPRECATED: Use toggleWarmupItem instead
 * Mark warmup item as complete
 */
export async function completeWarmupItem(warmupChecklistId: string) {
    return toggleWarmupItem(warmupChecklistId, true);
}

/**
 * Check if warmup is complete (gatekeeper)
 */
export async function isWarmupComplete() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return false;
        }

        const today = getDailyLogKey();

        // Get all warmup items
        const allWarmups = await prisma.warmupChecklist.findMany();

        // Get today's completed warmups
        const completedWarmups = await prisma.warmupLog.findMany({
            where: {
                userId: session.user.id,
                date: today,
                completed: true,
            },
        });

        // All warmups must be completed
        const isComplete = completedWarmups.length === allWarmups.length;

        console.log('[WARMUP GATEKEEPER]', {
            required: allWarmups.length,
            completed: completedWarmups.length,
            isComplete,
        });

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

