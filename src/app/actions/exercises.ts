"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Get all exercises (user's + system)
 */
export async function getExercises() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const exercises = await prisma.exercise.findMany({
            where: {
                OR: [
                    { isSystem: true }, // System exercises
                    { userId: session.user.id }, // User's exercises
                    { userId: null }, // Legacy system exercises (safety fallback)
                ],
            },
            orderBy: [
                { isSystem: 'desc' }, // System first
                { name: 'asc' },
            ],
        });

        return exercises;
    } catch (error) {
        console.error("Failed to fetch exercises:", error);
        return [];
    }
}

/**
 * Get exercises with cursor-based pagination, search, and filtering
 */
export async function getExercisesPaginated(params: {
    cursor?: string;
    limit?: number;
    search?: string;
    category?: string;
    includeSystem?: boolean;
    includeUser?: boolean;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const pageSize = Math.min(params.limit || 20, 50); // Cap at 50

        // Build where clause
        const where: any = {
            OR: [],
        };

        // System/User filtering
        if (params.includeSystem !== false) {
            where.OR.push({ isSystem: true });
        }
        if (params.includeUser !== false) {
            where.OR.push({ userId: session.user.id });
        }

        // If both are explicitly disabled, return empty
        if (where.OR.length === 0) {
            return {
                items: [],
                nextCursor: null,
                hasMore: false,
            };
        }

        // Search filter
        if (params.search) {
            where.AND = {
                OR: [
                    { name: { contains: params.search, mode: 'insensitive' } },
                    { description: { contains: params.search, mode: 'insensitive' } },
                ],
            };
        }

        // Category filter
        if (params.category) {
            where.category = params.category;
        }

        // Cursor pagination
        if (params.cursor) {
            where.id = { gt: params.cursor };
        }

        // Fetch pageSize + 1 to detect if more pages exist
        const items = await prisma.exercise.findMany({
            where,
            orderBy: [
                { isSystem: 'desc' }, // System first
                { name: 'asc' },
                { id: 'asc' },        // Deterministic ordering
            ],
            take: pageSize + 1,
        });

        const hasMore = items.length > pageSize;
        const results = hasMore ? items.slice(0, pageSize) : items;
        const nextCursor = hasMore ? results[results.length - 1].id : null;

        return {
            items: results,
            nextCursor,
            hasMore,
        };
    } catch (error) {
        console.error("Failed to fetch paginated exercises:", error);
        return {
            items: [],
            nextCursor: null,
            hasMore: false,
        };
    }
}

/**
 * Get distinct exercise categories (system + user custom)
 */
export async function getExerciseCategories() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const exercises = await prisma.exercise.findMany({
            where: {
                OR: [
                    { isSystem: true },
                    { userId: session.user.id },
                ],
            },
            select: {
                category: true,
            },
            distinct: ['category'],
        });

        return exercises.map(e => e.category);
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return ['Push', 'Pull', 'Legs', 'Core']; // Fallback to defaults
    }
}

/**
 * Create a new exercise (user-owned)
 */
export async function createExercise(data: {
    name: string;
    category: string;
    trackingType?: string;
    defaultSets?: number;
    defaultReps?: number;
    defaultDuration?: number;
    description?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const exercise = await prisma.exercise.create({
            data: {
                name: data.name,
                category: data.category,
                trackingType: data.trackingType || "reps",
                defaultSets: data.defaultSets || 3,
                // Set only the relevant field based on trackingType
                ...(data.trackingType === "seconds"
                    ? { defaultDuration: data.defaultDuration || 60 }
                    : { defaultReps: data.defaultReps || 10 }
                ),
                description: data.description,
                isSystem: false,
                userId: session.user.id,
            },
        });

        return exercise;
    } catch (error) {
        console.error("Failed to create exercise:", error);
        throw error;
    }
}

/**
 * Update an exercise (user-owned only)
 */
export async function updateExercise(
    exerciseId: string,
    data: {
        name?: string;
        category?: string;
        defaultSets?: number;
        defaultReps?: number;
        description?: string;
    }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const existing = await prisma.exercise.findUnique({
            where: { id: exerciseId },
        });

        if (!existing) {
            throw new Error("Exercise not found");
        }

        if (existing.isSystem) {
            throw new Error("Cannot modify system exercises");
        }

        if (existing.userId !== session.user.id) {
            throw new Error("Not authorized to modify this exercise");
        }

        const exercise = await prisma.exercise.update({
            where: { id: exerciseId },
            data,
        });

        return exercise;
    } catch (error) {
        console.error("Failed to update exercise:", error);
        throw error;
    }
}

/**
 * Delete an exercise (user-owned only, cascades to routines)
 */
export async function deleteExercise(exerciseId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Verify ownership
        const existing = await prisma.exercise.findUnique({
            where: { id: exerciseId },
        });

        if (!existing) {
            throw new Error("Exercise not found");
        }

        if (existing.isSystem) {
            throw new Error("Cannot delete system exercises");
        }

        if (existing.userId !== session.user.id) {
            throw new Error("Not authorized to delete this exercise");
        }

        // Delete (cascades to RoutineExercise due to onDelete: Cascade)
        await prisma.exercise.delete({
            where: { id: exerciseId },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to delete exercise:", error);
        throw error;
    }
}
