import { getExerciseCategories, getExercisesPaginated } from "@/app/actions/exercises";
import { ExercisesClient } from "@/components/exercises/ExercisesClient";

/**
 * Exercises Page - Server Component
 * 
 * Prefetches initial exercises and categories on the server.
 * No skeleton needed - data arrives with the page.
 */
export default async function ExercisesPage() {
  // Parallel fetch for speed
  const [exercisesData, categories] = await Promise.all([
    getExercisesPaginated({
      includeSystem: true,
      includeUser: true,
      limit: 20,
    }),
    getExerciseCategories(),
  ]);

  return (
    <ExercisesClient 
      initialExercises={exercisesData.items}
      initialCursor={exercisesData.nextCursor}
      initialHasMore={exercisesData.hasMore}
      initialCategories={categories}
    />
  );
}
