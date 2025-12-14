"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function getInventoryItems() {
    try {
        const items = await prisma.inventoryItem.findMany();
        return items;
    } catch (error) {
        console.error("Failed to fetch inventory:", error);
        return [];
    }
}

export async function getTodayLog() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return null;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const log = await prisma.dailyLog.findFirst({
            where: {
                userId: session.user.id,
                date: {
                    gte: today,
                    lt: tomorrow,
                },
            },
        });

        console.log('[getTodayLog]', { today, tomorrow, found: !!log });
        return log;
    } catch (error) {
        console.error("Failed to fetch today's log:", error);
        return null;
    }
}

export async function createDailyLog(weight: number, sleep: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Check if today's log exists
        const existing = await prisma.dailyLog.findFirst({
            where: {
                userId: session.user.id,
                date: { gte: today, lt: tomorrow },
            },
        });

        let log;
        if (existing) {
            // Update existing
            log = await prisma.dailyLog.update({
                where: { id: existing.id },
                data: { weight, sleepHours: sleep },
            });
            console.log('[createDailyLog] Updated existing:', existing.id);
        } else {
            // Create new
            log = await prisma.dailyLog.create({
                data: {
                    userId: session.user.id,
                    date: today,
                    weight,
                    sleepHours: sleep,
                },
            });
            console.log('[createDailyLog] Created new:', log.id);
        }

        return log;
    } catch (error) {
        console.error("Failed to create/update daily log:", error);
        return null;
    }
}
