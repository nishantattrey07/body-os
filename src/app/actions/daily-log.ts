"use server";

import { auth } from "@/auth";
import { daysAgo, endOfDay, startOfDay } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

/**
 * Create or update daily log (morning check-in)
 */
export async function createDailyLog(data: {
    weight?: number;
    sleepHours?: number;
    sleepQuality?: number;
    mood?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const today = startOfDay(new Date());

        const log = await prisma.dailyLog.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
            update: {
                weight: data.weight,
                sleepHours: data.sleepHours,
                sleepQuality: data.sleepQuality,
                mood: data.mood,
            },
            create: {
                userId: session.user.id,
                date: today,
                weight: data.weight,
                sleepHours: data.sleepHours,
                sleepQuality: data.sleepQuality,
                mood: data.mood,
            },
        });

        return log;
    } catch (error) {
        console.error("Failed to create/update daily log:", error);
        throw error;
    }
}

/**
 * Get today's daily log
 */
export async function getTodayLog() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return null;
        }

        const today = startOfDay(new Date());

        const log = await prisma.dailyLog.findUnique({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
            include: {
                dailyReview: true,
            },
        });

        return log;
    } catch (error) {
        console.error("Failed to fetch today's log:", error);
        return null;
    }
}

/**
 * Mark bloat status for today
 */
export async function markBloated(bloated: boolean) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const today = startOfDay(new Date());

        const log = await prisma.dailyLog.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
            update: {
                bloated,
            },
            create: {
                userId: session.user.id,
                date: today,
                bloated,
            },
        });

        // Check bloat pattern and trigger smart logic
        await checkBloatPattern(session.user.id);

        return log;
    } catch (error) {
        console.error("Failed to mark bloat status:", error);
        throw error;
    }
}

/**
 * Submit daily review (end of day questionnaire)
 */
export async function submitDailyReview(data: {
    tookSoya?: boolean;
    elbowStatus?: string;
    notes?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const today = startOfDay(new Date());

        // Ensure daily log exists
        const dailyLog = await prisma.dailyLog.upsert({
            where: {
                userId_date: {
                    userId: session.user.id,
                    date: today,
                },
            },
            update: {},
            create: {
                userId: session.user.id,
                date: today,
            },
        });

        // Create or update daily review
        const review = await prisma.dailyReview.upsert({
            where: {
                dailyLogId: dailyLog.id,
            },
            update: {
                tookSoya: data.tookSoya,
                elbowStatus: data.elbowStatus,
                notes: data.notes,
            },
            create: {
                dailyLogId: dailyLog.id,
                date: today,
                tookSoya: data.tookSoya,
                elbowStatus: data.elbowStatus,
                notes: data.notes,
            },
        });

        return review;
    } catch (error) {
        console.error("Failed to submit daily review:", error);
        throw error;
    }
}

/**
 * SMART LOGIC: Check bloat pattern and disable high-soya items
 * If bloated for 2+ consecutive days, disable 100g soya
 */
async function checkBloatPattern(userId: string) {
    try {
        // Get last 3 days of logs
        const threeDaysAgo = daysAgo(3);
        const logs = await prisma.dailyLog.findMany({
            where: {
                userId,
                date: {
                    gte: threeDaysAgo,
                },
            },
            orderBy: {
                date: 'desc',
            },
            take: 3,
        });

        if (logs.length < 2) return;

        // Check if last 2 days were bloated
        const consecutiveBloat = logs.slice(0, 2).every(log => log.bloated);

        if (consecutiveBloat) {
            console.log('[SMART LOGIC] Detected consecutive bloat, disabling high-volume soya');

            // Disable high-volume soya items
            await prisma.inventoryItem.updateMany({
                where: {
                    AND: [
                        { name: { contains: '100g' } },
                        { name: { contains: 'Soya' } },
                    ],
                },
                data: {
                    isActive: false,
                },
            });
        } else {
            // Re-enable if bloat resolved
            const noBloat = logs.slice(0, 2).every(log => !log.bloated);
            if (noBloat) {
                await prisma.inventoryItem.updateMany({
                    where: {
                        name: {
                            contains: 'Soya',
                        },
                    },
                    data: {
                        isActive: true,
                    },
                });
            }
        }
    } catch (error) {
        console.error('Failed to check bloat pattern:', error);
    }
}

/**
 * Get daily logs for a date range (for progress tracking)
 */
export async function getDailyLogs(startDate: Date, endDate: Date) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const logs = await prisma.dailyLog.findMany({
            where: {
                userId: session.user.id,
                date: {
                    gte: startOfDay(startDate),
                    lte: endOfDay(endDate),
                },
            },
            include: {
                dailyReview: true,
            },
            orderBy: {
                date: 'desc',
            },
        });

        return logs;
    } catch (error) {
        console.error('Failed to fetch daily logs:', error);
        return [];
    }
}
