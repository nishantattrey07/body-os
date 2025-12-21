import { getTodayLog } from "@/app/actions/daily-log";
import { getUserSettings } from "@/app/actions/settings";
import { DashboardClient } from "@/components/dashboard/DashboardClient";

// This page uses auth() which requires headers - mark as dynamic
export const dynamic = 'force-dynamic';

/**
 * Dashboard Page - Server Component
 * 
 * Prefetches daily log and settings on the server.
 * No skeleton needed - data arrives with the page.
 */
export default async function Home() {
  // Parallel fetch for speed
  const [dailyLog, settings] = await Promise.all([
    getTodayLog(),
    getUserSettings(),
  ]);

  return (
    <DashboardClient 
      initialDailyLog={dailyLog} 
      initialSettings={settings} 
    />
  );
}
