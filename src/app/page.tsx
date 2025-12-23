import { DashboardClient } from "@/components/dashboard/DashboardClient";

/**
 * Dashboard Page - Server Component
 *
 * OFFLINE-FIRST: No server-side data fetching.
 * DashboardClient reads instantly from Zustand store (backed by localStorage).
 */
export default async function DashboardPage() {
  return <DashboardClient />;
}
