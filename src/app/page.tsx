import { DashboardClient } from "@/components/dashboard/DashboardClient";

export default function Home() {
  // No SSR data fetching needed - DashboardClient uses React Query
  return <DashboardClient />;
}

