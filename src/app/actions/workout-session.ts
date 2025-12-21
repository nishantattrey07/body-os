"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SessionStatus } from "@prisma/client";

// ==============================================
// WORKOUT SESSION ACTIONS
// ==============================================

/**
 * Get the current user's active (IN_PROGRESS) workout session
 */
export async function getActiveSession() {
    const session = await auth();
    if (!session?.user?.id) return null;

    const activeSession = await prisma.workoutSession.findFirst({
        where: {
            userId: session.user.id,
            status: SessionStatus.IN_PROGRESS,
        },
        include: {
            routine: true,
            exercises: {
                include: {
                    exercise: {
                        include: {
                            swapExercise: true,
                        },
                    },
                    sets: true,
                },
                orderBy: { order: 'asc' },
            },
            warmupLogs: true,
        },
    });

    return activeSession;
}

/**
 * Start a new workout session
 */
export async function startWorkoutSession(data: {
    routineId: string;
    preWorkoutEnergy?: number;
    sleepLastNight?: number;
    sleepQuality?: number;
    stressLevel?: number;
    soreness?: number;
    fastedWorkout?: boolean;
    caffeineIntake?: number;
    environment?: string;
    trainingPhase?: string;
    programName?: string;
    mesocycleWeek?: number;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Check for existing active session
    const existing = await getActiveSession();
    if (existing) {
        throw new Error("You have an unfinished workout. Please complete or abandon it first.");
    }

    const now = new Date();

    // Calculate calendar fields
    const dayOfWeek = now.getDay(); // 0-6
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - startOfYear.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    const weekOfYear = Math.ceil(diff / oneWeek);

    // Determine time of day
    const hour = now.getHours();
    let timeOfDay = 'morning';
    if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else if (hour >= 21 || hour < 5) timeOfDay = 'night';

    // Get routine with exercises
    const routine = await prisma.workoutRoutine.findUnique({
        where: { id: data.routineId },
        include: {
            exercises: {
                include: { exercise: true },
                orderBy: { order: 'asc' },
            },
        },
    });

    if (!routine) throw new Error("Routine not found");

    // Create the session with all exercises and prefetch warmup data
    const [workoutSession, warmupChecklist] = await Promise.all([
        prisma.workoutSession.create({
            data: {
                userId: session.user.id,
                routineId: data.routineId,

                // Calendar fields
                date: now,
                dayOfWeek,
                weekOfYear,
                month: now.getMonth() + 1, // 1-12
                year: now.getFullYear(),
                timeOfDay,

                // Pre-workout context
                preWorkoutEnergy: data.preWorkoutEnergy,
                sleepLastNight: data.sleepLastNight,
                sleepQuality: data.sleepQuality,
                stressLevel: data.stressLevel,
                soreness: data.soreness,
                fastedWorkout: data.fastedWorkout ?? false,
                caffeineIntake: data.caffeineIntake,

                // Environment & Periodization
                environment: data.environment,
                trainingPhase: data.trainingPhase,
                programName: data.programName,
                mesocycleWeek: data.mesocycleWeek,

                // Create session exercises from routine (copy config!)
                exercises: {
                    create: routine.exercises.map((re) => ({
                        order: re.order,
                        exerciseId: re.exercise.id,
                        targetSets: re.sets,
                        targetReps: re.reps,
                        targetDuration: re.duration, // For time-based exercises
                        restSeconds: re.restSeconds,
                    })),
                },
            },
            include: {
                routine: true,
                exercises: {
                    include: {
                        exercise: {
                            include: { swapExercise: true },
                        },
                        sets: true,
                    },
                    orderBy: { order: 'asc' },
                },
            },
        }),
        // Prefetch warmup checklist to avoid fetching on component mount
        prisma.warmupChecklist.findMany({
            orderBy: { order: 'asc' },
        }),
    ]);

    return {
        session: workoutSession,
        warmupData: {
            checklist: warmupChecklist,
            progress: [], // Empty array for new session
        },
    };
}

/**
 * Log a single set (crash-proof - saves immediately)
 * Also tracks active workout time by calculating delta since last activity
 */
export async function logSet(data: {
    sessionExerciseId: string;
    setNumber: number;
    targetReps?: number | null;    // For reps-based
    actualReps?: number | null;    // For reps-based
    targetDuration?: number | null; // For time-based (seconds)
    actualSeconds?: number | null;  // For time-based (seconds)
    weight?: number;
    weightUnit?: string;
    rpe?: number;
    painLevel?: number;
    painLocation?: string;
    restTaken?: number;
    tempo?: string;
    isWarmupSet?: boolean;
    isDropSet?: boolean;
    isFailure?: boolean;
    formNotes?: string;
    aggravatedBlockerId?: string;
}) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    // Get the session exercise to find the parent workout session
    const sessionExercise = await prisma.sessionExercise.findUnique({
        where: { id: data.sessionExerciseId },
        include: { session: true },
    });

    if (!sessionExercise) throw new Error("Session exercise not found");

    const now = new Date();
    const workoutSession = sessionExercise.session;

    // Calculate time delta since last activity (or session start)
    const lastActivity = workoutSession.lastActivityAt || workoutSession.startedAt;
    const deltaMs = now.getTime() - lastActivity.getTime();

    // Cap delta at 5 minutes (300 seconds) to avoid counting long pauses
    // If user was away for >5 min, we assume they paused
    const deltaSeconds = Math.min(Math.floor(deltaMs / 1000), 300);

    // Update session's activeSeconds and lastActivityAt
    await prisma.workoutSession.update({
        where: { id: workoutSession.id },
        data: {
            activeSeconds: workoutSession.activeSeconds + deltaSeconds,
            lastActivityAt: now,
        },
    });

    const setLog = await prisma.setLog.create({
        data: {
            sessionExerciseId: data.sessionExerciseId,
            setNumber: data.setNumber,
            targetReps: data.targetReps ?? undefined,
            actualReps: data.actualReps ?? undefined,
            targetDuration: data.targetDuration ?? undefined,
            actualSeconds: data.actualSeconds ?? undefined,
            weight: data.weight ?? 0,
            weightUnit: data.weightUnit ?? 'kg',
            rpe: data.rpe,
            painLevel: data.painLevel,
            painLocation: data.painLocation,
            restTaken: data.restTaken,
            tempo: data.tempo,
            isWarmupSet: data.isWarmupSet ?? false,
            isDropSet: data.isDropSet ?? false,
            isFailure: data.isFailure ?? false,
            formNotes: data.formNotes,
            aggravatedBlockerId: data.aggravatedBlockerId,
        },
        include: {
            sessionExercise: {
                include: { exercise: true },
            },
            aggravatedBlocker: true,
        },
    });

    // Check for pain-based swap suggestion
    let swapSuggestion = null;
    if (data.painLevel && data.painLevel > 3) {
        const exerciseWithSwap = await prisma.exercise.findUnique({
            where: { id: setLog.sessionExercise.exerciseId },
            include: { swapExercise: true },
        });

        if (exerciseWithSwap?.swapExercise) {
            swapSuggestion = {
                from: exerciseWithSwap.name,
                to: exerciseWithSwap.swapExercise.name,
                swapExerciseId: exerciseWithSwap.swapExercise.id,
            };
        }
    }

    return { setLog, swapSuggestion };
}

/**
 * Mark a session exercise as completed
 */
export async function completeExercise(sessionExerciseId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const updated = await prisma.sessionExercise.update({
        where: { id: sessionExerciseId },
        data: { completedAt: new Date() },
        include: {
            exercise: true,
            sets: true,
        },
    });

    return updated;
}

/**
 * Skip an exercise with a reason
 */
export async function skipExercise(sessionExerciseId: string, reason: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const updated = await prisma.sessionExercise.update({
        where: { id: sessionExerciseId },
        data: {
            skipped: true,
            skipReason: reason,
            completedAt: new Date(),
        },
        include: { exercise: true },
    });

    return updated;
}

/**
 * Complete the workout session with post-workout metrics
 */
export async function completeWorkoutSession(
    sessionId: string,
    postData: {
        postWorkoutEnergy?: number;
        pumpRating?: number;
        focusRating?: number;
        overallRating?: number;
        notes?: string;
    }
) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const completed = await prisma.workoutSession.update({
        where: { id: sessionId },
        data: {
            status: SessionStatus.COMPLETED,
            completedAt: new Date(),
            postWorkoutEnergy: postData.postWorkoutEnergy,
            pumpRating: postData.pumpRating,
            focusRating: postData.focusRating,
            overallRating: postData.overallRating,
            notes: postData.notes,
        },
        include: {
            routine: true,
            exercises: {
                include: {
                    exercise: true,
                    sets: true,
                },
            },
        },
    });

    return completed;
}

/**
 * Abandon a workout session
 */
export async function abandonWorkoutSession(sessionId: string) {
    const session = await auth();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const abandoned = await prisma.workoutSession.update({
        where: { id: sessionId },
        data: {
            status: SessionStatus.ABANDONED,
            completedAt: new Date(),
        },
    });

    return abandoned;
}

/**
 * Get workout session history
 */
export async function getSessionHistory(limit: number = 20, offset: number = 0) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const sessions = await prisma.workoutSession.findMany({
        where: { userId: session.user.id },
        include: {
            routine: true,
            exercises: {
                include: {
                    exercise: true,
                    sets: true,
                },
            },
        },
        orderBy: { startedAt: 'desc' },
        take: limit,
        skip: offset,
    });

    return sessions;
}

/**
 * Calculate resume position for an active session
 */
export async function getResumePosition(sessionId: string) {
    const workoutSession = await prisma.workoutSession.findUnique({
        where: { id: sessionId },
        include: {
            exercises: {
                include: { sets: true },
                orderBy: { order: 'asc' },
            },
        },
    });

    if (!workoutSession) return null;

    // Find first incomplete exercise
    const incompleteExercise = workoutSession.exercises.find(
        (e) => !e.completedAt && !e.skipped
    );

    if (!incompleteExercise) {
        return { complete: true, exerciseIndex: workoutSession.exercises.length - 1, setNumber: 0 };
    }

    return {
        complete: false,
        exerciseIndex: incompleteExercise.order - 1,
        setNumber: incompleteExercise.sets.length + 1,
        sessionExerciseId: incompleteExercise.id,
    };
}
