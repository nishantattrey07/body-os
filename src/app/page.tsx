import { getTodayLog } from "@/app/actions/daily-log";
import { getUserSettings } from "@/app/actions/settings";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

// Disable caching - always fetch fresh data to show correct check-in state
export const dynamic = 'force-dynamic';

export default async function Home() {
  // Fetch data on the server for instant LCP
  const [log, userSettings] = await Promise.all([
    getTodayLog(),
    getUserSettings(),
  ]);

  return (
    <DashboardClient 
      initialLog={log} 
      initialSettings={userSettings} 
    />
  );
}
