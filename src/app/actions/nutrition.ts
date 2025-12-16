"use server";

import { auth } from "@/auth";
import { getDailyLogKey, getUTCDayBounds } from "@/lib/date-utils";
import { prisma } from "@/lib/prisma";

/**
 * Get all active inventory items
 */
export async function getInventoryItems() {
    try {
        const items = await prisma.inventoryItem.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                name: 'asc',
            },
        });
        return items;
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        return [];
    }
}

/**
 * Log nutrition intake (one-tap logging)
 */
export async function logNutrition(
    inventoryItemId: string,
    quantity: number = 1,
    mealType?: string
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        // Create nutrition log
        const nutritionLog = await prisma.nutritionLog.create({
            data: {
                userId: session.user.id,
                inventoryItemId,
                qty: quantity,
                mealType,
                timestamp: new Date(),
            },
            include: {
                inventoryItem: true,
            },
        });

        // Update daily totals
        await updateDailyNutritionTotals(session.user.id, new Date());

        return nutritionLog;
    } catch (error) {
        console.error("Failed to log nutrition:", error);
        throw error;
    }
}

/**
 * Get today's nutrition logs
 */
export async function getTodayNutritionLogs() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const { start, end } = getUTCDayBounds();
        const nutritionLogs = await prisma.nutritionLog.findMany({
            where: {
                userId: session.user.id,
                timestamp: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                inventoryItem: true,
            },
            orderBy: { timestamp: 'desc' },
        });

        return nutritionLogs;
    } catch (error) {
        console.error("Failed to fetch nutrition logs:", error);
        return [];
    }
}

/**
 * Get nutrition totals for a specific date
 */
export async function getNutritionTotals(date: Date) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { protein: 0, carbs: 0, fat: 0, calories: 0 };
        }

        const { start, end } = getUTCDayBounds(date);
        const logs = await prisma.nutritionLog.findMany({
            where: {
                userId: session.user.id,
                timestamp: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                inventoryItem: true,
            },
        });

        const totals = logs.reduce(
            (acc, log) => {
                acc.protein += log.inventoryItem.proteinPerUnit * log.qty;
                acc.carbs += log.inventoryItem.carbsPerUnit * log.qty;
                acc.fat += log.inventoryItem.fatPerUnit * log.qty;
                acc.calories += log.inventoryItem.caloriesPerUnit * log.qty;
                return acc;
            },
            { protein: 0, carbs: 0, fat: 0, calories: 0 }
        );

        return totals;
    } catch (error) {
        console.error("Failed to get nutrition totals:", error);
        return { protein: 0, carbs: 0, fat: 0, calories: 0 };
    }
}

/**
 * Toggle inventory item active status (for bloat detection)
 */
export async function toggleInventoryItem(itemId: string, isActive: boolean) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const updated = await prisma.inventoryItem.update({
            where: { id: itemId },
            data: { isActive },
        });

        return updated;
    } catch (error) {
        console.error("Failed to toggle inventory item:", error);
        throw error;
    }
}

/**
 * INTERNAL: Update daily nutrition totals (auto-aggregation)
 */
async function updateDailyNutritionTotals(userId: string, date: Date) {
    try {
        const { start, end } = getUTCDayBounds(date);
        const logs = await prisma.nutritionLog.findMany({
            where: {
                userId,
                timestamp: {
                    gte: start,
                    lte: end,
                },
            },
            include: {
                inventoryItem: true,
            },
        });

        const totals = logs.reduce(
            (acc, log) => ({
                protein: acc.protein + log.inventoryItem.proteinPerUnit * log.qty,
                carbs: acc.carbs + log.inventoryItem.carbsPerUnit * log.qty,
                fats: acc.fats + log.inventoryItem.fatPerUnit * log.qty,
                calories: acc.calories + log.inventoryItem.caloriesPerUnit * log.qty,
            }),
            { protein: 0, carbs: 0, fats: 0, calories: 0 }
        );

        await prisma.dailyLog.upsert({
            where: {
                userId_date: {
                    userId,
                    date: getDailyLogKey(date),
                },
            },
            update: {
                proteinTotal: totals.protein,
                carbsTotal: totals.carbs,
                fatsTotal: totals.fats,
                caloriesTotal: totals.calories,
            },
            create: {
                userId,
                date: getDailyLogKey(date),
                proteinTotal: totals.protein,
                carbsTotal: totals.carbs,
                fatsTotal: totals.fats,
                caloriesTotal: totals.calories,
            },
        });
    } catch (error) {
        console.error('Failed to update daily nutrition totals:', error);
    }
}
