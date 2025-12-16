"use client";

import { useDailyStore } from "@/store/dailyStore";
import { useEffect, useRef } from "react";

/**
 * Hook to refresh data when the page becomes visible again.
 * This handles multi-device sync by fetching fresh data when:
 * - User switches back to this tab/app from another
 * - User unlocks their phone
 * - User returns from another app
 * 
 * Debounced to prevent excessive fetches if visibility changes rapidly.
 */
export function useVisibilityRefresh() {
    const loadTodayLog = useDailyStore((state) => state.loadTodayLog);
    const lastRefreshRef = useRef<number>(Date.now());

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const now = Date.now();
                const timeSinceLastRefresh = now - lastRefreshRef.current;

                // Only refresh if it's been more than 30 seconds since last refresh
                // This prevents excessive fetches when rapidly switching tabs
                if (timeSinceLastRefresh > 30000) {
                    lastRefreshRef.current = now;
                    loadTodayLog();
                }
            }
        };

        // Also refresh on window focus (covers more cases)
        const handleFocus = () => {
            const now = Date.now();
            const timeSinceLastRefresh = now - lastRefreshRef.current;

            if (timeSinceLastRefresh > 30000) {
                lastRefreshRef.current = now;
                loadTodayLog();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
        };
    }, [loadTodayLog]);
}
