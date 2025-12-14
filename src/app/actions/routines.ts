"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get all routines (user's + system)
 */
export async function getRoutines() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const routines = await prisma.workoutRoutine.findMany({
            where: {
                OR: [
                    { isSystem: true },
                    { userId: session.user.id },
                ],
            },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
            orderBy: [
                { isSystem: 'desc' }, // System first
                { name: 'asc' },
            ],
        });

        return routines;
    } catch (error) {
        console.error("Failed to fetch routines:", error);
        return [];
    }
}

/**
 * Get a single routine by ID
 */
export async function getRoutineById(routineId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const routine = await prisma.workoutRoutine.findUnique({
            where: { id: routineId },
            include: {
                exercises: {
                    include: {
                        exercise: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });

        return routine;
    } catch (error) {
        console.error("Failed to fetch routine:", error);
        return null;
    }
}

/**
 * Create a new routine
 */
export async function createRoutine(data: {
    name: string;
    description?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const routine = await prisma.workoutRoutine.create({
            data: {
                name: data.name,
                description: data.description,
                isSystem: false,
                userId: session.user.id,
            },
        });

        return routine;
    } catch (error) {
        console.error("Failed to create routine:", error);
        throw error;
    }
}

/**
 * Update a routine (user-owned only)
 */
export async function updateRoutine(
    routineId: string,
    data: {
        name?: string;
        description?: string;
    }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const existing = await prisma.workoutRoutine.findUnique({
            where: { id: routineId },
        });

        if (!existing) {
            throw new Error("Routine not found");
        }

        if (existing.isSystem) {
            throw new Error("Cannot modify system routines");
        }

        if (existing.userId !== session.user.id) {
            throw new Error("Not authorized to modify this routine");
        }

        const routine = await prisma.workoutRoutine.update({
            where: { id: routineId },
            data,
        });

        return routine;
    } catch (error) {
        console.error("Failed to update routine:", error);
        throw error;
    }
}

/**
 * Delete a routine (user-owned only)
 */
export async function deleteRoutine(routineId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const existing = await prisma.workoutRoutine.findUnique({
            where: { id: routineId },
        });

        if (!existing) {
            throw new Error("Routine not found");
        }

        if (existing.isSystem) {
            throw new Error("Cannot delete system routines");
        }

        if (existing.userId !== session.user.id) {
            throw new Error("Not authorized to delete this routine");
        }

        // Delete (cascades to RoutineExercise)
        await prisma.workoutRoutine.delete({
            where: { id: routineId },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete routine:", error);
        throw error;
    }
}

/**
 * Add exercise to routine
 */
export async function addExerciseToRoutine(
    routineId: string,
    exerciseId: string,
    config: {
        sets: number;
        reps: number;
        restSeconds: number;
    }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify routine ownership
        const routine = await prisma.workoutRoutine.findUnique({
            where: { id: routineId },
            include: { exercises: true },
        });

        if (!routine) {
            throw new Error("Routine not found");
        }

        if (routine.isSystem || routine.userId !== session.user.id) {
            throw new Error("Cannot modify this routine");
        }

        // Get next order number
        const maxOrder = routine.exercises.reduce((max, e) => Math.max(max, e.order), 0);

        const routineExercise = await prisma.routineExercise.create({
            data: {
                routineId,
                exerciseId,
                order: maxOrder + 1,
                sets: config.sets,
                reps: config.reps,
                restSeconds: config.restSeconds,
            },
            include: {
                exercise: true,
            },
        });

        return routineExercise;
    } catch (error) {
        console.error("Failed to add exercise to routine:", error);
        throw error;
    }
}

/**
 * Update exercise configuration in routine
 */
export async function updateRoutineExercise(
    routineExerciseId: string,
    config: {
        sets?: number;
        reps?: number;
        restSeconds?: number;
    }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership through routine
        const routineExercise = await prisma.routineExercise.findUnique({
            where: { id: routineExerciseId },
            include: { routine: true },
        });

        if (!routineExercise) {
            throw new Error("Exercise not found in routine");
        }

        if (routineExercise.routine.isSystem || routineExercise.routine.userId !== session.user.id) {
            throw new Error("Cannot modify this routine");
        }

        const updated = await prisma.routineExercise.update({
            where: { id: routineExerciseId },
            data: config,
        });

        return updated;
    } catch (error) {
        console.error("Failed to update routine exercise:", error);
        throw error;
    }
}

/**
 * Remove exercise from routine
 */
export async function removeExerciseFromRoutine(routineExerciseId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const routineExercise = await prisma.routineExercise.findUnique({
            where: { id: routineExerciseId },
            include: { routine: true },
        });

        if (!routineExercise) {
            throw new Error("Exercise not found in routine");
        }

        if (routineExercise.routine.isSystem || routineExercise.routine.userId !== session.user.id) {
            throw new Error("Cannot modify this routine");
        }

        await prisma.routineExercise.delete({
            where: { id: routineExerciseId },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to remove exercise from routine:", error);
        throw error;
    }
}

/**
 * Reorder exercises in a routine
 */
export async function reorderRoutineExercises(
    routineId: string,
    orderedIds: string[] // Array of routineExercise IDs in new order
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const routine = await prisma.workoutRoutine.findUnique({
            where: { id: routineId },
        });

        if (!routine) {
            throw new Error("Routine not found");
        }

        if (routine.isSystem || routine.userId !== session.user.id) {
            throw new Error("Cannot modify this routine");
        }

        // Update order for each exercise
        await Promise.all(
            orderedIds.map((id, index) =>
                prisma.routineExercise.update({
                    where: { id },
                    data: { order: index + 1 },
                })
            )
        );

        return { success: true };
    } catch (error) {
        console.error("Failed to reorder exercises:", error);
        throw error;
    }
}

/**
 * Batch update routine exercises (order and config)
 */
export async function batchUpdateRoutineExercises(
    routineId: string,
    exercises: {
        id: string;
        order: number;
        sets: number;
        reps: number;
        restSeconds: number;
    }[]
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const routine = await prisma.workoutRoutine.findUnique({
            where: { id: routineId },
        });

        if (!routine) {
            throw new Error("Routine not found");
        }

        if (routine.isSystem || routine.userId !== session.user.id) {
            throw new Error("Cannot modify this routine");
        }

        // Apply updates in transaction or parallel
        await prisma.$transaction(
            exercises.map((e) =>
                prisma.routineExercise.update({
                    where: { id: e.id },
                    data: {
                        order: e.order,
                        sets: e.sets,
                        reps: e.reps,
                        restSeconds: e.restSeconds,
                    },
                })
            )
        );

        return { success: true };
    } catch (error) {
        console.error("Failed to batch update routine exercises:", error);
        throw error;
    }
}
