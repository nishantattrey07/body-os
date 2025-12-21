import { getRoutinesPaginated } from "@/app/actions/routines";
import { abandonWorkoutSession, getActiveSession } from "@/app/actions/workout-session";
import { WorkoutClient } from "@/components/workout/WorkoutClient";

// This page uses auth() which requires headers - mark as dynamic
export const dynamic = 'force-dynamic';

/**
 * Workout Page - Server Component
 * 
 * Fetches session and routines on the server BEFORE rendering.
 * This eliminates the loading skeleton on initial page load.
 * 
 * Data flow:
 * 1. Server fetches session + routines in parallel
 * 2. If session has incomplete warmup, auto-abandon it
 * 3. Pass everything to WorkoutClient for hydration
 */
export default async function WorkoutPage() {
  // Parallel fetch for speed
  const [activeSession, routinesResult] = await Promise.all([
    getActiveSession(),
    getRoutinesPaginated({ limit: 20 }),
  ]);

  // Auto-abandon sessions with incomplete warmup (per existing logic)
  let sessionToPass = activeSession;
  if (activeSession && !activeSession.warmupCompleted) {
    await abandonWorkoutSession(activeSession.id);
    sessionToPass = null;
  }

  return (
    <WorkoutClient
      initialSession={sessionToPass}
      initialRoutines={routinesResult.items}
      initialHasMore={routinesResult.hasMore}
      initialCursor={routinesResult.nextCursor}
    />
  );
}
