import { getExercises } from "@/app/actions/exercises";
import { getRoutineById } from "@/app/actions/routines";
import { redirect } from "next/navigation";
import { RoutineBuilderClient } from "./RoutineBuilderClient";

// This page uses auth() which requires headers - mark as dynamic
export const dynamic = 'force-dynamic';

interface RoutineBuilderPageProps {
    params: Promise<{ id: string }>;
}

/**
 * Routine Builder Page - Server Component
 * 
 * Prefetches routine and exercises on the server.
 * Redirects if routine is system (non-editable) or not found.
 */
export default async function RoutineBuilderPage({ params }: RoutineBuilderPageProps) {
    const { id: routineId } = await params;
    
    // Parallel fetch for speed
    const [routine, exercises] = await Promise.all([
        getRoutineById(routineId),
        getExercises(),
    ]);

    // Redirect if routine not found
    if (!routine) {
        redirect('/routines');
    }

    // Redirect if system routine (can't edit)
    if (routine.isSystem) {
        redirect('/routines');
    }

    return (
        <RoutineBuilderClient
            initialRoutine={routine}
            initialExercises={exercises}
        />
    );
}
