import { getRoutinesPaginated } from "@/app/actions/routines";
import { RoutinesClient } from "@/components/routines/RoutinesClient";

/**
 * Routines Page - Server Component
 * 
 * Prefetches initial routines on the server.
 * No skeleton needed - data arrives with the page.
 */
export default async function RoutinesPage() {
  const { items, nextCursor, hasMore } = await getRoutinesPaginated({
    includeSystem: true,
    includeUser: true,
    limit: 20,
  });

  return (
    <RoutinesClient 
      initialRoutines={items}
      initialCursor={nextCursor}
      initialHasMore={hasMore}
    />
  );
}
