"use server";

import { auth } from "@/auth";
import { getDailyLogKey, getUTCDayBounds } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

/**
 * Log water intake for the current user
 */
export async function logWater(amountMl: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Create water log
        const waterLog = await prisma.waterLog.create({
            data: {
                userId: session.user.id,
                amount: amountMl,
                timestamp: new Date(),
            },
        });

        // Update daily log total
        await updateDailyWaterTotal(session.user.id, new Date());

        return waterLog;
    } catch (error) {
        console.error("Failed to log water:", error);
        throw error;
    }
}

/**
 * Get today's water logs
 */
export async function getTodayWaterLogs() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const { start, end } = getUTCDayBounds();
        const waterLogs = await prisma.waterLog.findMany({
            where: {
                userId: session.user.id,
                timestamp: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        return waterLogs;
    } catch (error) {
        console.error("Failed to fetch water logs:", error);
        return [];
    }
}

/**
 * Get water total for a specific date
 */
export async function getWaterTotal(date: Date) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return 0;
        }

        const { start, end } = getUTCDayBounds(date);
        const waterLogs = await prisma.waterLog.findMany({
            where: {
                userId: session.user.id,
                timestamp: {
                    gte: start,
                    lte: end,
                },
            },
        });

        const total = waterLogs.reduce((sum, log) => sum + log.amount, 0);
        return total;
    } catch (error) {
        console.error("Failed to get water total:", error);
        return 0;
    }
}

/**
 * Internal: Update daily water total
 */
async function updateDailyWaterTotal(userId: string, date: Date) {
    const { start, end } = getUTCDayBounds(date);
    const waterLogs = await prisma.waterLog.findMany({
        where: {
            userId,
            timestamp: {
                gte: start,
                lte: end,
            },
        },
    });

    const waterTotal = waterLogs.reduce((sum, log) => sum + log.amount, 0);

    // Find or create daily log
    const normalizedDate = getDailyLogKey(date);

    await prisma.dailyLog.upsert({
        where: {
            userId_date: {
                userId,
                date: normalizedDate,
            },
        },
        update: {
            waterTotal,
        },
        create: {
            userId,
            date: normalizedDate,
            waterTotal,
        },
    });
}
