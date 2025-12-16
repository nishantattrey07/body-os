"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Log dead hang time
 */
export async function logDeadHang(seconds: number) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const log = await prisma.deadHangLog.create({
            data: {
                userId: session.user.id,
                seconds,
                date: new Date(),
            },
        });

        return log;
    } catch (error) {
        console.error("Failed to log dead hang:", error);
        throw error;
    }
}

/**
 * Get dead hang history for chart
 */
export async function getDeadHangHistory(limit: number = 30) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const logs = await prisma.deadHangLog.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                date: 'desc',
            },
            take: limit,
        });

        return logs.reverse(); // Oldest to newest for chart
    } catch (error) {
        console.error("Failed to fetch dead hang history:", error);
        return [];
    }
}

/**
 * Upload progress photo
 */
export async function uploadProgressPhoto(imagePath: string, type: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }

        const photo = await prisma.progressPhoto.create({
            data: {
                userId: session.user.id,
                imagePath,
                type,
                date: new Date(),
            },
        });

        return photo;
    } catch (error) {
        console.error("Failed to upload progress photo:", error);
        throw error;
    }
}

/**
 * Get progress photos by type
 */
export async function getProgressPhotos(type?: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        const photos = await prisma.progressPhoto.findMany({
            where: {
                userId: session.user.id,
                ...(type && { type }),
            },
            orderBy: {
                date: 'desc',
            },
        });

        return photos;
    } catch (error) {
        console.error("Failed to fetch progress photos:", error);
        return [];
    }
}

/**
 * Get latest photo of each type (for comparison)
 */
export async function getLatestPhotosByType() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return [];
        }

        // Single query to get all photos, then group by type and take latest
        const allPhotos = await prisma.progressPhoto.findMany({
            where: {
                userId: session.user.id,
                type: { in: ['front', 'side', 'back'] },
            },
            orderBy: {
                date: 'desc',
            },
        });

        // Group by type and take the first (latest) of each
        const latestByType = new Map<string, typeof allPhotos[0]>();
        for (const photo of allPhotos) {
            if (!latestByType.has(photo.type)) {
                latestByType.set(photo.type, photo);
            }
        }

        return Array.from(latestByType.values());
    } catch (error) {
        console.error("Failed to fetch latest photos:", error);
        return [];
    }
}
