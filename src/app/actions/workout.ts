"use server";

import { auth } from "@/auth";
import { endOfDay, startOfDay } from "@/lib/date-utils";
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

        const today = startOfDay(new Date());

        const logs = await prisma.warmupLog.findMany({
            where: {
                userId: session.user.id,
                date: {
                    gte: today,
                    lte: endOfDay(new Date()),
                },
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

        const today = startOfDay(new Date());

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

        const today = startOfDay(new Date());

        // Get all warmup items
        const allWarmups = await prisma.warmupChecklist.findMany();

        // Get today's completed warmups
        const completedWarmups = await prisma.warmupLog.findMany({
            where: {
                userId: session.user.id,
                date: {
                    gte: today,
                    lte: endOfDay(new Date()),
                },
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

/**
 * Log exercise set with pain tracking
 */
export async function logExercise(data: {
    exerciseId: string;
    reps: number;
    weight?: number;
    painLevel?: number;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Check warmup completion first
        const warmupComplete = await isWarmupComplete();
        if (!warmupComplete) {
            throw new Error("Complete warmup before logging exercises");
        }

        // Create workout log
        const workoutLog = await prisma.workoutLog.create({
            data: {
                userId: session.user.id,
                exerciseId: data.exerciseId,
                reps: data.reps,
                weight: data.weight,
                painLevel: data.painLevel,
                date: new Date(),
            },
            include: {
                exercise: {
                    include: {
                        swapExercise: true,
                    },
                },
            },
        });

        // Check if pain-based swap is needed
        let swapSuggestion = null;
        if (data.painLevel && data.painLevel > 3) {
            swapSuggestion = await checkExerciseSwap(data.exerciseId, data.painLevel);
        }

        return {
            workoutLog,
            swapSuggestion,
        };
    } catch (error) {
        console.error("Failed to log exercise:", error);
        throw error;
    }
}

/**
 * SMART LOGIC: Check if exercise should be swapped based on pain level
 */
async function checkExerciseSwap(exerciseId: string, painLevel: number) {
    if (painLevel <= 3) return null;

    try {
        const exercise = await prisma.exercise.findUnique({
            where: { id: exerciseId },
            include: { swapExercise: true },
        });

        if (exercise?.swapExercise) {
            console.log('[SMART LOGIC] Pain-based swap triggered:', {
                from: exercise.name,
                to: exercise.swapExercise.name,
                painLevel,
            });

            return {
                originalExercise: exercise,
                swapToExercise: exercise.swapExercise,
                reason: `High pain level detected (${painLevel}/10)`,
            };
        }

        return null;
    } catch (error) {
        console.error('Failed to check exercise swap:', error);
        return null;
    }
}

/**
 * Get today's workout logs
 */
export async function getTodayWorkoutLogs() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const today = new Date();
        const logs = await prisma.workoutLog.findMany({
            where: {
                userId: session.user.id,
                date: {
                    gte: startOfDay(today),
                    lte: endOfDay(today),
                },
            },
            include: {
                exercise: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return logs;
    } catch (error) {
        console.error("Failed to fetch workout logs:", error);
        return [];
    }
}

/**
 * Get workout history for progress tracking
 */
export async function getWorkoutHistory(exerciseId: string, limit: number = 10) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const logs = await prisma.workoutLog.findMany({
            where: {
                userId: session.user.id,
                exerciseId,
            },
            orderBy: {
                date: 'desc',
            },
            take: limit,
            include: {
                exercise: true,
            },
        });

        return logs;
    } catch (error) {
        console.error("Failed to fetch workout history:", error);
        return [];
    }
}
