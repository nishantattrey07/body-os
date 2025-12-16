"use server";

import { auth } from "@/auth";
import { DEFAULTS } from "@/lib/defaults";
import { prisma } from "@/lib/prisma";

export async function getUserSettings() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const settings = await prisma.userSettings.findUnique({
        where: { userId: session.user.id },
    });

    // Return defaults if no settings exist
    return settings || {
        proteinTarget: DEFAULTS.proteinTarget,
        carbsTarget: DEFAULTS.carbsTarget,
        fatsTarget: DEFAULTS.fatsTarget,
        caloriesTarget: DEFAULTS.caloriesTarget,
        waterTarget: DEFAULTS.waterTarget,
        dayCutoffHour: DEFAULTS.dayCutoffHour,
        dayCutoffMinute: DEFAULTS.dayCutoffMinute,
    };
}

export async function updateUserSettings(targets: {
    proteinTarget?: number;
    carbsTarget?: number;
    fatsTarget?: number;
    caloriesTarget?: number;
    waterTarget?: number;
    dayCutoffHour?: number;
    dayCutoffMinute?: number;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    // Validate cutoff times
    if (targets.dayCutoffHour !== undefined) {
        if (targets.dayCutoffHour < 0 || targets.dayCutoffHour > 23) {
            throw new Error("Day cutoff hour must be between 0 and 23");
        }
    }

    if (targets.dayCutoffMinute !== undefined) {
        if (targets.dayCutoffMinute < 0 || targets.dayCutoffMinute > 59) {
            throw new Error("Day cutoff minute must be between 0 and 59");
        }
    }

    return await prisma.userSettings.upsert({
        where: { userId: session.user.id },
        update: targets,
        create: {
            userId: session.user.id,
            ...targets,
        },
    });
}

/**
 * Get day cutoff settings for a specific user (for server-side use)
 */
export async function getDayCutoff(userId?: string) {
    const session = await auth();
    const targetUserId = userId || session?.user?.id;

    if (!targetUserId) {
        // Return defaults if not authenticated
        return { hour: 5, minute: 30 };
    }

    try {
        const settings = await prisma.userSettings.findUnique({
            where: { userId: targetUserId },
        });

        // Use safe access in case field doesn't exist in Prisma Client yet
        const hour = (settings as any)?.dayCutoffHour ?? 5;
        const minute = (settings as any)?.dayCutoffMinute ?? 30;

        return { hour, minute };
    } catch (error) {
        // Fallback to defaults on any error (db connection, missing columns, etc)
        console.warn("Failed to fetch cutoff settings, using defaults:", error);
        return { hour: 5, minute: 30 };
    }
}
