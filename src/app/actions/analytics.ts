"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// ==============================================
// ANALYTICS ACTIONS
// ==============================================

/**
 * Get training calendar data for a specific month
 * Returns workout days with completion status
 */
export async function getTrainingCalendar(year: number, month: number) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const sessions = await prisma.workoutSession.findMany({
        where: {
            userId: session.user.id,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
        select: {
            id: true,
            date: true,
            status: true,
            overallRating: true,
            routine: {
                select: { name: true },
            },
            exercises: {
                select: {
                    sets: {
                        select: { id: true },
                    },
                },
            },
        },
        orderBy: { date: 'asc' },
    });

    return sessions.map((s) => ({
        id: s.id,
        date: s.date,
        status: s.status,
        routineName: s.routine?.name || "Custom",
        setsCompleted: s.exercises.reduce((acc, ex) => acc + ex.sets.length, 0),
        overallRating: s.overallRating,
    }));
}

/**
 * Get weekly workout frequency for the last N weeks
 */
export async function getWeeklyFrequency(weeks: number = 8) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - (weeks * 7));

    const sessions = await prisma.workoutSession.findMany({
        where: {
            userId: session.user.id,
            status: "COMPLETED",
            date: { gte: startDate },
        },
        select: {
            date: true,
            weekOfYear: true,
            year: true,
        },
    });

    // Group by week
    const weeklyData: Record<string, number> = {};
    sessions.forEach((s) => {
        const key = `${s.year}-W${s.weekOfYear}`;
        weeklyData[key] = (weeklyData[key] || 0) + 1;
    });

    // Convert to array with labels
    const result = [];
    for (let i = weeks - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - (i * 7));
        const weekNum = Math.ceil((d.getDate() + new Date(d.getFullYear(), 0, 1).getDay()) / 7);
        const key = `${d.getFullYear()}-W${weekNum}`;
        result.push({
            week: `W${weekNum}`,
            workouts: weeklyData[key] || 0,
        });
    }

    return result;
}

/**
 * Get muscle group distribution from completed sessions
 */
export async function getMuscleDistribution(days: number = 30) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all sets from completed sessions
    const setLogs = await prisma.setLog.findMany({
        where: {
            sessionExercise: {
                session: {
                    userId: session.user.id,
                    status: "COMPLETED",
                    date: { gte: startDate },
                },
            },
        },
        include: {
            sessionExercise: {
                include: {
                    exercise: {
                        include: {
                            muscles: {
                                include: {
                                    muscleGroup: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    // Count sets per major region
    const regionCounts: Record<string, number> = {};

    setLogs.forEach((log) => {
        log.sessionExercise.exercise.muscles.forEach((em) => {
            if (em.isPrimary) {
                const region = em.muscleGroup.majorRegion;
                regionCounts[region] = (regionCounts[region] || 0) + 1;
            }
        });
    });

    // Convert to array and sort
    return Object.entries(regionCounts)
        .map(([region, sets]) => ({ region, sets }))
        .sort((a, b) => b.sets - a.sets);
}

/**
 * Get recent workout stats summary
 */
export async function getWorkoutStats(days: number = 30) {
    const session = await auth();
    if (!session?.user?.id) return null;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Total sessions
    const sessions = await prisma.workoutSession.findMany({
        where: {
            userId: session.user.id,
            status: "COMPLETED",
            date: { gte: startDate },
        },
        include: {
            exercises: {
                include: {
                    sets: true,
                },
            },
        },
    });

    if (sessions.length === 0) {
        return {
            totalWorkouts: 0,
            totalSets: 0,
            avgSetsPerWorkout: 0,
            avgRating: 0,
            workoutsThisWeek: 0,
            streak: 0,
        };
    }

    const totalSets = sessions.reduce(
        (acc, s) => acc + s.exercises.reduce((a, e) => a + e.sets.length, 0),
        0
    );

    const ratings = sessions.filter(s => s.overallRating).map(s => s.overallRating!);
    const avgRating = ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    // This week
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const workoutsThisWeek = sessions.filter(
        s => new Date(s.date) >= startOfWeek
    ).length;

    // Calculate streak (consecutive days with workouts)
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        checkDate.setHours(0, 0, 0, 0);

        const hasWorkout = sessions.some(s => {
            const sessionDate = new Date(s.date);
            sessionDate.setHours(0, 0, 0, 0);
            return sessionDate.getTime() === checkDate.getTime();
        });

        if (hasWorkout) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }

    return {
        totalWorkouts: sessions.length,
        totalSets,
        avgSetsPerWorkout: Math.round(totalSets / sessions.length),
        avgRating: Math.round(avgRating * 10) / 10,
        workoutsThisWeek,
        streak,
    };
}

/**
 * Get blocker pain triggers summary
 */
export async function getBlockerTriggersSummary() {
    const session = await auth();
    if (!session?.user?.id) return [];

    // Get all sets that aggravated blockers
    const logs = await prisma.setLog.findMany({
        where: {
            aggravatedBlockerId: { not: null },
            sessionExercise: {
                session: { userId: session.user.id },
            },
        },
        include: {
            sessionExercise: {
                include: {
                    exercise: true,
                },
            },
            aggravatedBlocker: true,
        },
    });

    // Group by exercise
    const exerciseCounts: Record<string, {
        exerciseName: string;
        count: number;
        avgPain: number;
        blockerNames: string[];
    }> = {};

    logs.forEach((log) => {
        const exerciseId = log.sessionExercise.exerciseId;
        if (!exerciseCounts[exerciseId]) {
            exerciseCounts[exerciseId] = {
                exerciseName: log.sessionExercise.exercise.name,
                count: 0,
                avgPain: 0,
                blockerNames: [],
            };
        }
        exerciseCounts[exerciseId].count++;
        exerciseCounts[exerciseId].avgPain += log.painLevel || 0;

        const blockerName = log.aggravatedBlocker?.name;
        if (blockerName && !exerciseCounts[exerciseId].blockerNames.includes(blockerName)) {
            exerciseCounts[exerciseId].blockerNames.push(blockerName);
        }
    });

    return Object.values(exerciseCounts)
        .map((e) => ({
            ...e,
            avgPain: e.count > 0 ? Math.round((e.avgPain / e.count) * 10) / 10 : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
}

/**
 * Get recent session details for history view
 */
export async function getRecentSessions(limit: number = 10) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const sessions = await prisma.workoutSession.findMany({
        where: { userId: session.user.id },
        include: {
            routine: { select: { name: true } },
            exercises: {
                include: {
                    exercise: { select: { name: true } },
                    sets: true,
                },
            },
        },
        orderBy: { date: 'desc' },
        take: limit,
    });

    return sessions.map((s) => {
        const totalSets = s.exercises.reduce((acc, e) => acc + e.sets.length, 0);
        const duration = s.completedAt
            ? Math.round((new Date(s.completedAt).getTime() - new Date(s.startedAt).getTime()) / 60000)
            : null;

        return {
            id: s.id,
            date: s.date,
            routineName: s.routine?.name || "Custom",
            status: s.status,
            exerciseCount: s.exercises.length,
            setCount: totalSets,
            duration,
            overallRating: s.overallRating,
        };
    });
}
