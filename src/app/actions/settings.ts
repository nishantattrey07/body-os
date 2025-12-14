"use server";

import { auth } from "@/auth";
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
        proteinTarget: 140,
        carbsTarget: 200,
        fatsTarget: 60,
        caloriesTarget: 2000,
        waterTarget: 4000,
    };
}

export async function updateUserSettings(targets: {
    proteinTarget?: number;
    carbsTarget?: number;
    fatsTarget?: number;
    caloriesTarget?: number;
    waterTarget?: number;
}) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
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
