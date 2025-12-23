import { WorkoutClient } from "@/components/workout/WorkoutClient";

/**
 * Workout Page - Server Component
 *
 * OFFLINE-FIRST: No server-side data fetching.
 * WorkoutClient reads routines instantly from Zustand store and syncs active session in background.
 */
export default async function WorkoutPage() {
  return <WorkoutClient />;
}
