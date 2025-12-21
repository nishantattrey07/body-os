import { getUserSettings } from "@/app/actions/settings";
import { SettingsClient } from "@/components/settings/SettingsClient";

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
