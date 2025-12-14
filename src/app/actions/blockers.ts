"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { BlockerStatus } from "@prisma/client";

// ==============================================
// PHYSICAL BLOCKER ACTIONS (Body Observability)
// ==============================================

/**
 * Create a new physical blocker (injury/issue)
 * Automatically creates the first BlockerEntry with initial severity
 */
export async function createBlocker(data: {
    name: string;
    bodyPart: string;
    severity: number;
    notes?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Create blocker with initial entry
    const blocker = await prisma.physicalBlocker.create({
        data: {
            userId: session.user.id,
            name: data.name,
            bodyPart: data.bodyPart,
            severity: data.severity,
            notes: data.notes,
            // Create first entry automatically
            entries: {
                create: {
                    severity: data.severity,
                    notes: `Initial report: ${data.notes || 'No notes'}`,
                },
            },
        },
        include: {
            entries: {
                orderBy: { date: 'desc' },
            },
        },
    });

    return blocker;
}

/**
 * Update a blocker's status (and create history entry)
 */
export async function updateBlockerStatus(
    blockerId: string,
    status: BlockerStatus,
    severity?: number,
    notes?: string
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Use transaction to update both blocker and create entry
    const result = await prisma.$transaction(async (tx) => {
        // Update the blocker
        const updatedBlocker = await tx.physicalBlocker.update({
            where: { id: blockerId },
            data: {
                status,
                severity: severity ?? undefined,
                resolvedAt: status === BlockerStatus.RESOLVED ? new Date() : undefined,
            },
        });

        // Create history entry
        await tx.blockerEntry.create({
            data: {
                blockerId,
                severity: severity ?? updatedBlocker.severity,
                notes: notes || `Status changed to ${status}`,
            },
        });

        return updatedBlocker;
    });

    return result;
}

/**
 * Log a severity update (daily check-in on blocker)
 */
export async function logBlockerSeverity(
    blockerId: string,
    severity: number,
    notes?: string
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Create entry and optionally update blocker severity
    const [entry] = await prisma.$transaction([
        prisma.blockerEntry.create({
            data: {
                blockerId,
                severity,
                notes,
            },
        }),
        prisma.physicalBlocker.update({
            where: { id: blockerId },
            data: { severity },
        }),
    ]);

    return entry;
}

/**
 * Get all active blockers for current user
 */
export async function getActiveBlockers() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const blockers = await prisma.physicalBlocker.findMany({
        where: {
            userId: session.user.id,
            status: {
                in: [BlockerStatus.ACTIVE, BlockerStatus.RECOVERING],
            },
        },
        include: {
            entries: {
                orderBy: { date: 'desc' },
                take: 5, // Last 5 entries for mini-graph
            },
        },
        orderBy: { startDate: 'desc' },
    });

    return blockers;
}

/**
 * Get all blockers (including resolved)
 */
export async function getAllBlockers() {
    const session = await auth();
    if (!session?.user?.id) return [];

    const blockers = await prisma.physicalBlocker.findMany({
        where: { userId: session.user.id },
        include: {
            entries: {
                orderBy: { date: 'desc' },
            },
            aggravatedByLogs: {
                include: {
                    sessionExercise: {
                        include: { exercise: true },
                    },
                },
                take: 10,
            },
        },
        orderBy: { startDate: 'desc' },
    });

    return blockers;
}

/**
 * Get blocker details with full history
 */
export async function getBlockerDetails(blockerId: string) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const blocker = await prisma.physicalBlocker.findUnique({
        where: { id: blockerId },
        include: {
            entries: {
                orderBy: { date: 'asc' }, // Chronological for graph
            },
            aggravatedByLogs: {
                include: {
                    sessionExercise: {
                        include: {
                            exercise: true,
                            session: {
                                select: { date: true, routine: { select: { name: true } } },
                            },
                        },
                    },
                },
                orderBy: { completedAt: 'desc' },
            },
        },
    });

    return blocker;
}

/**
 * Get exercises that trigger a specific blocker
 */
export async function getBlockerTriggers(blockerId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Get all sets that aggravated this blocker, grouped by exercise
    const logs = await prisma.setLog.findMany({
        where: { aggravatedBlockerId: blockerId },
        include: {
            sessionExercise: {
                include: { exercise: true },
            },
        },
    });

    // Count occurrences per exercise
    const exerciseCounts: Record<string, { exercise: any; count: number; avgPain: number }> = {};

    for (const log of logs) {
        const exerciseId = log.sessionExercise.exerciseId;
        if (!exerciseCounts[exerciseId]) {
            exerciseCounts[exerciseId] = {
                exercise: log.sessionExercise.exercise,
                count: 0,
                avgPain: 0,
            };
        }
        exerciseCounts[exerciseId].count++;
        exerciseCounts[exerciseId].avgPain += log.painLevel || 0;
    }

    // Calculate averages and sort by count
    const triggers = Object.values(exerciseCounts)
        .map((t) => ({
            ...t,
            avgPain: t.avgPain / t.count,
        }))
        .sort((a, b) => b.count - a.count);

    return triggers;
}

/**
 * Mark blocker as resolved
 */
export async function resolveBlocker(blockerId: string, notes?: string) {
    return updateBlockerStatus(blockerId, BlockerStatus.RESOLVED, 0, notes || "Fully healed");
}

/**
 * Mark blocker as chronic (permanent issue to manage)
 */
export async function markBlockerChronic(blockerId: string, notes?: string) {
    return updateBlockerStatus(
        blockerId,
        BlockerStatus.CHRONIC,
        undefined,
        notes || "Marked as chronic condition to manage"
    );
}
