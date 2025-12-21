import { getUserSettings } from "@/app/actions/settings";
import { SettingsClient } from "@/components/settings/SettingsClient";

// This page uses auth() which requires headers - mark as dynamic
export const dynamic = 'force-dynamic';

/**
 * Settings Page - Server Component
 * 
 * Fetches user settings on the server BEFORE rendering.
 * No skeleton needed - data arrives with the page.
 */
export default async function SettingsPage() {
  const settings = await getUserSettings();

  return <SettingsClient initialSettings={settings} />;
}
